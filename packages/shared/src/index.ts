export const DEMO_USER_EMAIL = "demo@actnow.local";
export const DEMO_USER_NAME = "Demo User";
export const DEMO_WORKSPACE_NAME = "Demo Workspace";

export type ProjectStage = "chat" | "canvas";
export type AgentRole = "user" | "assistant" | "system";
export type AgentEventActor = "human" | "agent" | "system" | "worker";
export type ActNowAgentId = "director" | "screenwriter" | "storyboard" | "asset" | "cinematographer";

export interface CreateProjectRequest {
  title?: string;
  route?: string;
  initial_input: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  route: string;
  current_stage: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LockScriptRequest {
  script_version?: number;
  content?: string;
}

export interface SaveCanvasRequest {
  nodes: unknown[];
  edges: unknown[];
  viewport?: Record<string, unknown>;
  version: number;
}

export interface CreateAgentMessageRequest {
  content: string;
  display_text?: string;
  focus_ref?: {
    type: string;
    id: string;
  };
  client_context?: Record<string, unknown>;
}

export interface AgentAcceptedResponse {
  thread_id: string;
  message_id: string;
  assistant_message_id?: string;
  run_id?: string;
}

export interface AgentEventDto {
  id: string;
  thread_id: string;
  task_id?: string | null;
  event_type: string;
  actor: AgentEventActor | string;
  payload: unknown;
  created_at: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export function slugifyRoute(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `project-${Date.now()}`;
}

export function createDefaultCanvasNodes(projectId: string, sceneId: string, shotId: string, scriptDraftId?: string) {
  return [
    {
      id: "project-brief",
      type: "workflow",
      position: { x: 0, y: 0 },
      data: { label: "Project Brief", ref: { type: "project", id: projectId } }
    },
    {
      id: "script-lock",
      type: "workflow",
      position: { x: 260, y: 0 },
      data: { label: "我的剧本", ref: { type: "script", id: scriptDraftId ?? `${projectId}:current` } }
    },
    {
      id: "scene-outline",
      type: "workflow",
      position: { x: 520, y: 0 },
      data: { label: "Scene Outline", ref: { type: "scene", id: sceneId } }
    },
    {
      id: "shot-plan",
      type: "workflow",
      position: { x: 780, y: 0 },
      data: { label: "Shot Plan", ref: { type: "shot", id: shotId } }
    },
    {
      id: "generation-ready",
      type: "workflow",
      position: { x: 1040, y: 0 },
      data: { label: "Generation Ready", ref: { type: "shot", id: shotId } }
    }
  ];
}

export function createDefaultCanvasEdges() {
  return [
    { id: "edge-project-script", source: "project-brief", target: "script-lock" },
    { id: "edge-script-scene", source: "script-lock", target: "scene-outline" },
    { id: "edge-scene-shot", source: "scene-outline", target: "shot-plan" },
    { id: "edge-shot-generation", source: "shot-plan", target: "generation-ready" }
  ];
}
