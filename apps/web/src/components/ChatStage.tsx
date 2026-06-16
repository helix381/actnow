import { FormEvent, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AgentEvent, WorkspaceAggregate } from "../lib/api";

type SendMessageMeta = { genesisStep?: string; clientContext?: Record<string, unknown> };

type StreamingCard = { id: string; agentId: string; agentName: string; text: string; isDone: boolean };

type ChatStageProps = {
  events: AgentEvent[];
  error: string | null;
  isApproving: boolean;
  isGenerating: boolean;
  isLoading: boolean;
  isLocking: boolean;
  onConfirmApproval: (approvalId: string) => void;
  onEnterCanvas: () => void;
  onRejectApproval: (approvalId: string) => void;
  onRetry: () => void;
  onSendMessage: (content: string, meta?: SendMessageMeta) => void;
  streamingCards?: StreamingCard[];
  workspace: WorkspaceAggregate | null;
};

type RenderEventOptions = {
  isApproving: boolean;
  onConfirmApproval: (approvalId: string) => void;
  onRejectApproval: (approvalId: string) => void;
  onSendMessage: (content: string, meta?: SendMessageMeta) => void;
};

export function ChatStage({
  events,
  error,
  isApproving,
  isGenerating,
  isLoading,
  isLocking,
  onConfirmApproval,
  onEnterCanvas,
  onRejectApproval,
  onRetry,
  onSendMessage,
  streamingCards = [],
  workspace
}: ChatStageProps) {
  const [draft, setDraft] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const visibleEvents = useMemo(() => toVisibleEvents(events), [events]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleEvents.length, isLoading, isGenerating, streamingCards.length]);

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
              onRejectApproval,
              onSendMessage
            })
          )}

          {!isLoading && visibleEvents.length === 0 && (
            <article className="message system product-agent-message">
              <span className="agent-badge">导演</span>
              <h2>说出你想做的短剧</h2>
              <p>我会先理解创作方向，再帮你启动工作流和确认短片参数。</p>
            </article>
          )}

          {isGenerating && !isLoading && (
            <article className="message agent director-planning generating-state">
              <span className="pulse" />
              <p>导演正在搭建架构…通常需要 30—60 秒</p>
            </article>
          )}

          {streamingCards.map((card) => (
            <AgentThinkingCard
              key={card.id}
              agentId={card.agentId}
              agentName={card.agentName}
              isDone={card.isDone}
              text={card.text}
            />
          ))}

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

    case "multi_agent.final_message_created": {
      const responseType = readText(event.payload, "response_type");

      if (responseType === "option_cards") {
        return (
          <OptionCardsMessage
            key={event.id}
            directorMessage={readText(event.payload, "text")}
            payload={(event.payload as Record<string, unknown>)?.option_cards}
            onSelect={options.onSendMessage}
          />
        );
      }

      if (responseType === "expansion") {
        return (
          <ExpansionMessage
            key={event.id}
            directorMessage={readText(event.payload, "text")}
            payload={(event.payload as Record<string, unknown>)?.expansion}
            onSelect={options.onSendMessage}
          />
        );
      }

      if (responseType === "quick_poll") {
        return (
          <QuickPollMessage
            key={event.id}
            pollScriptId={readText(event.payload, "poll_script_id")}
            onSelect={options.onSendMessage}
          />
        );
      }

      if (responseType === "param_collection") {
        return (
          <ParamCollectionMessage
            key={event.id}
            directorMessage={readText(event.payload, "text")}
            payload={(event.payload as Record<string, unknown>)?.param_collection}
            onConfirm={options.onSendMessage}
          />
        );
      }

      if (responseType === "world_card") {
        return (
          <WorldCardMessage
            key={event.id}
            directorMessage={readText(event.payload, "text")}
            payload={(event.payload as Record<string, unknown>)?.world_card}
            onConfirm={options.onSendMessage}
          />
        );
      }

      if (responseType === "outline_card") {
        return (
          <OutlineCardMessage
            key={event.id}
            directorMessage={readText(event.payload, "text")}
            payload={(event.payload as Record<string, unknown>)?.outline_card}
            onConfirm={options.onSendMessage}
          />
        );
      }

      return (
        <article className="message agent product-agent-message" key={event.id}>
          <span className="agent-badge">导演</span>
          <p>{readText(event.payload, "text") || "规划完成。"}</p>
        </article>
      );
    }

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

