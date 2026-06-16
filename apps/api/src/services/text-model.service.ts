import { Injectable } from "@nestjs/common";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type TextModelProvider = {
  url: string;
  modelId: string;
};

const ACTNOW_PROXY_PROVIDERS: Record<string, TextModelProvider> = {
  "gemini-3-flash-preview": {
    url: "https://text-aigc.vod-qcloud.com/v1/chat/completions",
    modelId: "tencent_vod"
  },
  "gemini-3.1-flash-lite-preview": {
    url: "https://text-aigc.vod-qcloud.com/v1/chat/completions",
    modelId: "tencent_vod"
  },
  "gemini-3.1-pro-preview": {
    url: "https://text-aigc.vod-qcloud.com/v1/chat/completions",
    modelId: "tencent_vod"
  },
  "gpt-5.4": {
    url: "https://text-aigc.vod-qcloud.com/v1/chat/completions",
    modelId: "tencent_vod"
  },
  "gpt-5.5": {
    url: "https://text-aigc.vod-qcloud.com/v1/chat/completions",
    modelId: "tencent_vod"
  },
  "gemini-3.5-flash": {
    url: "https://text-aigc.vod-qcloud.com/v1/chat/completions",
    modelId: "tencent_vod"
  },
  "deepseek-v4-pro": {
    url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelId: "bailian"
  },
  "deepseek-v4-flash": {
    url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelId: "bailian"
  },
  "qwen3-max": {
    url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelId: "qwen"
  },
  "gemini-3.1-pro-preview-geneasy": {
    url: "https://api.geneasy.ai/v1/chat/completions",
    modelId: "geneasy"
  },
  "gemini-3.1-flash-lite-preview-geneasy": {
    url: "https://api.geneasy.ai/v1/chat/completions",
    modelId: "geneasy"
  },
  "doubao-seed-2-0-pro-260215": {
    url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    modelId: "doubao_seed_2_0_pro"
  }
};

const DEFAULT_ACTNOW_PROXY_PROVIDER: TextModelProvider = {
  url: "https://text-aigc.vod-qcloud.com/v1/chat/completions",
  modelId: "tencent_vod"
};

@Injectable()
export class TextModelService {
  private readonly baseUrl = process.env.TEXT_MODEL_PROXY_BASE_URL || "";
  private readonly apiKey = process.env.TEXT_MODEL_PROXY_API_KEY || "";
  private readonly defaultModel = process.env.DEFAULT_TEXT_MODEL || "deepseek-v4-flash";
  private readonly proxyMode = process.env.TEXT_MODEL_PROXY_MODE || "openai-compatible";
  private readonly proxyPath = process.env.TEXT_MODEL_PROXY_API_PATH || "/api/proxy";

  get enabled() {
    return Boolean(this.baseUrl && this.apiKey);
  }

  get providerName() {
    return this.proxyMode === "actnow-proxy" ? "company-proxy" : "openai-compatible";
  }

  async complete(messages: ChatMessage[], model = this.defaultModel) {
    if (!this.enabled || !model || model === "replace-with-model-id") {
      return null;
    }

    if (this.proxyMode === "actnow-proxy") {
      return this.completeViaActNowProxy(messages, model);
    }

    return this.completeViaOpenAiCompatible(messages, model);
  }

  async *stream(messages: ChatMessage[], model = this.defaultModel): AsyncGenerator<string> {
    if (!this.enabled || !model || model === "replace-with-model-id") {
      return;
    }
    if (this.proxyMode === "actnow-proxy") {
      yield* this.streamViaActNowProxy(messages, model);
    } else {
      yield* this.streamViaOpenAiCompatible(messages, model);
    }
  }

  private async *streamViaOpenAiCompatible(messages: ChatMessage[], model: string): AsyncGenerator<string> {
    const endpoint = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.7, stream: true })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`text model request failed: ${response.status} ${detail}`);
    }
    yield* this.parseSseStream(response.body!);
  }

  private async *streamViaActNowProxy(messages: ChatMessage[], model: string): AsyncGenerator<string> {
    const provider = ACTNOW_PROXY_PROVIDERS[model] ?? DEFAULT_ACTNOW_PROXY_PROVIDER;
    const proxyBaseUrl = this.baseUrl.replace(/\/$/, "");
    const endpoint = `${proxyBaseUrl}${this.proxyPath}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Origin: proxyBaseUrl,
        Referer: `${proxyBaseUrl}/`,
        "X-API-Key": this.apiKey
      },
      body: JSON.stringify({
        url: provider.url,
        model_id: provider.modelId,
        model,
        thinking_enabled: false,
        body: { model, messages, temperature: 0.7, stream: true, max_tokens: Number(process.env.TEXT_MODEL_PROXY_MAX_TOKENS || 4096) }
      })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`text model proxy request failed: ${response.status} ${detail}`);
    }
    yield* this.parseSseStream(response.body!);
  }

  private async *parseSseStream(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) yield token;
          } catch { /* ignore */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async completeViaOpenAiCompatible(messages: ChatMessage[], model: string) {
    const endpoint = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`text model request failed: ${response.status} ${detail}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    return data.choices?.[0]?.message?.content?.trim() || null;
  }

  private async completeViaActNowProxy(messages: ChatMessage[], model: string) {
    const provider = ACTNOW_PROXY_PROVIDERS[model] ?? DEFAULT_ACTNOW_PROXY_PROVIDER;
    const proxyBaseUrl = this.baseUrl.replace(/\/$/, "");
    const endpoint = `${proxyBaseUrl}${this.proxyPath}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: proxyBaseUrl,
        Referer: `${proxyBaseUrl}/`,
        "X-API-Key": this.apiKey
      },
      body: JSON.stringify({
        url: provider.url,
        model_id: provider.modelId,
        model,
        thinking_enabled: false,
        body: {
          model,
          messages,
          temperature: 0.7,
          stream: false,
          max_tokens: Number(process.env.TEXT_MODEL_PROXY_MAX_TOKENS || 4096)
        }
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`text model proxy request failed: ${response.status} ${detail}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    return data.choices?.[0]?.message?.content?.trim() || null;
  }
}
