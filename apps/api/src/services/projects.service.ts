import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  createDefaultCanvasEdges,
  createDefaultCanvasNodes,
  slugifyRoute,
  type CreateProjectRequest,
  type LockScriptRequest,
  type SaveCanvasRequest
} from "@actnow/shared";
import { Prisma } from "@prisma/client";
import { DemoUserService } from "./demo-user.service.js";
import { PrismaService } from "./prisma.service.js";
import { presentWorkspace } from "./workspace-presenter.js";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly demoUser: DemoUserService
  ) {}

  async listProjects() {
    const { workspace } = await this.demoUser.resolveDemoUser();
    const projects = await this.prisma.project.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" },
      take: 24
    });

    return {
      projects: projects.map((project) => ({
        id: project.id,
        title: project.title,
        route: project.route,
        current_stage: project.currentStage,
        status: project.status,
        created_at: project.createdAt.toISOString(),
        updated_at: project.updatedAt.toISOString()
      }))
    };
  }

  async createProject(body: CreateProjectRequest) {
    const initialInput = body.initial_input?.trim();
    if (!initialInput) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "initial_input is required"
      });
    }

    const { user, workspace } = await this.demoUser.resolveDemoUser();
    const title = body.title?.trim() || initialInput.slice(0, 40) || "Untitled Project";
    const route = await this.resolveUniqueRoute(body.route || title);

    const created = await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          workspaceId: workspace.id,
          ownerUserId: user.id,
          title,
          route,
          currentStage: "chat",
          settings: { initial_input: initialInput }
        }
      });

      const episode = await tx.episode.create({
        data: {
          projectId: project.id,
          title: "Episode 1",
          order: 1
        }
      });

      const thread = await tx.agentThread.create({
        data: {
          projectId: project.id,
          focusType: "Project",
          focusId: project.id,
          summary: "Demo project kickoff"
        }
      });

      const message = await tx.agentMessage.create({
        data: {
          threadId: thread.id,
          role: "user",
          content: initialInput
        }
      });

      await tx.agentEvent.create({
        data: {
          threadId: thread.id,
          eventType: "message.created",
          actor: "human",
          payloadJson: { message_id: message.id, role: message.role }
        }
      });

      await tx.scriptDraft.create({
        data: {
          projectId: project.id,
          episodeId: episode.id,
          version: 1,
          content: initialInput,
          source: "initial_input"
        }
      });

      return {
        projectId: project.id,
        workspaceId: workspace.id,
        threadId: thread.id,
        episodeId: episode.id,
        agent_status: "accepted"
      };
    });

    return this.getWorkspace(created.projectId);
  }

  async getWorkspace(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: true,
        scriptDrafts: {
          orderBy: { version: "desc" },
          take: 5
        },
        episodes: {
          orderBy: { order: "asc" },
          include: {
            scenes: {
              orderBy: { order: "asc" },
              include: { shots: { orderBy: { order: "asc" } } }
            }
          }
        },
        canvasDocument: true,
        agentThreads: {
          orderBy: { createdAt: "asc" },
          include: {
            messages: { orderBy: { createdAt: "asc" }, take: 20 },
            events: { orderBy: { createdAt: "asc" }, take: 20 }
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "project not found"
      });
    }

    return presentWorkspace(project);
  }

  async lockScript(projectId: string, body: LockScriptRequest) {
    const version = body.script_version ?? 1;
    if (!Number.isInteger(version) || version < 1) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "script_version must be a positive integer"
      });
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        episodes: { orderBy: { order: "asc" } },
        scriptDrafts: {
          orderBy: { version: "desc" },
          take: 5
        }
      }
    });

    if (!project) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "project not found"
      });
    }

    await this.prisma.$transaction(async (tx) => {
      const episode =
        project.episodes[0] ??
        (await tx.episode.create({
          data: {
            projectId,
            title: "Episode 1",
            order: 1,
            scriptVersion: version
          }
        }));

      const existingDraft = await tx.scriptDraft.findUnique({
        where: { projectId_version: { projectId, version } }
      });

      const draft = existingDraft
        ? await tx.scriptDraft.update({
            where: { id: existingDraft.id },
            data: {
              episodeId: episode.id,
              lockedAt: existingDraft.lockedAt ?? new Date()
            }
          })
        : await tx.scriptDraft.create({
            data: {
              projectId,
              episodeId: episode.id,
              version,
              content: body.content?.trim() || String(project.settings),
              source: "lock",
              lockedAt: new Date()
            }
          });

      const scene =
        (await tx.scene.findUnique({
          where: { episodeId_order: { episodeId: episode.id, order: 1 } }
        })) ??
        (await tx.scene.create({
          data: {
            episodeId: episode.id,
            title: "Scene 1",
            order: 1
          }
        }));

      const shot =
        (await tx.shot.findUnique({
          where: { sceneId_order: { sceneId: scene.id, order: 1 } }
        })) ??
        (await tx.shot.create({
          data: {
            sceneId: scene.id,
            order: 1,
            description: "Opening shot generated from the locked demo script.",
            cameraJson: { framing: "wide", movement: "static" },
            duration: 5
          }
        }));

      const canvasNodes = createDefaultCanvasNodes(projectId, scene.id, shot.id, draft.id) as Prisma.InputJsonValue;
      const canvasEdges = createDefaultCanvasEdges() as Prisma.InputJsonValue;
      const existingCanvas = await tx.canvasDocument.findUnique({ where: { projectId } });
      const canvas = existingCanvas
        ? await tx.canvasDocument.update({
            where: { projectId },
            data: {
              nodesJson: canvasNodes,
              edgesJson: canvasEdges,
              viewportJson: { x: 0, y: 0, zoom: 1 },
              version: { increment: 1 }
            }
          })
        : await tx.canvasDocument.create({
            data: {
              projectId,
              nodesJson: canvasNodes,
              edgesJson: canvasEdges,
              viewportJson: { x: 0, y: 0, zoom: 1 }
            }
          });

      await tx.project.update({
        where: { id: projectId },
        data: { currentStage: "canvas" }
      });

      const thread = await tx.agentThread.findFirstOrThrow({
        where: { projectId },
        orderBy: { createdAt: "asc" }
      });

      await tx.agentEvent.createMany({
        data: [
          {
            threadId: thread.id,
            eventType: "script.locked",
            actor: "system",
            payloadJson: {
              script_draft_id: draft.id,
              script_version: version,
              episode_id: episode.id
            }
          },
          {
            threadId: thread.id,
            eventType: "canvas.initialized",
            actor: "system",
            payloadJson: {
              canvas_id: canvas.id,
              scene_id: scene.id,
              shot_id: shot.id
            }
          }
        ]
      });
    });

    return this.getWorkspace(projectId);
  }

  async saveCanvas(projectId: string, body: SaveCanvasRequest) {
    if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "nodes and edges must be arrays"
      });
    }

    const canvas = await this.prisma.canvasDocument.findUnique({
      where: { projectId }
    });

    if (!canvas) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "canvas document not found"
      });
    }

    if (canvas.version !== body.version) {
      throw new ConflictException({
        code: "VERSION_CONFLICT",
        message: "canvas version conflict",
        details: { expected: canvas.version, received: body.version }
      });
    }

    return this.prisma.canvasDocument.update({
      where: { projectId },
      data: {
        nodesJson: body.nodes as Prisma.InputJsonValue,
        edgesJson: body.edges as Prisma.InputJsonValue,
        viewportJson: (body.viewport ?? {}) as Prisma.InputJsonValue,
        version: { increment: 1 }
      }
    });
  }

  private async resolveUniqueRoute(input: string) {
    const base = slugifyRoute(input);
    let route = base;
    let suffix = 1;

    while (await this.prisma.project.findUnique({ where: { route } })) {
      suffix += 1;
      route = `${base}-${suffix}`;
    }

    return route;
  }
}
