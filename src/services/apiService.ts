import { getApiKeyForProvider, getApiUrlForProvider } from "@/lib/utils";
import { ChatRequest, ChatResponse, Provider } from "@/types";
import { sendGoogleRequest } from "./api/chat/providers/google";
import { sendOpenRouterRequest } from "./api/chat/providers/openrouter";
import { sendClaudeRequest } from "./api/chat/providers/anthropic";
import { sendOpenAICompatibleRequest } from "./api/chat/providers/openai-compatible";
import { sendFlowiseRequest } from "./api/chat/providers/flowise";
import { sendNeuraRequest } from "./api/chat/providers/neurarouter";
import { promptMeasures } from "@/lib/prompt-mapping";

/**
 * This file contains the API service for sending chat requests to various providers
 * including OpenAI, Groq, Claude, Flowise, and Google.
 */
export async function sendChatRequest(
  provider: Provider,
  chatRequest: ChatRequest
): Promise<ChatResponse | ReadableStream<Uint8Array>> {
  console.log(
    `[API Service] Provider selected: ${provider}, Model: ${chatRequest.model}`
  );

  const apiKey = getApiKeyForProvider(provider);
  const apiUrl = getApiUrlForProvider(provider);

  console.log(`[API Service] Using API URL: ${apiUrl}`);

  // Проверка API ключа для всех провайдеров, кроме Flowise и Local AI
  if (!apiKey && provider !== "flowise" && provider !== "local-ai") {
    throw new Error(
      `API key for ${provider} is not set. Please check your environment variables.`
    );
  }
  const systemPrompt = getSystemPrompt(
    chatRequest.messages.at(-1)?.content ?? ""
  );

  const finalMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...chatRequest.messages]
    : chatRequest.messages;

  const finalRequest = {
    ...chatRequest,
    messages: finalMessages,
  };

  if (provider === "local-ai") {
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const OPENROUTER_API_KEY =
      "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";

    return fetch(openRouterUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: finalRequest.model || "openai/gpt-3.5-turbo",
        messages: finalRequest.messages,
        temperature: finalRequest.temperature ?? 0.7,
        stream: false,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        console.error("OpenRouter error:", error);
        throw new Error(error.error?.message || "Ошибка OpenRouter");
      }

      return res.json();
    });
  }

  // Обработка других провайдеров
  switch (provider) {
    case "flowise":
      console.log(`[API Service] Sending request to Flowise`);
      return sendFlowiseRequest(apiUrl, apiKey, chatRequest);
    case "neurarouter":
      console.log(`[API Service] Sending request to Neura`);
      return sendNeuraRequest(apiUrl, apiKey, chatRequest);
    case "claude":
      console.log(`[API Service] Sending request to Claude`);
      return sendClaudeRequest(apiUrl, apiKey, chatRequest);
    case "openrouter":
      console.log(`[API Service] Sending request to OpenRouter`);
      return sendOpenRouterRequest(apiUrl, apiKey, chatRequest);
    case "google":
      console.log(`[API Service] Sending request to Google AI`);
      return sendGoogleRequest(apiUrl, apiKey, chatRequest);
    default:
      console.log(`[API Service] Sending request to OpenAI-compatible API`);
      return sendOpenAICompatibleRequest(apiUrl, apiKey, chatRequest);
  }
}

// Функция для отправки запроса к локальному AI
async function sendLocalAiRequest(apiUrl, chatRequest) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatRequest),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(
      `Error: ${response.status} - ${response.statusText}. Response: ${errorText}`
    );
  }

  // ✅ Возвращаем stream, не текст
  return response.body;
}

export function getSystemPrompt(userMessage: string): string | null {
  for (const measure of promptMeasures) {
    if (measure.match.test(userMessage)) {
      return measure.system;
    }
  }
  return null;
}
