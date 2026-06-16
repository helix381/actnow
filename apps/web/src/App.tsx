import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CanvasStage } from "./components/CanvasStage";
import { ChatStage } from "./components/ChatStage";
import { HomeStage } from "./components/HomeStage";
import {
  AgentEvent,
  AgentStreamChunk,
  ProjectSummary,
  WorkspaceAggregate,
  confirmAgentApproval,
  createAgentMessage,
  createProject,
  getWorkspace,
  listProjects,
  listAgentEvents,
  lockScript,
  rejectAgentApproval,
  streamAgentMessage
} from "./lib/api";

type Stage = "home" | "chat" | "canvas";
type RequestState = "idle" | "loading" | "error";
type StreamingCard = { id: string; agentId: string; agentName: string; text: string; isDone: boolean };

// suppress unused import warning — AgentStreamChunk is used as type annotation below
type _AgentStreamChunkRef = AgentStreamChunk;

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingCards, setStreamingCards] = useState<StreamingCard[]>([]);
  const streamAbortRef = useRef<AbortController | null>(null);

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
      // Kick off the first director run with the initial input
      const nextThreadId = nextWorkspace.agent_thread.id;
      const runId = `ui-run-${Date.now()}`;
      setEvents([
        createLocalEvent(nextThreadId, "message.created", "human", { text: initialInput, display_text: initialInput, local: true }, runId),
        createLocalEvent(nextThreadId, "ui.director_planning", "agent", { text: "导演正在规划..." }, runId)
      ]);
      setChatState("loading");
      try {
        const result = await createAgentMessage(nextThreadId, {
          content: initialInput,
          display_text: initialInput
        });
        await loadEvents(result.thread_id);
      } catch (chatError) {
        setChatState("error");
        setError(errorMessage(chatError));
      }
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

  const handleSendMessage = async (content: string, options?: { displayText?: string; genesisStep?: string; clientContext?: Record<string, unknown> }) => {
    if (!threadId) {
      return;
    }

    // Cancel any in-progress stream
    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    const runId = `ui-run-${Date.now()}`;
    const displayText = options?.displayText ?? content;

    setIsGenerating(false);
    setStreamingCards([]);
    setChatState("loading");
    setError(null);
    setEvents((prev) => [
      ...prev,
      createLocalEvent(threadId, "message.created", "human", { text: content, display_text: displayText, local: true }, runId)
    ]);

    try {
      for await (const chunk of streamAgentMessage(
        threadId,
        {
          content,
          display_text: displayText,
          focus_ref: workspace?.agent_thread.focus_ref,
          client_context: {
            stage,
            project_id: projectId,
            ...(options?.genesisStep ? { genesis_step: options.genesisStep } : {}),
            ...(options?.clientContext ? options.clientContext : {})
          }
        },
        controller.signal
      )) {
        if (controller.signal.aborted) break;
        switch (chunk.type) {
          case "director.route":
            setStreamingCards([{ id: "director", agentId: "director", agentName: "导演", text: chunk.director_message || "", isDone: true }]);
            break;
          case "agent.start":
            setStreamingCards((prev) => [...prev, { id: chunk.agent_id, agentId: chunk.agent_id, agentName: chunk.agent_name, text: "", isDone: false }]);
            break;
          case "agent.token":
            setStreamingCards((prev) => prev.map((c) => c.id === chunk.agent_id ? { ...c, text: c.text + chunk.token } : c));
            break;
          case "agent.done":
            setStreamingCards((prev) => prev.map((c) => c.id === chunk.agent_id ? { ...c, isDone: true } : c));
            break;
          case "run.done":
            setStreamingCards([]);
            await loadEvents(threadId);
            setChatState("idle");
            break;
          case "error":
            throw new Error(chunk.message);
        }
      }
    } catch (nextError) {
      if (!controller.signal.aborted) {
        setChatState("error");
        setError(errorMessage(nextError));
        setStreamingCards([]);
        setEvents((prev) => [
          ...prev.filter((e) => e.task_id !== runId || e.event_type === "message.created"),
          createLocalEvent(threadId, "ui.director_failed", "agent", { text: errorMessage(nextError) }, runId)
        ]);
      }
    }
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
            isGenerating={isGenerating}
            isLoading={chatState === "loading"}
            isLocking={lockState === "loading"}
            onConfirmApproval={handleConfirmApproval}
            onEnterCanvas={handleLockScript}
            onRejectApproval={handleRejectApproval}
            onRetry={handleRetryChat}
            onSendMessage={handleSendMessage}
            streamingCards={streamingCards}
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
