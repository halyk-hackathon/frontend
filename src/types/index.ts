export type Provider = 'groq' | 'openai' | 'flowise' | 'openrouter' | 'neurarouter' | 'anthropic' | 'google';

export type Template = 'minimal' | 'vibrant' | 'elegant';

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  createdAt: Date;
  updatedAt?: Date;
  tokenCount?: number;
  audioUrl?: string;
  model?: string;
  modelA?: string;
  modelB?: string;
  providerA?: Provider;
  providerB?: Provider;
    meta?: {
    parsedJson?: any; // 👈 добавили поле для структурированных данных
  };
};

export type Conversation = {
  id: string;
  title: string;
  isArena: boolean;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  settings?: Settings; // Optional settings for the conversation
};

export type Settings = {
  provider: Provider;
  model: string;
  temperature: number;
  streamEnabled: boolean;
  reasoningFormat: string;
  template: Template;
  darkMode: boolean;
  systemPrompt: string;
  contextWindowSize: number; // Number of message pairs to include in context
  webSearchEnabled: boolean; // Whether to use web search capability
  audioResponseEnabled: boolean; // Whether to convert AI responses to speech
  // Arena mode specific settings
  providerA?: Provider;
  modelA?: string;
  temperatureA?: number;
  providerB?: Provider;
  modelB?: string;
  temperatureB?: number;
  arenaMode?: boolean;
  arenaModelLabel?: string;
};

export type ChatRequest = {
  messages: { role: string; content: string }[];
  model: string;
  temperature: number;
  stream: boolean;
  web_search_enabled?: boolean;
};

export type ChatResponse = {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
};

export type ChatStreamResponse = {
  id: string;
  choices: {
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }[];
};
