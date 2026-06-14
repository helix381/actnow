import { Background, Controls, Edge, MiniMap, Node, ReactFlow } from "@xyflow/react";
import { AgentEvent, CanvasNode, WorkspaceAggregate } from "../lib/api";

type CanvasStageProps = {
  events: AgentEvent[];
  onBackToChat: () => void;
  workspace: WorkspaceAggregate;
};

export function CanvasStage({ events, onBackToChat, workspace }: CanvasStageProps) {
  const nodes: Node[] = workspace.canvas.nodes.map(toFlowNode);
  const scriptDraft = workspace.script_drafts?.[0] ?? null;
  const edges: Edge[] = workspace.canvas.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.id.includes("storyboard"),
    type: "smoothstep"
  }));

  return (
    <div className="stage stage-canvas">
      <section className="canvas-toolbar">
        <div>
          <p className="eyebrow">Canvas Stage</p>
          <h1>{workspace.project.title}</h1>
        </div>
        <button className="secondary" onClick={onBackToChat} type="button">
          返回聊天
        </button>
      </section>

      <section className="canvas-layout">
        <aside className="canvas-sidebar">
          <h2>我的剧本</h2>
          <p>剧本已进入画布，后续角色、分镜和资产都从这里继续拆解。</p>
          {scriptDraft && (
            <article className="script-preview-card">
              <div>
                <strong>剧本正文</strong>
                <span>v{scriptDraft.version}</span>
              </div>
              <p>{scriptDraft.content}</p>
            </article>
          )}
          <ul className="entity-list">
            {workspace.scenes?.map((scene) => (
              <li key={scene.id}>
                <b>{scene.title}</b>
                <span>{scene.id}</span>
              </li>
            ))}
          </ul>
          <h2>事件</h2>
          <ul className="event-mini-list">
            {events.slice(-3).map((event) => (
              <li key={event.id}>{event.event_type}</li>
            ))}
          </ul>
        </aside>

        <div className="flow-shell">
          <ReactFlow
            defaultEdges={edges}
            defaultNodes={nodes}
            defaultViewport={workspace.canvas.viewport}
            fitView
            minZoom={0.4}
            nodesDraggable
          >
            <Background />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </div>
      </section>
    </div>
  );
}

function toFlowNode(node: CanvasNode): Node {
  return {
    id: node.id,
    position: node.position,
    data: {
      label: (
        <div className="flow-node">
          <span className={`status-dot ${node.data.status ?? "ready"}`} />
          <strong>{node.data.label}</strong>
          <small>{node.data.summary}</small>
          <code>
            {node.data.ref.type}:{node.data.ref.id}
          </code>
        </div>
      )
    },
    type: "default"
  };
}
