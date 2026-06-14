import { Injectable } from "@nestjs/common";
import type { ActNowAgentId } from "@actnow/shared";
import { randomUUID } from "node:crypto";
import { AgentRegistryService, type AgentDefinition } from "./agent-registry.service.js";
import { TextModelService } from "./text-model.service.js";

type WorkerAgentId = Exclude<ActNowAgentId, "director">;

type AgentOutput = {
  agent_id: WorkerAgentId;
  agent_name: string;
  content: string;
  model: string;
  used_model: boolean;
};

type PlannedAction = {
  action_id: string;
  action_type:
    | "draft_script"
    | "update_shot_description"
    | "create_scene"
    | "create_shot"
    | "create_asset"
    | "create_generation_task"
    | "update_canvas";
  target_type: "script" | "scene" | "shot" | "asset" | "generation_task" | "canvas";
  target_id?: string | null;
  summary: string;
  diff?: {
    before?: string | null;
    after?: string;
  };
  status: "pending_approval";
};

type DirectorRoute = {
  intent:
    | "creative_brainstorm"
    | "script_structuring"
    | "storyboard_breakdown"
    | "shot_revision"
    | "asset_extraction"
    | "generation_prep"
    | "canvas_operation"
    | "clarification";
  selected_agents: WorkerAgentId[];
  needs_approval: boolean;
  planned_actions: PlannedAction[];
  director_message: string;
  used_model: boolean;
  raw_output?: string | null;
  parse_error?: string | null;
};

type RunInput = {
  userMessage: string;
  threadSummary?: string | null;
  history: Array<{ role: string; content: string }>;
  focusRef?: { type: string; id: string } | null;
  clientContext?: Record<string, unknown>;
};

const INTENT_LABELS: Record<DirectorRoute["intent"], string> = {
  creative_brainstorm: "创意发散",
  script_structuring: "剧本整理",
  storyboard_breakdown: "分镜拆解",
  shot_revision: "镜头修改",
  asset_extraction: "资产抽取",
  generation_prep: "生成准备",
  canvas_operation: "画布操作",
  clarification: "追问澄清"
};

const AGENT_LABELS: Record<ActNowAgentId, string> = {
  director: "导演 Agent",
  screenwriter: "编剧 Agent",
  storyboard: "分镜 Agent",
  asset: "资产 Agent",
  cinematographer: "摄影/机位 Agent"
};

@Injectable()
export class MultiAgentOrchestratorService {
  constructor(
    private readonly textModel: TextModelService,
    private readonly agentRegistry: AgentRegistryService
  ) {}