function OptionCardsMessage({
  directorMessage,
  onSelect,
  payload
}: {
  directorMessage: string;
  onSelect: (content: string, meta?: SendMessageMeta) => void;
  payload: unknown;
}) {
  type Option = { id: string; label: string; hook: string };
  const options: Option[] = Array.isArray((payload as { options?: unknown })?.options)
    ? ((payload as { options: Option[] }).options)
    : [];

  return (
    <article className="message agent product-agent-message">
      <span className="agent-badge">导演</span>
      {directorMessage && <p>{directorMessage}</p>}
      <div className="option-cards">
        {options.map((opt) => (
          <button
            className="option-card"
            key={opt.id}
            onClick={() => onSelect(`${opt.label}：${opt.hook}`, { genesisStep: "params" })}
            type="button"
          >
            <strong>{opt.label}</strong>
            <span>{opt.hook}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function ExpansionMessage({
  directorMessage,
  onSelect,
  payload
}: {
  directorMessage: string;
  onSelect: (content: string, meta?: SendMessageMeta) => void;
  payload: unknown;
}) {
  type Option = { name: string; hook_3s: string; core_appeal: string; why_binge: string };
  const options: Option[] = Array.isArray((payload as { options?: unknown })?.options)
    ? ((payload as { options: Option[] }).options)
    : [];

  return (
    <article className="message agent product-agent-message">
      <span className="agent-badge">导演</span>
      {directorMessage && <p>{directorMessage}</p>}
      <div className="expansion-cards">
        {options.map((opt, i) => (
          <button
            className="expansion-card"
            key={i}
            onClick={() => onSelect(opt.name, { genesisStep: "params" })}
            type="button"
          >
            <strong>{opt.name}</strong>
            <p>{opt.hook_3s}</p>
            <span>{opt.core_appeal}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

const POLL_SCRIPTS: Record<string, { question: string; options: string[] }> = {
  g1_poll_genre: {
    question: "你想做哪种类型？",
    options: ["爱情", "悬疑", "职场", "奇幻", "犯罪"]
  },
  g1_poll_emotion: {
    question: "你希望观众看完什么感受？",
    options: ["爽", "感动", "恐惧", "共鸣", "震撼"]
  },
  g1_poll_setting: {
    question: "故事发生在什么背景下？",
    options: ["现代都市", "古代", "未来", "异世界", "末日"]
  }
};

function QuickPollMessage({
  onSelect,
  pollScriptId
}: {
  onSelect: (content: string) => void;
  pollScriptId: string;
}) {
  const script = POLL_SCRIPTS[pollScriptId] ?? {
    question: "能再说得具体一点吗？",
    options: ["继续描述我的想法", "换个方向试试"]
  };

  return (
    <article className="message agent product-agent-message">
      <span className="agent-badge">导演</span>
      <p>{script.question}</p>
      <div className="quick-poll">
        {script.options.map((opt) => (
          <button
            className="poll-option"
            key={opt}
            onClick={() => onSelect(opt)}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </article>
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

function ParamCollectionMessage({
  directorMessage,
  onConfirm,
  payload
}: {
  directorMessage: string;
  onConfirm: (content: string, meta?: SendMessageMeta) => void;
  payload: unknown;
}) {
  type ParamField = { id: string; label: string; type: "select"; options: string[] };
  type ParamCollection = { selected_direction: string; fields: ParamField[] };
  const data = payload && typeof payload === "object" ? (payload as ParamCollection) : null;
  const fields: ParamField[] = Array.isArray(data?.fields) ? data.fields : [];

  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.id, f.options[0] ?? ""]))
  );
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = useCallback(() => {
    if (confirmed) return;
    setConfirmed(true);
    const summary = fields.map((f) => selections[f.id]).filter(Boolean).join(" / ");
    const content = `参数已定：${summary}`;
    onConfirm(content, {
      genesisStep: "create",
      clientContext: { params: { ...selections }, selected_direction: data?.selected_direction ?? "" }
    });
  }, [confirmed, fields, selections, data, onConfirm]);

  return (
    <article className="message agent product-agent-message">
      <span className="agent-badge">导演</span>
      {directorMessage && <p>{directorMessage}</p>}
      <div className="param-collection">
        {fields.map((field) => (
          <div className="param-row" key={field.id}>
            <span className="param-label">{field.label}</span>
            <div className="param-options">
              {field.options.map((opt) => (
                <button
                  className={`param-opt${selections[field.id] === opt ? " selected" : ""}`}
                  disabled={confirmed}
                  key={opt}
                  onClick={() => setSelections((prev) => ({ ...prev, [field.id]: opt }))}
                  type="button"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="param-confirm-row">
          <button
            className="param-confirm-btn"
            disabled={confirmed}
            onClick={handleConfirm}
            type="button"
          >
            {confirmed ? "已确认，搭建中…" : "确认，开始构建世界观"}
          </button>
        </div>
      </div>
    </article>
  );
}

function WorldCardMessage({
  directorMessage,
  onConfirm,
  payload
}: {
  directorMessage: string;
  onConfirm: (content: string, meta?: SendMessageMeta) => void;
  payload: unknown;
}) {
  type Character = { name: string; role: string; trait: string };
  type WorldCard = { title: string; logline: string; characters: Character[]; mechanism: string; visual_style: string; red_lines: string[] };
  const card = payload && typeof payload === "object" ? (payload as WorldCard) : null;
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = useCallback(() => {
    if (confirmed || !card) return;
    setConfirmed(true);
    onConfirm(`世界观确认，开始写${card.title}大纲`, { genesisStep: "outline" });
  }, [confirmed, card, onConfirm]);

  if (!card) return null;

  return (
    <article className="message agent product-agent-message world-card-message">
      <span className="agent-badge">导演</span>
      {directorMessage && <p>{directorMessage}</p>}
      <div className="world-card">
        <h3 className="world-card-title">{card.title}</h3>
        <p className="world-card-logline">{card.logline}</p>
        <div className="world-card-section">
          <span className="world-card-label">核心机制</span>
          <p>{card.mechanism}</p>
        </div>
        <div className="world-card-section">
          <span className="world-card-label">视觉风格</span>
          <p>{card.visual_style}</p>
        </div>
        {Array.isArray(card.characters) && card.characters.length > 0 && (
          <div className="world-card-section">
            <span className="world-card-label">角色</span>
            <ul className="world-card-chars">
              {card.characters.map((c, i) => (
                <li key={i}><strong>{c.name}</strong>（{c.role}）{c.trait}</li>
              ))}
            </ul>
          </div>
        )}
        {Array.isArray(card.red_lines) && card.red_lines.length > 0 && (
          <div className="world-card-section">
            <span className="world-card-label">红线</span>
            <ul className="world-card-redlines">
              {card.red_lines.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
        <div className="world-card-actions">
          <button
            className="world-card-confirm"
            disabled={confirmed}
            onClick={handleConfirm}
            type="button"
          >
            {confirmed ? "已确认，导演拆大纲中…" : "确认，开始拆整季大纲"}
          </button>
        </div>
      </div>
    </article>
  );
}

function OutlineCardMessage({
  directorMessage,
  onConfirm,
  payload
}: {
  directorMessage: string;
  onConfirm: (content: string, meta?: SendMessageMeta) => void;
  payload: unknown;
}) {
  type OutlineEp = { ep: number; title: string; synopsis: string };
  type OutlineCard = { title: string; episode_count: number; season_arc: string; episodes: OutlineEp[] };
  const card = payload && typeof payload === "object" ? (payload as OutlineCard) : null;
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = useCallback(() => {
    if (confirmed || !card) return;
    setConfirmed(true);
    onConfirm(`大纲确认，开始写${card.title}第一集`);
  }, [confirmed, card, onConfirm]);

  if (!card) return null;

  return (
    <article className="message agent product-agent-message outline-card-message">
      <span className="agent-badge">导演</span>
      {directorMessage && <p>{directorMessage}</p>}
      <div className="outline-card">
        <div className="outline-card-header">
          <h3 className="outline-card-title">{card.title}</h3>
          <span className="outline-card-ep-count">{card.episode_count}集</span>
        </div>
        {card.season_arc && (
          <p className="outline-card-arc">{card.season_arc}</p>
        )}
        <ol className="outline-card-episodes">
          {Array.isArray(card.episodes) && card.episodes.map((ep) => (
            <li key={ep.ep} className="outline-ep-row">
              <span className="outline-ep-num">EP{ep.ep}</span>
              <span className="outline-ep-title">{ep.title}</span>
              <span className="outline-ep-synopsis">{ep.synopsis}</span>
            </li>
          ))}
        </ol>
        <div className="outline-card-actions">
          <button
            className="outline-card-confirm"
            disabled={confirmed}
            onClick={handleConfirm}
            type="button"
          >
            {confirmed ? "已确认，等待编剧接手…" : "确认大纲，开始写单集"}
          </button>
        </div>
      </div>
    </article>
  );
}

const AGENT_LABELS: Record<string, string> = {
  director: "导演",
  screenwriter: "编剧",
  storyboard: "分镜师",
  asset: "资产师",
  cinematographer: "摄影师"
};

function AgentThinkingCard({
  agentId,
  agentName,
  isDone,
  text
}: {
  agentId: string;
  agentName: string;
  isDone: boolean;
  text: string;
}) {
  const label = AGENT_LABELS[agentId] ?? agentName;
  return (
    <article className={`message agent agent-thinking${isDone ? " agent-thinking-done" : ""}`}>
      <span className="agent-badge">{label}</span>
      <div className="thinking-text">
        {text}
        {!isDone && <span className="thinking-cursor" aria-hidden="true" />}
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

function readText(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}
