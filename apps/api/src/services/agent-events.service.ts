import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateAgentMessageRequest } from "@actnow/shared";
import { Prisma } from "@prisma/client";
import { MultiAgentOrchestratorService } from "./multi-agent-orchestrator.service.js";
import { PrismaService } from "./prisma.service.js";
import { presentWorkspace } from "./workspace-presenter.js";

type ApprovalPayload = {
  approval_id?: string;
  run_id?: string;
  status?: string;
  actions?: ApprovalAction[];
};

type ApprovalAction = {
  action_id?: string;
  action_type?: string;
  target_type?: string;
  target_id?: string | null;
  summary?: string;
  diff?: {
    before?: string | null;
    after?: string;
  };
};

@Injectable()
export class AgentEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: MultiAgentOrchestratorService
  ) {}

  async createThreadMessage(threadId: string, body: CreateAgentMessageRequest) {
    const content = body.content?.trim();
    if (!content) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "content is required"
      });
    }
    const displayText = body.display_text?.trim() || content;

    const thread = await this.prisma.agentThread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "agent thread not found"
      });
    }

    const previousMessages = await this.prisma.agentMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "desc" },
      take: 8
    });

    const run = await this.orchestrator.run({
      userMessage: content,
      threadSummary: thread.summary,
      focusRef: body.focus_ref ?? null,
      clientContext: body.client_context ?? {},
      history: previousMessages
        .reverse()
        .map((message) => ({ role: message.role, content: message.content }))
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const created = await tx.agentMessage.create({
        data: {
          threadId,
          role: "user",
          content,
          modelMetaJson: {
            client_context: body.client_context ?? {},
            display_text: displayText,
            focus_ref: body.focus_ref ?? null
          } as Prisma.InputJsonValue
        }
      });

      await tx.agentEvent.create({
        data: {
          threadId,
          eventType: "message.created",
          actor: "human",
          payloadJson: {
            message_id: created.id,
            text: content,
            display_text: displayText,
            focus_ref: body.focus_ref ?? null
          }
        }
      });

      await tx.agentEvent.create({
        data: {
          threadId,
          taskId: run.run_id,
          eventType: "multi_agent.run_started",
          actor: "agent",
          payloadJson: {
            message_id: created.id,
            run_id: run.run_id,
            model_provider: run.model_provider,
            model_routing: run.model_routing
          }
        }
      });

      await tx.agentEvent.create({
        data: {
          threadId,
          taskId: run.run_id,
          eventType: "multi_agent.route_decided",
          actor: "agent",
          payloadJson: {
            run_id: run.run_id,
            intent: run.route.intent,
            selected_agents: run.route.selected_agents,
            needs_approval: run.route.needs_approval,
            planned_actions: run.route.planned_actions,
            director_message: run.route.director_message,
            used_model: run.route.used_model,
            parse_error: run.route.parse_error,
            model: run.model_routing.director
          } as Prisma.InputJsonValue
        }
      });

      for (const output of run.agents) {
        await tx.agentEvent.create({
          data: {
            threadId,
            taskId: run.run_id,
            eventType: "multi_agent.agent_started",
            actor: "agent",
            payloadJson: {
              run_id: run.run_id,
              agent_id: output.agent_id,
              agent_name: output.agent_name,
              model: output.model
            }
          }
        });

        await tx.agentEvent.create({
          data: {
            threadId,
            taskId: run.run_id,
            eventType: "multi_agent.agent_completed",
            actor: "agent",
            payloadJson: {
              run_id: run.run_id,
              ...output
            } as Prisma.InputJsonValue
          }
        });
      }

      if (run.approval) {
        await tx.agentEvent.create({
          data: {
            threadId,
            taskId: run.run_id,
            eventType: "multi_agent.approval_required",
            actor: "agent",
            payloadJson: run.approval as Prisma.InputJsonValue
          }
        });
      }

      const assistant = await tx.agentMessage.create({
        data: {
          threadId,
          role: "assistant",
          content: run.final_text,
          modelMetaJson: {
            run_id: run.run_id,
            model_provider: run.model_provider,
            model_routing: run.model_routing,
            route: {
              intent: run.route.intent,
              selected_agents: run.route.selected_agents,
              needs_approval: run.route.needs_approval
            },
            agents: run.agents.map((agent) => agent.agent_id),
            approval_id: run.approval?.approval_id ?? null
          } as Prisma.InputJsonValue
        }
      });

      await tx.agentEvent.create({
        data: {
          threadId,
          taskId: run.run_id,
          eventType: "multi_agent.final_message_created",
          actor: "agent",
          payloadJson: {
            message_id: assistant.id,
            text: run.final_text,
            run_id: run.run_id
          }
        }
      });

      return { user: created, assistant };
    });

    return {
      thread_id: threadId,
      message_id: result.user.id,
      assistant_message_id: result.assistant.id,
      run_id: run.run_id
    };
  }

  async listThreadEvents(threadId: string) {
    const thread = await this.prisma.agentThread.findUnique({
      where: { id: threadId },
      include: {
        events: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!thread) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "agent thread not found"
      });
    }

    return {
      events: thread.events.map((event) => ({
        id: event.id,
        thread_id: event.threadId,
        task_id: event.taskId,
        event_type: event.eventType,
        actor: event.actor,
        payload: event.payloadJson,
        created_at: event.createdAt.toISOString()
      }))
    };
  }

  async confirmApproval(approvalId: string) {
    const approvalEvent = await this.findApprovalEvent(approvalId);
    const approval = approvalEvent.payloadJson as ApprovalPayload;

    if (approval.status && approval.status !== "pending") {
      throw new BadRequestException({
        code: "APPROVAL_ALREADY_RESOLVED",
        message: `approval is already ${approval.status}`
      });
    }

    const actions = approval.actions ?? [];
    if (actions.length === 0) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "approval has no actions"
      });
    }

    const workspace = await this.prisma.$transaction(async (tx) => {
      const results = [];

      for (const action of actions) {
        const toolCallId = `tool_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
        await tx.agentEvent.create({
          data: {
            threadId: approvalEvent.threadId,
            taskId: approvalEvent.taskId,
            eventType: "tool.started",
            actor: "agent",
            payloadJson: {
              tool_call_id: toolCallId,
              tool_name: action.action_type,
              approval_id: approvalId,
              target: {
                type: action.target_type,
                id: action.target_id ?? null
              }
            } as Prisma.InputJsonValue
          }
        });

        try {
          const result = await this.executeApprovalAction(tx, approvalEvent.threadId, action);
          results.push(result);
          await tx.agentEvent.create({
            data: {
              threadId: approvalEvent.threadId,
              taskId: approvalEvent.taskId,
              eventType: "tool.completed",
              actor: "system",
              payloadJson: {
                tool_call_id: toolCallId,
                approval_id: approvalId,
                result
              } as Prisma.InputJsonValue
            }
          });
        } catch (error) {
          await tx.agentEvent.create({
            data: {
              threadId: approvalEvent.threadId,
              taskId: approvalEvent.taskId,
              eventType: "tool.failed",
              actor: "system",
              payloadJson: {
                tool_call_id: toolCallId,
                approval_id: approvalId,
                error: error instanceof Error ? error.message : "unknown error"
              }
            }
          });
          throw error;
        }
      }

      await tx.agentEvent.update({
        where: { id: approvalEvent.id },
        data: {
          payloadJson: {
            ...(approval as Record<string, unknown>),
            status: "confirmed",
            resolved_at: new Date().toISOString()
          } as Prisma.InputJsonValue
        }
      });

      await tx.agentEvent.create({
        data: {
          threadId: approvalEvent.threadId,
          taskId: approvalEvent.taskId,
          eventType: "multi_agent.approval_confirmed",
          actor: "human",
          payloadJson: {
            approval_id: approvalId,
            results
          } as Prisma.InputJsonValue
        }
      });

      return this.getWorkspaceByThreadTx(tx, approvalEvent.threadId);
    });

    return {
      approval_id: approvalId,
      status: "confirmed",
      workspace
    };
  }

  async rejectApproval(approvalId: string) {
    const approvalEvent = await this.findApprovalEvent(approvalId);
    const approval = approvalEvent.payloadJson as ApprovalPayload;

    if (approval.status && approval.status !== "pending") {
      throw new BadRequestException({
        code: "APPROVAL_ALREADY_RESOLVED",
        message: `approval is already ${approval.status}`
      });
    }

    const workspace = await this.prisma.$transaction(async (tx) => {
      await tx.agentEvent.update({
        where: { id: approvalEvent.id },
        data: {
          payloadJson: {
            ...(approval as Record<string, unknown>),
            status: "rejected",
            resolved_at: new Date().toISOString()
          } as Prisma.InputJsonValue
        }
      });

      await tx.agentEvent.create({
        data: {
          threadId: approvalEvent.threadId,
          taskId: approvalEvent.taskId,
          eventType: "multi_agent.approval_rejected",
          actor: "human",
          payloadJson: {
            approval_id: approvalId
          }
        }
      });

      return this.getWorkspaceByThreadTx(tx, approvalEvent.threadId);
    });

    return {
      approval_id: approvalId,
      status: "rejected",
      workspace
    };
  }

  private async findApprovalEvent(approvalId: string) {
    const events = await this.prisma.agentEvent.findMany({
      where: {
        eventType: "multi_agent.approval_required"
      },
      orderBy: { createdAt: "desc" }
    });

    const event = events.find((candidate) => {
      const payload = candidate.payloadJson as ApprovalPayload;
      return payload.approval_id === approvalId;
    });

    if (!event) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "approval not found"
      });
    }

    return event;
  }

  private async executeApprovalAction(
    tx: Prisma.TransactionClient,
    threadId: string,
    action: ApprovalAction
  ) {
    if (action.action_type !== "update_shot_description") {
      throw new BadRequestException({
        code: "UNSUPPORTED_APPROVAL_ACTION",
        message: `unsupported approval action: ${action.action_type ?? "unknown"}`
      });
    }

    const nextDescription = action.diff?.after?.trim() || action.summary?.trim();
    if (!nextDescription) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "update_shot_description requires diff.after or summary"
      });
    }

    const thread = await tx.agentThread.findUnique({
      where: { id: threadId },
      include: {
        project: {
          include: {
            episodes: {
              orderBy: { order: "asc" },
              include: {
                scenes: {
                  orderBy: { order: "asc" },
                  include: { shots: { orderBy: { order: "asc" } } }
                }
              }
            }
          }
        }
      }
    });

    if (!thread) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "agent thread not found"
      });
    }

    const fallbackShot = thread.project.episodes
      .flatMap((episode) => episode.scenes)
      .flatMap((scene) => scene.shots)[0];
    const shotId = action.target_id || fallbackShot?.id;

    if (!shotId) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "no shot available for update"
      });
    }

    const shot = await tx.shot.findUnique({ where: { id: shotId } });
    if (!shot) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "shot not found"
      });
    }

    const updated = await tx.shot.update({
      where: { id: shot.id },
      data: {
        description: nextDescription,
        version: { increment: 1 }
      }
    });

    return {
      action_id: action.action_id ?? null,
      action_type: action.action_type,
      target_type: "shot",
      target_id: updated.id,
      before: shot.description,
      after: updated.description,
      version: updated.version
    };
  }

  private async getWorkspaceByThreadTx(tx: Prisma.TransactionClient, threadId: string) {
    const thread = await tx.agentThread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "agent thread not found"
      });
    }

    const project = await tx.project.findUnique({
      where: { id: thread.projectId },
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
}
