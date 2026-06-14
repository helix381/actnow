import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasStage } from "./components/CanvasStage";
import { ChatStage } from "./components/ChatStage";
import { HomeStage } from "./components/HomeStage";
import {
  AgentEvent,
  ProjectSummary,
  WorkspaceAggregate,
  confirmAgentApproval,
  createAgentMessage,
  createProject,
  getWorkspace,
  listProjects,
  listAgentEvents,
  lockScript,
  rejectAgentApproval
} from "./lib/api";

type Stage = "home" | "chat" | "canvas";
type RequestState = "idle" | "loading" | "error";

export function App() {
  const [stage, setStage] = useState<Stage>("home");
  const [workspace, setWorkspace] = useState<WorkspaceAggregate | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [createState, setCreateState] = useState<RequestState>("idle");
  const [chatState, setChatState] = useState<RequestState>("idle");
  const [approvalState, setApprovalState] = useState<RequestState>("idle");
  const [lockState, setLockState] = useState<RequestState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState("");

  const projectId = workspace?.project.id;
  const threadId = workspace?.agent_thread.id;

  const loadEvents = useCallback(async (nextThreadId: string) => {
    setChatState("loading");
    setError(null);
    try {
      const nextEvents = await listAgentEvents(nextThreadId);
      setEvents(nextEvents);
      setChatState("idle");
    } catch (nextError) {
      setChatState("error");
      setError(errorMessage(nextError));
    }
  }, []);

  const restoreWorkspace = useCallback(async (storedProjectId: string) => {
    setChatState("loading");
    setError(null);
    try {
      const nextWorkspace = await getWorkspace(storedProjectId);
      setWorkspace(nextWorkspace);
      setStage(nextWorkspace.project.current_stage === "canvas" ? "canvas" : "chat");
      setChatState("idle");
      await loadEvents(nextWorkspace.agent_thread.id);
    } catch (nextError) {
      setChatState("error");
      setError(errorMessage(nextError));
      setStage("home");
    }
  }, [loadEvents]);

  useEffect(() => {
    void refreshProjects();
  }, []);

  const refreshProjects = async () => {
    try {
      setProjects(await listProjects());
    } catch {
      setProjects([]);
    }
  };

  const handleCreateProject = async (initialInput: string) => {
    setLastInput(initialInput);
    setCreateState("loading");
    setError(null);
    try {
      const nextWorkspace = await createProject({ initial_input: initialInput, route: "short_drama" });
      setWorkspace(nextWorkspace);
      setStage("chat");
      setCreateState("idle");
      void refreshProjects();
      await loadEvents(nextWorkspace.agent_thread.id);
    } catch (nextError) {
      setCreateState("error");
      setError(errorMessage(nextError));
    }
  };

  const handleRetryCreate = () => {
    if (lastInput) {
      void handleCreateProject(lastInput);
    }
  };

  const handleRetryChat = () => {
    if (threadId) {
      void loadEvents(threadId);
    } else if (projectId) {
      void restoreWorkspace(projectId);
    }
  };

  const handleSendMessage = async (content: string, options?: { displayText?: string }) => {
    if (!threadId) {
      return;
    }

    const runId = `ui-run-${Date.now()}`;
    const displayText = options?.displayText ?? content;
    const optimisticEvents = [
      createLocalEvent(threadId, "message.created", "human", { text: content, display_text: displayText, local: true }, runId),
      createLocalEvent(threadId, "ui.director_joined", "agent", { text: "导演进入聊天室" }, runId),
      createLocalEvent(threadId, "ui.director_planning", "agent", { text: "导演正在规划..." }, runId)
    ];

    setChatState("loading");
    setError(null);
    setEvents((currentEvents) => [...currentEvents, ...optimisticEvents]);
    try {
      const result = await createAgentMessage(threadId, {
        content,
        display_text: displayText,
        focus_ref: workspace?.agent_thread.focus_ref,
        client_context: {
          stage,
          project_id: projectId
        }
      });
      await loadEvents(result.thread_id);
    } catch (nextError) {
      setChatState("error");
      setError(errorMessage(nextError));
      setEvents((currentEvents) => [
        ...currentEvents.filter((event) => event.task_id !== runId || event.event_type === "message.created"),
        createLocalEvent(threadId, "ui.director_failed", "agent", { text: errorMessage(nextError) }, runId)
      ]);
    }
  };

  const handleContinueWorkflow = (settings: {
    length: "short" | "long";
    ratio: "16:9" | "9:16";
    language: "zh" | "en" | "ja";
  }) => {
    const lengthLabel = settings.length === "short" ? "短视频，1 分钟以内" : "长视频，1 分钟以上";
    const languageLabel = settings.language === "zh" ? "中文" : settings.language === "en" ? "英文" : "日文";
    const content = [
      "已确认短剧工作流参数：",
      `影片长度：${lengthLabel}`,
      `影片比例：${settings.ratio}`,
      `对白语言：${languageLabel}`,
      "请继续在聊天室里完成下一步：先组织编剧和分镜专家拆解剧本结构、Scene 和 Shot 候选。确认前不要写入项目。"
    ].join("\n");

    void handleSendMessage(content, { displayText: "信息已确认" });
  };

  const handleLockScript = async () => {
    if (!projectId) {
      return;
    }

    setLockState("loading");
    setError(null);
    try {
      const nextWorkspace = await lockScript(projectId);
      setWorkspace(nextWorkspace);
      setStage("canvas");
      setLockState("idle");
    } catch (nextError) {
      setLockState("error");
      setError(errorMessage(nextError));
    }
  };

  const handleConfirmApproval = async (approvalId: string) => {
    if (!threadId) {
      return;
    }

    setApprovalState("loading");
    setError(null);
    try {
      const result = await confirmAgentApproval(approvalId);
      setWorkspace(result.workspace);
      await loadEvents(threadId);
      setApprovalState("idle");
    } catch (nextError) {
      setApprovalState("error");
      setError(errorMessage(nextError));
    }
  };

  const handleRejectApproval = async (approvalId: string) => {
    if (!threadId) {
      return;
    }

    setApprovalState("loading");
    setError(null);
    try {
      const result = await rejectAgentApproval(approvalId);
      setWorkspace(result.workspace);
      await loadEvents(threadId);
      setApprovalState("idle");
    } catch (nextError) {
      setApprovalState("error");
      setError(errorMessage(nextError));
    }
  };

  const sidebarItems = useMemo(
    () => [
      { key: "home", label: "首页" },
      { key: "chat", label: "聊天" },
      { key: "canvas", label: "画布" }
    ] as const,
    []
  );

  return (
    <main className="workspace-shell" data-stage={stage}>
      <aside className="workspace-rail" aria-label="工作区导航">
        <div className="rail-brand">
          <span className="brand-mark">A</span>
          <span className="brand-copy">ActNow</span>
        </div>
        <nav className="rail-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={item.key === stage ? "rail-item active" : "rail-item"}
              type="button"
              onClick={() => {
                if (item.key === "home" || workspace) {
                  setStage(item.key);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace-main">
        {stage === "home" && (
          <HomeStage
            error={createState === "error" ? error : null}
            isLoading={createState === "loading"}
            onCreate={handleCreateProject}
            onOpenProject={restoreWorkspace}
            onRetry={handleRetryCreate}
            projects={projects}
          />
        )}

        {stage === "chat" && (
          <ChatStage
            events={events}
            error={chatState === "error" || lockState === "error" || approvalState === "error" ? error : null}
            isApproving={approvalState === "loading"}
            isLoading={chatState === "loading"}
            isLocking={lockState === "loading"}
            onConfirmApproval={handleConfirmApproval}
            onContinueWorkflow={handleContinueWorkflow}
            onEnterCanvas={handleLockScript}
            onRejectApproval={handleRejectApproval}
            onRetry={handleRetryChat}
            onSendMessage={handleSendMessage}
            workspace={workspace}
          />
        )}

        {stage === "canvas" && workspace && (
          <CanvasStage
            events={events}
            onBackToChat={() => setStage("chat")}
            workspace={workspace}
          />
        )}
      </section>
    </main>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "请求失败，请稍后重试。";
}

function createLocalEvent(
  threadId: string,
  eventType: string,
  actor: AgentEvent["actor"],
  payload: Record<string, unknown>,
  taskId?: string
): AgentEvent {
  const now = new Date().toISOString();
  return {
    id: `${eventType}-${taskId ?? "local"}-${now}`,
    thread_id: threadId,
    task_id: taskId,
    event_type: eventType,
    actor,
    payload,
    created_at: now
  };
}
