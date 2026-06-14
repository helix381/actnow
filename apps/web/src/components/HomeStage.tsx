import { FormEvent, useState } from "react";
import { ProjectSummary } from "../lib/api";

type HomeStageProps = {
  error: string | null;
  isLoading: boolean;
  onCreate: (initialInput: string) => void;
  onOpenProject: (projectId: string) => void;
  onRetry: () => void;
  projects: ProjectSummary[];
};

export function HomeStage({ error, isLoading, onCreate, onOpenProject, onRetry, projects }: HomeStageProps) {
  const [initialInput, setInitialInput] = useState("一个失眠工程师在雨夜发现城市广告屏会预告未来");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = initialInput.trim();
    if (normalized) {
      onCreate(normalized);
    }
  };

  return (
    <div className="stage stage-home">
      <header className="home-header">
        <p className="eyebrow">Workspace</p>
        <h1>把一个灵感推进到可制作画布</h1>
        <p>先创建 demo project，再通过 Multi-Agent 聊天室整理剧本、分镜、资产和生成准备。</p>
      </header>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          aria-label="创作灵感"
          disabled={isLoading}
          onChange={(event) => setInitialInput(event.target.value)}
          placeholder="输入短剧、漫画或视频创意..."
          rows={4}
          value={initialInput}
        />
        <div className="composer-actions">
          <span className="chip">短剧路线</span>
          <span className="chip">Demo 模式</span>
          <button disabled={isLoading || !initialInput.trim()} type="submit">
            {isLoading ? "创建中..." : "开始创作"}
          </button>
        </div>
      </form>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <button className="secondary" onClick={onRetry} type="button">
            重试
          </button>
        </div>
      )}

      <section className="home-grid" aria-label="工作流概览">
        {["输入灵感", "Agent 对话", "确认写入", "进入画布"].map((label, index) => (
          <article className="summary-card" key={label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{label}</h2>
            <p>{homeSummaries[index]}</p>
          </article>
        ))}
      </section>

      <section className="project-list-section" aria-label="我的项目">
        <div className="section-title-row">
          <h2>我的项目</h2>
          <span>{projects.length} 个项目</span>
        </div>
        {projects.length === 0 ? (
          <p className="empty-projects">还没有项目。输入灵感后会在这里出现。</p>
        ) : (
          <div className="project-list-grid">
            {projects.map((project) => (
              <button
                className="project-tile"
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                type="button"
              >
                <strong>{project.title}</strong>
                <span>{project.current_stage === "canvas" ? "画布阶段" : "聊天阶段"}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const homeSummaries = [
  "POST /api/projects 创建项目和默认 AgentThread。",
  "导演 Agent 识别意图，路由到编剧、分镜、资产、摄影/机位专家。",
  "涉及写入的变更先生成确认卡片，确认后再落库。",
  "CanvasDocument 驱动 React Flow nodes/edges。"
];
