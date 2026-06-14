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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:18080/api";
const FALLBACK_DELAY_MS = 450;
const mockEventStore = new Map<string, AgentEvent[]>();

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

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
  try {
    return await request<WorkspaceAggregate>("/projects", {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    console.warn("Using dev mock for createProject", error);
    await sleep(FALLBACK_DELAY_MS);
    const workspace = mockWorkspace(input.initial_input);
    mockEventStore.set(workspace.agent_thread.id, mockEvents(workspace.agent_thread.id, input.initial_input));
    return workspace;
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  try {
    const body = await request<{ projects: ProjectSummary[] }>("/projects");
    return body.projects;
  } catch (error) {
    console.warn("Using dev mock for listProjects", error);
    await sleep(FALLBACK_DELAY_MS);
    return [];
  }
}

export async function getWorkspace(projectId: string): Promise<WorkspaceAggregate> {
  try {
    return await request<WorkspaceAggregate>(`/projects/${projectId}/workspace`);
  } catch (error) {
    console.warn("Using dev mock for getWorkspace", error);
    await sleep(FALLBACK_DELAY_MS);
    const workspace = mockWorkspace("继续完善一个短剧项目", projectId);
    mockEventStore.set(workspace.agent_thread.id, mockEvents(workspace.agent_thread.id, workspace.project.title));
    return workspace;
  }
}

export async function listAgentEvents(threadId: string): Promise<AgentEvent[]> {
  try {
    const body = await request<{ events: AgentEvent[] }>(`/agent/threads/${threadId}/events`);
    return body.events;
  } catch (error) {
    console.warn("Using dev mock for listAgentEvents", error);
    await sleep(FALLBACK_DELAY_MS);
    const events = mockEventStore.get(threadId) ?? mockEvents(threadId, "我想把这个灵感做成短剧");
    mockEventStore.set(threadId, events);
    return events;
  }
}

export async function createAgentMessage(
  threadId: string,
  input: CreateAgentMessageRequest
): Promise<CreateAgentMessageResponse> {
  try {
    return await request<CreateAgentMessageResponse>(`/agent/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    console.warn("Using dev mock for createAgentMessage", error);
    await sleep(FALLBACK_DELAY_MS);
    appendMockAgentRun(threadId, input.content);
    return {
      thread_id: threadId,
      message_id: `mock-message-${Date.now()}`,
      assistant_message_id: `mock-assistant-${Date.now()}`,
      run_id: `mock-run-${Date.now()}`
    };
  }
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
  try {
    return await request<WorkspaceAggregate>(`/projects/${projectId}/script/lock`, {
      method: "POST",
      body: JSON.stringify({ script_version: 1 })
    });
  } catch (error) {
    console.warn("Using dev mock for lockScript", error);
    await sleep(FALLBACK_DELAY_MS);
    return mockWorkspace("锁定后的短剧项目", projectId, true);
  }
}

function mockWorkspace(initialInput: string, projectId = `demo-${Date.now()}`, locked = false): WorkspaceAggregate {
  const threadId = `thread-${projectId}`;
  const scenes: Scene[] = [
    { id: `scene-${projectId}-1`, project_id: projectId, title: "第一幕：冲突建立", order_index: 1 },
    { id: `scene-${projectId}-2`, project_id: projectId, title: "第二幕：选择与反转", order_index: 2 }
  ];
  const shots: Shot[] = [
    {
      id: `shot-${projectId}-1`,
      scene_id: scenes[0].id,
      title: "开场镜头",
      order_index: 1,
      description: initialInput
    },
    {
      id: `shot-${projectId}-2`,
      scene_id: scenes[1].id,
      title: "关键转折",
      order_index: 2,
      description: "角色发现真正目标，进入可制作分镜。"
    }
  ];

  return {
    project: {
      id: projectId,
      title: titleFromInput(initialInput),
      route: "short_drama",
      current_stage: locked ? "canvas" : "chat",
      created_at: new Date().toISOString()
    },
    agent_thread: {
      id: threadId,
      project_id: projectId,
      focus_ref: { type: "project", id: projectId }
    },
    script_drafts: [
      {
        id: `script-${projectId}-1`,
        project_id: projectId,
        episode_id: `episode-${projectId}-1`,
        version: 1,
        content: initialInput,
        source: "initial_input",
        locked_at: locked ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    scenes,
    shots,
    assets: [],
    canvas: mockCanvas(projectId, scenes, shots, locked)
  };
}

function mockCanvas(projectId: string, scenes: Scene[], shots: Shot[], locked: boolean): CanvasDocument {
  return {
    project_id: projectId,
    nodes: [
      {
        id: "script",
        position: { x: 80, y: 80 },
        data: {
          label: locked ? "剧本已锁定" : "剧本草稿",
          status: locked ? "locked" : "draft",
          ref: { type: "script", id: `${projectId}:current` },
          summary: locked ? "当前版本已作为画布初始化依据。" : "从聊天阶段沉淀剧情设定。"
        }
      },
      {
        id: "assets",
        position: { x: 390, y: 40 },
        data: {
          label: "资产设定",
          status: "ready",
          ref: { type: "project", id: projectId },
          summary: "角色、场景、道具和参考图。"
        }
      },
      {
        id: "storyboard",
        position: { x: 390, y: 230 },
        data: {
          label: "分镜结构",
          status: locked ? "generated" : "pending",
          ref: { type: "scene", id: scenes[0].id },
          summary: `${scenes.length} scenes / ${shots.length} shots`
        }
      },
      {
        id: "keyframes",
        position: { x: 720, y: 120 },
        data: {
          label: "关键帧",
          status: "waiting",
          ref: { type: "shot", id: shots[0].id },
          summary: "等待生成提示词包。"
        }
      },
      {
        id: "export",
        position: { x: 1040, y: 120 },
        data: {
          label: "合成导出",
          status: "blocked",
          ref: { type: "generation_task", id: `task-${projectId}-export` },
          summary: "等待关键帧和视频片段。"
        }
      }
    ],
    edges: [
      { id: "e-script-assets", source: "script", target: "assets", label: "拆解" },
      { id: "e-script-storyboard", source: "script", target: "storyboard", label: "锁定版本" },
      { id: "e-storyboard-keyframes", source: "storyboard", target: "keyframes", label: "生成镜头" },
      { id: "e-keyframes-export", source: "keyframes", target: "export", label: "汇总" }
    ],
    viewport: { x: 0, y: 0, zoom: 0.9 },
    version: 1
  };
}

function mockEvents(threadId: string, initialText: string): AgentEvent[] {
  const now = new Date().toISOString();
  return [
    {
      id: `event-${threadId}-1`,
      thread_id: threadId,
      event_type: "message.created",
      actor: "human",
      payload: { text: initialText },
      created_at: now
    },
    {
      id: `event-${threadId}-2`,
      thread_id: threadId,
      event_type: "multi_agent.final_message_created",
      actor: "agent",
      payload: { text: "项目已创建。可以继续让导演 Agent 拆剧本、分镜、资产或镜头语言。" },
      created_at: now
    }
  ];
}

function appendMockAgentRun(threadId: string, content: string) {
  const now = new Date().toISOString();
  const runId = `mock-run-${Date.now()}`;
  const approvalId = `mock-approval-${Date.now()}`;
  const nextEvents = [
    ...(mockEventStore.get(threadId) ?? []),
    {
      id: `event-${runId}-user`,
      thread_id: threadId,
      event_type: "message.created",
      actor: "human",
      payload: { text: content },
      created_at: now
    },
    {
      id: `event-${runId}-started`,
      thread_id: threadId,
      task_id: runId,
      event_type: "multi_agent.run_started",
      actor: "agent",
      payload: { run_id: runId, model_provider: "mock-local" },
      created_at: now
    },
    {
      id: `event-${runId}-route`,
      thread_id: threadId,
      task_id: runId,
      event_type: "multi_agent.route_decided",
      actor: "agent",
      payload: {
        run_id: runId,
        intent: "shot_revision",
        selected_agents: ["storyboard", "cinematographer"],
        needs_approval: true
      },
      created_at: now
    },
    {
      id: `event-${runId}-storyboard`,
      thread_id: threadId,
      task_id: runId,
      event_type: "multi_agent.agent_completed",
      actor: "agent",
      payload: {
        agent_name: "分镜 Agent",
        content: "建议把目标镜头压缩为更近的主体距离，并减少环境信息，突出角色被逼迫的状态。",
        used_model: false
      },
      created_at: now
    },
    {
      id: `event-${runId}-camera`,
      thread_id: threadId,
      task_id: runId,
      event_type: "multi_agent.agent_completed",
      actor: "agent",
      payload: {
        agent_name: "摄影/机位 Agent",
        content: "使用低角度近景、单侧硬光和轻微手持晃动，镜头时长控制在 2 秒内。",
        used_model: false
      },
      created_at: now
    },
    {
      id: `event-${runId}-approval`,
      thread_id: threadId,
      task_id: runId,
      event_type: "multi_agent.approval_required",
      actor: "agent",
      payload: {
        approval_id: approvalId,
        title: "等待确认的镜头变更",
        status: "pending",
        target_type: "shot",
        actions: [
          {
            action_type: "update_shot_description",
            target_type: "shot",
            target_id: null,
            summary: "按本轮指令更新 Shot 描述",
            diff: { before: null, after: content }
          }
        ],
        diff: [{ before: null, after: content }]
      },
      created_at: now
    },
    {
      id: `event-${runId}-final`,
      thread_id: threadId,
      task_id: runId,
      event_type: "multi_agent.final_message_created",
      actor: "agent",
      payload: {
        text: "导演路由：镜头修改\n\n已让分镜和摄影/机位给出建议，并生成确认卡片。确认前不会写入项目。"
      },
      created_at: now
    }
  ] satisfies AgentEvent[];

  mockEventStore.set(threadId, nextEvents);
}

function titleFromInput(input: string) {
  const normalized = input.trim().replace(/\s+/g, " ");
  return normalized.length > 18 ? `${normalized.slice(0, 18)}...` : normalized || "未命名项目";
}
