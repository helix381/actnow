export type Project = {
  id: string;
  title: string;
  route?: "short_drama" | "comic_drama";
  current_stage?: "chat" | "canvas" | string;
  created_at?: string;
  updated_at?: string;
};

export type ProjectSummary = {
  id: string;
  title: string;
  route: string;
  current_stage: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AgentThread = {
  id: string;
  project_id: string;
  focus_ref?: EntityRef;
};

export type AgentEvent = {
  id: string;
  thread_id: string;
  task_id?: string | null;
  event_type: string;
  actor: "human" | "agent" | "system" | "worker";
  payload?: Record<string, unknown>;
  created_at: string;
};

export type EntityRef = {
  type: "project" | "script" | "scene" | "shot" | "asset" | "generation_task";
  id: string;
};

export type CanvasNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    status?: string;
    ref: EntityRef;
    summary?: string;
  };
};

export type CanvasEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type CanvasDocument = {
  project_id: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
  version: number;
};

export type Scene = {
  id: string;
  project_id: string;
  title: string;
  order_index: number;
};

export type Shot = {
  id: string;
  scene_id: string;
  title: string;
  order_index: number;
  description?: string;
};

export type ScriptDraft = {
  id: string;
  project_id: string;
  episode_id?: string | null;
  version: number;
  content: string;
  source: string;
  locked_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type WorkspaceAggregate = {
  project: Project;
  canvas: CanvasDocument;
  agent_thread: AgentThread;
  script_drafts?: ScriptDraft[];
  scenes?: Scene[];
  shots?: Shot[];
  assets?: unknown[];
};

export type CreateProjectRequest = {
  title?: string;
  route?: "short_drama" | "comic_drama";
  initial_input: string;
};

export type CreateAgentMessageRequest = {
  content: string;
  display_text?: string;
  focus_ref?: EntityRef;
  client_context?: Record<string, unknown>;
};

export type CreateAgentMessageResponse = {
  thread_id: string;
  message_id: string;
  assistant_message_id?: string;
  run_id?: string;
};

export type ApprovalResponse = {
  approval_id: string;
  status: "confirmed" | "rejected" | string;
  workspace: WorkspaceAggregate;
};

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function createProject(input: CreateProjectRequest): Promise<WorkspaceAggregate> {
  return request<WorkspaceAggregate>("/projects", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const body = await request<{ projects: ProjectSummary[] }>("/projects");
  return body.projects;
}

export async function getWorkspace(projectId: string): Promise<WorkspaceAggregate> {
  return request<WorkspaceAggregate>(`/projects/${projectId}/workspace`);
}

export async function listAgentEvents(threadId: string): Promise<AgentEvent[]> {
  const body = await request<{ events: AgentEvent[] }>(`/agent/threads/${threadId}/events`);
  return body.events;
}

export async function createAgentMessage(
  threadId: string,
  input: CreateAgentMessageRequest
): Promise<CreateAgentMessageResponse> {
  return request<CreateAgentMessageResponse>(`/agent/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function confirmAgentApproval(approvalId: string): Promise<ApprovalResponse> {
  return request<ApprovalResponse>(`/agent/approvals/${approvalId}/confirm`, {
    method: "POST"
  });
}

export async function rejectAgentApproval(approvalId: string): Promise<ApprovalResponse> {
  return request<ApprovalResponse>(`/agent/approvals/${approvalId}/reject`, {
    method: "POST"
  });
}

export async function lockScript(projectId: string): Promise<WorkspaceAggregate> {
  return request<WorkspaceAggregate>(`/projects/${projectId}/script/lock`, {
    method: "POST",
    body: JSON.stringify({ script_version: 1 })
  });
}

export type AgentStreamChunk =
  | { type: "director.route"; run_id: string; intent: string; selected_agents: string[]; director_message: string; used_model: boolean; parse_error?: string | null }
  | { type: "agent.start"; run_id: string; agent_id: string; agent_name: string }
  | { type: "agent.token"; run_id: string; agent_id: string; token: string }
  | { type: "agent.done"; run_id: string; agent_id: string; content: string; used_model: boolean }
  | { type: "run.done"; run_id: string; final: { text: string; response_type: string | null; [key: string]: unknown } }
  | { type: "error"; message: string };

export async function* streamAgentMessage(
  threadId: string,
  input: CreateAgentMessageRequest,
  signal?: AbortSignal
): AsyncGenerator<AgentStreamChunk> {
  const response = await fetch(`${API_BASE}/agent/threads/${threadId}/messages/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data) continue;
        try {
          yield JSON.parse(data) as AgentStreamChunk;
        } catch { /* ignore */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
