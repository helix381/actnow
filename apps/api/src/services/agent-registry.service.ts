import { Injectable } from "@nestjs/common";
import type { ActNowAgentId } from "@actnow/shared";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type AgentDefinition = {
  id: ActNowAgentId;
  description: string;
  model?: string;
  tools: string[];
  maxTurns?: number;
  background: boolean;
  color?: string;
  systemPrompt: string;
};

const AGENT_FILES: Record<ActNowAgentId, string> = {
  director: "director.system.md",
  screenwriter: "screenwriter.system.md",
  storyboard: "storyboard.system.md",
  asset: "asset.system.md",
  cinematographer: "cinematographer.system.md"
};

@Injectable()
export class AgentRegistryService {
  private cache: Map<ActNowAgentId, AgentDefinition> | null = null;

  list() {
    return Array.from(this.loadAll().values());
  }

  get(id: ActNowAgentId) {
    const agent = this.loadAll().get(id);
    if (!agent) {
      throw new Error(`Agent definition not found: ${id}`);
    }
    return agent;
  }

  listWorkers() {
    return this.list().filter((agent) => agent.id !== "director");
  }

  private loadAll() {
    if (this.cache) {
      return this.cache;
    }

    const agentsDir = process.env.AGENTS_DIR || this.findAgentsDir();
    const entries = new Map<ActNowAgentId, AgentDefinition>();

    for (const [id, fileName] of Object.entries(AGENT_FILES) as Array<[ActNowAgentId, string]>) {
      const filePath = join(agentsDir, fileName);
      if (!existsSync(filePath)) {
        throw new Error(`Agent definition file not found: ${filePath}`);
      }

      const source = readFileSync(filePath, "utf8");
      entries.set(id, this.parseAgentFile(id, source));
    }

    this.cache = entries;
    return entries;
  }

  private findAgentsDir() {
    let current = process.cwd();

    for (let depth = 0; depth < 6; depth += 1) {
      const candidate = join(current, "agents");
      if (existsSync(candidate)) {
        return candidate;
      }

      const parent = dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }

    return join(process.cwd(), "agents");
  }

  private parseAgentFile(expectedId: ActNowAgentId, source: string): AgentDefinition {
    const { frontmatter, body } = this.splitFrontmatter(source);
    const name = this.readString(frontmatter, "name");

    if (name !== expectedId) {
      throw new Error(`Agent definition name mismatch: expected ${expectedId}, got ${name || "empty"}`);
    }

    const description = this.readString(frontmatter, "description");
    if (!description) {
      throw new Error(`Agent definition ${expectedId} is missing description`);
    }

    const systemPrompt = body.trim();
    if (!systemPrompt) {
      throw new Error(`Agent definition ${expectedId} has empty system prompt`);
    }

    return {
      id: expectedId,
      description,
      model: this.readString(frontmatter, "model") || undefined,
      tools: this.readStringList(frontmatter, "tools"),
      maxTurns: this.readNumber(frontmatter, "maxTurns"),
      background: this.readBoolean(frontmatter, "background") ?? false,
      color: this.readString(frontmatter, "color") || undefined,
      systemPrompt
    };
  }

  private splitFrontmatter(source: string) {
    const normalized = source.replace(/^\uFEFF/, "");
    if (!normalized.startsWith("---")) {
      return { frontmatter: new Map<string, string>(), body: normalized };
    }

    const end = normalized.indexOf("\n---", 3);
    if (end === -1) {
      return { frontmatter: new Map<string, string>(), body: normalized };
    }

    const rawFrontmatter = normalized.slice(3, end).trim();
    const body = normalized.slice(end + 4);
    const frontmatter = new Map<string, string>();

    for (const line of rawFrontmatter.split(/\r?\n/)) {
      const separator = line.indexOf(":");
      if (separator === -1) {
        continue;
      }
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      if (key) {
        frontmatter.set(key, value);
      }
    }

    return { frontmatter, body };
  }

  private readString(frontmatter: Map<string, string>, key: string) {
    const raw = frontmatter.get(key);
    if (!raw) {
      return "";
    }
    return raw.replace(/^["']|["']$/g, "").trim();
  }

  private readStringList(frontmatter: Map<string, string>, key: string) {
    const raw = frontmatter.get(key);
    if (!raw) {
      return [];
    }

    const trimmed = raw.trim();
    if (trimmed === "[]") {
      return [];
    }

    const inner = trimmed.startsWith("[") && trimmed.endsWith("]")
      ? trimmed.slice(1, -1)
      : trimmed;

    return inner
      .split(",")
      .map((item) => item.replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);
  }

  private readNumber(frontmatter: Map<string, string>, key: string) {
    const raw = frontmatter.get(key);
    if (!raw) {
      return undefined;
    }

    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }

  private readBoolean(frontmatter: Map<string, string>, key: string) {
    const raw = frontmatter.get(key);
    if (!raw) {
      return undefined;
    }

    if (raw === "true") {
      return true;
    }
    if (raw === "false") {
      return false;
    }
    return undefined;
  }
}
