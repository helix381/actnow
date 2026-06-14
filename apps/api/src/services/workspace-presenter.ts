import type { Prisma } from "@prisma/client";

type WorkspaceProject = Prisma.ProjectGetPayload<{
  include: {
    workspace: true;
    scriptDrafts: true;
    episodes: {
      include: {
        scenes: {
          include: { shots: true };
        };
      };
    };
    canvasDocument: true;
    agentThreads: {
      include: {
        messages: true;
        events: true;
      };
    };
  };
}>;

export function presentWorkspace(project: WorkspaceProject) {
  const agentThread = project.agentThreads[0] ?? null;
  const scenes = project.episodes.flatMap((episode) =>
    episode.scenes.map((scene) => ({
      id: scene.id,
      project_id: project.id,
      episode_id: scene.episodeId,
      title: scene.title,
      order_index: scene.order,
      status: scene.status
    }))
  );
  const shots = project.episodes.flatMap((episode) =>
    episode.scenes.flatMap((scene) =>
      scene.shots.map((shot) => ({
        id: shot.id,
        scene_id: shot.sceneId,
        title: `Shot ${shot.order}`,
        order_index: shot.order,
        description: shot.description,
        status: shot.status,
        version: shot.version
      }))
    )
  );

  return {
    project: {
      id: project.id,
      title: project.title,
      route: project.route,
      current_stage: project.currentStage,
      status: project.status,
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString()
    },
    workspace: {
      id: project.workspace.id,
      name: project.workspace.name,
      mode: project.workspace.mode
    },
    canvas: project.canvasDocument
      ? {
          project_id: project.id,
          nodes: project.canvasDocument.nodesJson,
          edges: project.canvasDocument.edgesJson,
          viewport: project.canvasDocument.viewportJson,
          version: project.canvasDocument.version
        }
      : null,
    agent_thread: agentThread
      ? {
          id: agentThread.id,
          project_id: agentThread.projectId,
          mode: agentThread.mode,
          status: agentThread.status,
          focus_ref: agentThread.focusId
            ? { type: agentThread.focusType.toLowerCase(), id: agentThread.focusId }
            : null,
          summary: agentThread.summary,
          messages: agentThread.messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            created_at: message.createdAt.toISOString()
          })),
          events: agentThread.events.map((event) => ({
            id: event.id,
            thread_id: event.threadId,
            task_id: event.taskId,
            event_type: event.eventType,
            actor: event.actor,
            payload: event.payloadJson,
            created_at: event.createdAt.toISOString()
          }))
        }
      : null,
    episodes: project.episodes.map((episode) => ({
      id: episode.id,
      project_id: episode.projectId,
      title: episode.title,
      order_index: episode.order,
      script_version: episode.scriptVersion,
      status: episode.status
    })),
    script_drafts: project.scriptDrafts.map((draft) => ({
      id: draft.id,
      project_id: draft.projectId,
      episode_id: draft.episodeId,
      version: draft.version,
      content: draft.content,
      source: draft.source,
      locked_at: draft.lockedAt?.toISOString() ?? null,
      created_at: draft.createdAt.toISOString(),
      updated_at: draft.updatedAt.toISOString()
    })),
    scenes,
    shots
  };
}
