import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AgentEvent, WorkspaceAggregate } from "../lib/api";

type ChatStageProps = {
  events: AgentEvent[];
  error: string | null;
  isApproving: boolean;
  isLoading: boolean;
  isLocking: boolean;
  onConfirmApproval: (approvalId: string) => void;
  onEnterCanvas: () => void;
  onContinueWorkflow: (settings: ShortFilmSettings) => void;
  onRejectApproval: (approvalId: string) => void;
  onRetry: () => void;
  onSendMessage: (content: string) => void;
  workspace: WorkspaceAggregate | null;
};

type RenderEventOptions = {
  isApproving: boolean;
  onConfirmApproval: (approvalId: string) => void;
  onRejectApproval: (approvalId: string) => void;
};

type ShortFilmSettings = {
  length: "short" | "long";
  ratio: "16:9" | "9:16";
  language: "zh" | "en" | "ja";
};

const defaultSettings: ShortFilmSettings = {
  length: "short",
  ratio: "9:16",
  language: "zh"
};

export function ChatStage({
  events,
  error,
  isApproving,
  isLoading,
  isLocking,
  onConfirmApproval,
  onContinueWorkflow,
  onEnterCanvas,
  onRejectApproval,
  onRetry,
  onSendMessage,
  workspace
}: ChatStageProps) {
  const [draft, setDraft] = useState("");
  const [settings, setSettings] = useState<ShortFilmSettings>(defaultSettings);
  const [workflowConfirmed, setWorkflowConfirmed] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const visibleEvents = useMemo(() => toVisibleEvents(events), [events]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleEvents.length, isLoading]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isLoading || !workspace) {
      return;
    }
    setDraft("");
    onSendMessage(content);
  };

  return (
    <div className="stage stage-chat product-chat">
      <section className="chat-panel product-chat-panel">
        <header className="panel-header product-chat-header">
          <div>
            <p className="eyebrow">Director Agent</p>
            <h1>{workspace?.project.title ?? "新短剧项目"}</h1>
          </div>
          <button disabled={!workspace || isLocking} onClick={onEnterCanvas} type="button">
            {isLocking ? "进入中..." : "进入画布"}
          </button>
        </header>

        {error && (
          <div className="inline-error" role="alert">
            <span>{error}</span>
            <button className="secondary" onClick={onRetry} type="button">
              重试
            </button>
          </div>
        )}

        <div className="message-list product-message-list">
          {visibleEvents.map((event) =>
            renderEvent(event, {
              isApproving,
              onConfirmApproval,
              onRejectApproval
            })
          )}

          {hasWorkflowSignal(events) && !workflowConfirmed && (
            <WorkflowSetupCard
              disabled={isLoading || isLocking}
              onContinue={() => {
                setWorkflowConfirmed(true);
                onContinueWorkflow(settings);
              }}
              onSettingsChange={setSettings}
              settings={settings}
            />
          )}

          {workflowConfirmed && <WorkflowConfirmedCard />}

          {!isLoading && visibleEvents.length === 0 && (
            <article className="message system product-agent-message">
              <span className="agent-badge">导演</span>
              <h2>说出你想做的短剧</h2>
              <p>我会先理解创作方向，再帮你启动工作流和确认短片参数。</p>
            </article>
          )}

          <div ref={messageEndRef} />
        </div>

        <form className="chat-composer product-composer" onSubmit={handleSubmit}>
          <textarea
            aria-label="发送给导演"
            disabled={!workspace || isLoading}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="例如：我想做一个末日降临，海平面上升淹没世界的短剧"
            rows={3}
            value={draft}
          />
          <button disabled={!workspace || isLoading || !draft.trim()} type="submit">
            {isLoading ? "规划中..." : "发送"}
          </button>
        </form>
      </section>
    </div>
  );
}

function renderEvent(event: AgentEvent, options: RenderEventOptions) {
  switch (event.event_type) {
    case "message.created":
      return (
        <article className="message human product-user-message" key={event.id}>
          <p>{readText(event.payload, "display_text") || readText(event.payload, "text")}</p>
        </article>
      );

    case "ui.director_joined":
      return (
        <article className="message agent director-presence" key={event.id}>
          <span className="agent-badge">导演</span>
          <p>{readText(event.payload, "text") || "导演进入聊天室"}</p>
        </article>
      );

    case "ui.director_planning":
      return (
        <article className="message agent director-planning" key={event.id}>
          <span className="pulse" />
          <p>{readText(event.payload, "text") || "导演正在规划..."}</p>
        </article>
      );

    case "ui.director_failed":
      return (
        <article className="message system director-failed" key={event.id}>
          <span className="agent-badge">导演</span>
          <p>{readText(event.payload, "text") || "规划失败，请重试。"}</p>
        </article>
      );

    case "multi_agent.final_message_created":
      return (
        <article className="message agent product-agent-message" key={event.id}>
          <span className="agent-badge">导演</span>
          <p>{directorMessage(event.payload)}</p>
        </article>
      );

    case "multi_agent.approval_required":
      return <ApprovalCard event={event} key={event.id} options={options} />;

    case "multi_agent.approval_confirmed":
      return (
        <article className="message agent product-agent-message" key={event.id}>
          <span className="agent-badge">导演</span>
          <p>已确认，接下来会把这次变更写入项目。</p>
        </article>
      );

    case "multi_agent.approval_rejected":
      return (
        <article className="message agent product-agent-message" key={event.id}>
          <span className="agent-badge">导演</span>
          <p>已驳回，本次变更不会写入项目。</p>
        </article>
      );

    case "tool.completed":
      return (
        <article className="message agent product-agent-message" key={event.id}>
          <span className="agent-badge">导演</span>
          <p>写入完成，可以继续完善分镜、资产或进入画布。</p>
        </article>
      );

    case "tool.failed":
      return (
        <article className="message system product-agent-message" key={event.id}>
          <span className="agent-badge">导演</span>
          <p>{readText(event.payload, "error") || "写入失败，请重试。"}</p>
        </article>
      );

    default:
      return null;
  }
}