  async run(input: RunInput) {
    const runId = `run_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const route = await this.decideRoute(input);
    const outputs = await Promise.all(
      route.selected_agents.map((agentId) => this.runWorkerAgent(agentId, input, route))
    );

    return {
      run_id: runId,
      route,
      agents: outputs,
      approval:
        route.needs_approval && route.planned_actions.length > 0
          ? this.createApprovalPayload(runId, route)
          : null,
      final_text: this.composeFinal(route, outputs),
      model_provider: this.textModel.enabled ? this.textModel.providerName : "local-fallback",
      model_routing: {
        director: this.resolveDirectorModel(),
        worker: this.resolveWorkerModel()
      }
    };
  }

  private async decideRoute(input: RunInput): Promise<DirectorRoute> {
    const raw = await this.callDirectorModel(input);
    if (!raw.content) {
      return this.fallbackRoute(input, raw.error ?? null);
    }

    const parsed = this.parseDirectorRoute(raw.content, input);
    return {
      ...parsed,
      used_model: raw.usedModel,
      raw_output: raw.content,
      parse_error: parsed.parse_error ?? null
    };
  }

  private async callDirectorModel(input: RunInput) {
    const director = this.agentRegistry.get("director");

    try {
      const content = await this.textModel.complete(
        [
          {
            role: "system",
            content: [
              director.systemPrompt,
              "## 本轮可用专家",
              this.agentRegistry
                .listWorkers()
                .map((agent) => `- ${agent.id}: ${agent.description}`)
                .join("\n")
            ].join("\n\n")
          },
          {
            role: "user",
            content: this.contextBlock(input)
          }
        ],
        this.resolveDirectorModel()
      );
      return { content, usedModel: Boolean(content), error: null };
    } catch (error) {
      return {
        content: null,
        usedModel: false,
        error: error instanceof Error ? error.message : "unknown error"
      };
    }
  }

  private async runWorkerAgent(
    agentId: WorkerAgentId,
    input: RunInput,
    route: DirectorRoute
  ): Promise<AgentOutput> {
    const agent = this.agentRegistry.get(agentId);
    const modelContent = await this.callWorkerModel(agent, input, route);

    return {
      agent_id: agentId,
      agent_name: AGENT_LABELS[agentId],
      content: modelContent.content ?? this.fallback(agentId, input.userMessage, route),
      model: this.resolveAgentModel(agent),
      used_model: modelContent.usedModel
    };
  }

  private async callWorkerModel(agent: AgentDefinition, input: RunInput, route: DirectorRoute) {
    try {
      const content = await this.textModel.complete(
        [
          {
            role: "system",
            content: agent.systemPrompt
          },
          {
            role: "user",
            content: [
              "你是被导演 Agent 临时调用的独立专家。你没有上一轮隐式上下文，必须只基于下面信息完成本轮任务。",
              this.contextBlock(input),
              `导演路由：${JSON.stringify({
                intent: route.intent,
                selected_agents: route.selected_agents,
                needs_approval: route.needs_approval,
                planned_actions: route.planned_actions
              })}`,
              "请给出你这一位专家的结论。保持简洁、具体、可执行。"
            ].join("\n\n")
          }
        ],
        this.resolveAgentModel(agent)
      );
      return { content, usedModel: Boolean(content) };
    } catch {
      return { content: null, usedModel: false };
    }
  }

  private parseDirectorRoute(content: string, input: RunInput): DirectorRoute {
    const fallback = this.fallbackRoute(input, null);

    try {
      const parsed = JSON.parse(this.extractJsonObject(content)) as Partial<DirectorRoute>;
      const selectedAgents = Array.isArray(parsed.selected_agents)
        ? parsed.selected_agents.filter((agentId): agentId is WorkerAgentId =>
            this.workerAgentIds().includes(agentId as WorkerAgentId)
          )
        : fallback.selected_agents;
      const plannedActions = this.normalizePlannedActions(parsed.planned_actions, input);
      const intent = this.normalizeIntent(parsed.intent, fallback.intent);

      return {
        intent,
        selected_agents:
          selectedAgents.length > 0 || intent === "clarification"
            ? selectedAgents
            : fallback.selected_agents,
        needs_approval:
          typeof parsed.needs_approval === "boolean"
            ? parsed.needs_approval
            : plannedActions.length > 0,
        planned_actions: plannedActions,
        director_message:
          typeof parsed.director_message === "string" && parsed.director_message.trim()
            ? parsed.director_message.trim()
            : fallback.director_message,
        used_model: true,
        raw_output: content,
        parse_error: null
      };
    } catch (error) {
      return {
        ...fallback,
        raw_output: content,
        parse_error: error instanceof Error ? error.message : "invalid director json"
      };
    }
  }

  private extractJsonObject(content: string) {
    const trimmed = content.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced?.[1]?.trim() ?? trimmed;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("director output does not contain a JSON object");
    }

    return candidate.slice(start, end + 1);
  }

  private normalizeIntent(value: unknown, fallback: DirectorRoute["intent"]) {
    const intents = Object.keys(INTENT_LABELS) as Array<DirectorRoute["intent"]>;
    return intents.includes(value as DirectorRoute["intent"])
      ? (value as DirectorRoute["intent"])
      : fallback;
  }

  private normalizePlannedActions(value: unknown, input: RunInput): PlannedAction[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => {
        const targetType = this.normalizeTargetType(
          typeof item.target_type === "string" ? item.target_type : "shot"
        );
        const targetId =
          typeof item.target_id === "string"
            ? item.target_id
            : input.focusRef?.type === targetType
              ? input.focusRef.id
              : null;

        return {
          action_id: randomUUID(),
          action_type: this.normalizeActionType(item.action_type),
          target_type: targetType,
          target_id: targetId,
          summary:
            typeof item.summary === "string" && item.summary.trim()
              ? item.summary.trim()
              : "待确认的项目变更",
          diff:
            item.diff && typeof item.diff === "object"
              ? (item.diff as PlannedAction["diff"])
              : undefined,
          status: "pending_approval"
        };
      });
  }

  private normalizeActionType(value: unknown): PlannedAction["action_type"] {
    const allowed: PlannedAction["action_type"][] = [
      "draft_script",
      "update_shot_description",
      "create_scene",
      "create_shot",
      "create_asset",
      "create_generation_task",
      "update_canvas"
    ];
    return allowed.includes(value as PlannedAction["action_type"])
      ? (value as PlannedAction["action_type"])
      : "update_shot_description";
  }

  private normalizeTargetType(value: string): PlannedAction["target_type"] {
    const allowed: PlannedAction["target_type"][] = [
      "script",
      "scene",
      "shot",
      "asset",
      "generation_task",
      "canvas"
    ];
    return allowed.includes(value as PlannedAction["target_type"])
      ? (value as PlannedAction["target_type"])
      : "shot";
  }

  private fallbackRoute(input: RunInput, modelError: string | null): DirectorRoute {
    const message = input.userMessage.trim();
    const selected = new Set<WorkerAgentId>();
    let intent: DirectorRoute["intent"] = "creative_brainstorm";
    let needsApproval = false;
    const plannedActions: PlannedAction[] = [];

    if (/(第\s*\d+\s*(镜|shot)|镜头|分镜|压迫|机位|景别|低角度|光线)/i.test(message)) {
      intent = /(修改|调整|更新|替换|压迫)/.test(message) ? "shot_revision" : "storyboard_breakdown";
      selected.add("storyboard");
      selected.add("cinematographer");
      needsApproval = /(修改|调整|更新|写入|替换)/.test(message);
    }

    if (/(剧本|三幕|台词|人物动机|冲突|故事|剧情)/.test(message)) {
      intent = intent === "creative_brainstorm" ? "script_structuring" : intent;
      selected.add("screenwriter");
      needsApproval = needsApproval || /(写入|生成正式|锁定|修改|更新)/.test(message);
    }

    if (/(资产|角色|场景|道具|参考|素材)/.test(message)) {
      intent = intent === "creative_brainstorm" ? "asset_extraction" : intent;
      selected.add("asset");
      needsApproval = needsApproval || /(写入|创建|新增|抽取|生成清单)/.test(message);
    }

    if (/(生成|prompt|提示词|视频|图像|关键帧)/i.test(message)) {
      intent = "generation_prep";
      selected.add("storyboard");
      selected.add("cinematographer");
      selected.add("asset");
      needsApproval = true;
    }

    if (/(画布|节点|workflow|流程)/i.test(message)) {
      intent = "canvas_operation";
      selected.add("storyboard");
      selected.add("asset");
      needsApproval = true;
    }

    if (message.length < 4 || /(什么意思|你是谁|怎么用)/.test(message)) {
      intent = "clarification";
      needsApproval = false;
      selected.clear();
    }

    if (selected.size === 0 && intent !== "clarification") {
      selected.add("screenwriter");
      selected.add("asset");
    }

    if (needsApproval) {
      plannedActions.push({
        action_id: randomUUID(),
        action_type: intent === "generation_prep" ? "create_generation_task" : "update_shot_description",
        target_type: intent === "generation_prep" ? "generation_task" : "shot",
        target_id: input.focusRef?.type === "shot" ? input.focusRef.id : null,
        summary:
          intent === "shot_revision"
            ? "根据本轮指令更新镜头描述，确认前不写入 Shot。"
            : "根据本轮指令生成待确认的项目变更，确认前不写入业务对象。",
        diff: {
          before: null,
          after: message
        },
        status: "pending_approval"
      });
    }

    return {
      intent,
      selected_agents: Array.from(selected),
      needs_approval: needsApproval,
      planned_actions: plannedActions,
      director_message: modelError
        ? `导演模型未返回可用结果，已使用本地路由。${modelError}`
        : `我会按“${INTENT_LABELS[intent]}”处理这轮输入，并选择合适专家给出建议。`,
      used_model: false,
      raw_output: null,
      parse_error: null
    };
  }

  private fallback(agentId: WorkerAgentId, userMessage: string, route: DirectorRoute) {
    const snippets: Record<WorkerAgentId, string> = {
      screenwriter:
        "剧情层先保留用户原意，补一个可执行冲突：主角目标更明确，阻力更具体，每场都要有可被镜头表现的动作。",
      storyboard:
        "分镜层建议拆成 3 个节点：建立处境、制造压力、给出反转。每个节点后续都能绑定 Scene/Shot。",
      asset:
        "资产层需要标记角色形态、关键场景、道具和参考素材。暂不生成真实图像，先准备 prompt package 所需引用。",
      cinematographer:
        "机位层建议使用更近的景别、低角度、压缩空间、较短镜头时长和明确光源来增强压迫感。"
    };

    const approvalNote = route.needs_approval ? "涉及写入的部分会先进入确认卡片。" : "";
    return `${snippets[agentId]} ${approvalNote}`.trim() || userMessage;
  }

  private createApprovalPayload(runId: string, route: DirectorRoute) {
    return {
      approval_id: `approval_${randomUUID()}`,
      run_id: runId,
      title: "等待确认的项目变更",
      status: "pending",
      target_type: route.planned_actions[0]?.target_type ?? "shot",
      actions: route.planned_actions,
      diff: route.planned_actions.map((action) => ({
        action_id: action.action_id,
        target_type: action.target_type,
        target_id: action.target_id ?? null,
        summary: action.summary,
        before: action.diff?.before ?? null,
        after: action.diff?.after ?? null
      }))
    };
  }

  private composeFinal(route: DirectorRoute, outputs: AgentOutput[]) {
    if (route.intent === "clarification") {
      return route.director_message;
    }

    const expertSummary = outputs.length > 0
      ? "我已经让相关创作专家完成初步判断。"
      : "我已经完成初步判断。";
    const approvalLine = route.needs_approval
      ? "接下来先确认工作流和短片参数；确认前不会写入项目。"
      : "这一步只做创作规划，不会写入项目。";

    return [
      "规划完成。",
      route.director_message,
      expertSummary,
      approvalLine
    ].join("\n");
  }

  private contextBlock(input: RunInput) {
    return [
      `用户本轮输入：${input.userMessage}`,
      `线程摘要：${input.threadSummary || "暂无"}`,
      `焦点对象：${input.focusRef ? `${input.focusRef.type}:${input.focusRef.id}` : "暂无"}`,
      `客户端上下文：${JSON.stringify(input.clientContext ?? {})}`,
      `最近历史：${input.history.map((item) => `${item.role}: ${item.content}`).join("\n") || "暂无"}`
    ].join("\n\n");
  }

  private workerAgentIds() {
    return this.agentRegistry.listWorkers().map((agent) => agent.id as WorkerAgentId);
  }

  private resolveDirectorModel() {
    return (
      process.env.TEXT_MODEL_DIRECTOR_MODEL ||
      this.agentRegistry.get("director").model ||
      "deepseek-v4-pro"
    );
  }

  private resolveWorkerModel() {
    return process.env.TEXT_MODEL_WORKER_MODEL || process.env.DEFAULT_TEXT_MODEL || "deepseek-v4-flash";
  }

  private resolveAgentModel(agent: AgentDefinition) {
    return process.env.TEXT_MODEL_WORKER_MODEL || agent.model || this.resolveWorkerModel();
  }
}