function WorkflowSetupCard({
  disabled,
  onContinue,
  onSettingsChange,
  settings
}: {
  disabled: boolean;
  onContinue: () => void;
  onSettingsChange: (settings: ShortFilmSettings) => void;
  settings: ShortFilmSettings;
}) {
  return (
    <article className="message agent workflow-card">
      <span className="agent-badge">导演</span>
      <h2>规划完成</h2>
      <p>我已经理解你的创作方向。下一步先激活工作流，并确认短片参数。</p>

      <section className="workflow-step">
        <span className="step-check">✓</span>
        <strong>激活工作流</strong>
      </section>

      <section className="workflow-step">
        <span className="step-check">✓</span>
        <strong>更新短片参数</strong>
      </section>

      <FieldGroup label="影片长度">
        <SegmentButton
          active={settings.length === "short"}
          label="短视频"
          subLabel="<1min"
          onClick={() => onSettingsChange({ ...settings, length: "short" })}
        />
        <SegmentButton
          active={settings.length === "long"}
          label="长视频"
          subLabel=">=1min"
          onClick={() => onSettingsChange({ ...settings, length: "long" })}
        />
      </FieldGroup>

      <FieldGroup label="影片比例">
        <SegmentButton
          active={settings.ratio === "16:9"}
          label="横版 16:9"
          onClick={() => onSettingsChange({ ...settings, ratio: "16:9" })}
        />
        <SegmentButton
          active={settings.ratio === "9:16"}
          label="竖版 9:16"
          onClick={() => onSettingsChange({ ...settings, ratio: "9:16" })}
        />
      </FieldGroup>

      <FieldGroup label="对白语言">
        <SegmentButton
          active={settings.language === "en"}
          label="英文"
          onClick={() => onSettingsChange({ ...settings, language: "en" })}
        />
        <SegmentButton
          active={settings.language === "zh"}
          label="中文"
          onClick={() => onSettingsChange({ ...settings, language: "zh" })}
        />
        <SegmentButton
          active={settings.language === "ja"}
          label="日文"
          onClick={() => onSettingsChange({ ...settings, language: "ja" })}
        />
      </FieldGroup>

      <button className="workflow-primary" disabled={disabled} onClick={onContinue} type="button">
        确认并继续
      </button>
    </article>
  );
}

function WorkflowConfirmedCard() {
  return (
    <article className="workflow-confirmed-card">
      <span className="step-check">✓</span>
      <strong>更新短片参数</strong>
    </article>
  );
}

function FieldGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="setting-group">
      <h3>{label}</h3>
      <div className="setting-grid">{children}</div>
    </div>
  );
}

function SegmentButton({
  active,
  label,
  onClick,
  subLabel
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  subLabel?: string;
}) {
  return (
    <button className={active ? "setting-option active" : "setting-option"} onClick={onClick} type="button">
      <strong>{label}</strong>
      {subLabel && <span>{subLabel}</span>}
    </button>
  );
}

function ApprovalCard({ event, options }: { event: AgentEvent; options: RenderEventOptions }) {
  const approvalId = readText(event.payload, "approval_id");
  const status = readText(event.payload, "status") || "pending";
  const isPending = status === "pending";
  const isDisabled = options.isApproving || !isPending || !approvalId;

  return (
    <article className="message agent approval-card product-approval-card">
      <span className="agent-badge">导演</span>
      <h2>需要你确认</h2>
      <p>这一步会改变项目内容。确认前不会写入剧本、分镜、资产或生成任务。</p>
      <div className="approval-footer">
        <button
          className="secondary"
          disabled={isDisabled}
          onClick={() => options.onRejectApproval(approvalId)}
          type="button"
        >
          先不写入
        </button>
        <button
          disabled={isDisabled}
          onClick={() => options.onConfirmApproval(approvalId)}
          type="button"
        >
          {options.isApproving && isPending ? "处理中..." : "确认写入"}
        </button>
      </div>
    </article>
  );
}

function toVisibleEvents(events: AgentEvent[]) {
  const allowed = new Set([
    "message.created",
    "ui.director_joined",
    "ui.director_planning",
    "ui.director_failed",
    "multi_agent.final_message_created",
    "multi_agent.approval_required",
    "multi_agent.approval_confirmed",
    "multi_agent.approval_rejected",
    "tool.completed",
    "tool.failed"
  ]);
  return events.filter((event) => allowed.has(event.event_type));
}

function hasWorkflowSignal(events: AgentEvent[]) {
  return events.some((event) => event.event_type === "multi_agent.route_decided" || event.event_type === "multi_agent.final_message_created");
}

function directorMessage(payload: unknown) {
  const raw = readText(payload, "text");
  if (!raw) {
    return "规划完成。";
  }

  if (raw.includes("项目已创建")) {
    return raw;
  }

  const normalized = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("导演路由"))
    .filter((line) => !line.startsWith("【"))
    .filter((line) => !line.includes("确认卡片"))
    .join(" ");

  return normalized || "规划完成。";
}

function readText(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}
