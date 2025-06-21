import { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/context/ChatContext";
import { sendChatRequest } from "@/services/apiService";
import { streamChatResponse, generateId, cleanAndFixText } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { SendHorizontal, Square } from "lucide-react";
import { ChatResponse } from "@/types";
import { AudioRecordButton } from "@/components/AudioRecordButton";
import { Paperclip } from "lucide-react";

const CHAT_ARENA_ENABLED = import.meta.env.VITE_CHAT_ARENA_ENABLED === "true";

interface MessageInputProps {
  className?: string;
  arenaMode?: boolean;
}

export function MessageInput({ className, arenaMode }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReasoning, setIsReasoning] = useState(false);
  const {
    addMessage,
    settings,
    conversations,
    currentConversationId,
    setConversations,
    isStreaming,
    startStreaming,
    stopStreaming,
    isInputDisabled,
  } = useChat();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setIsReasoning(true);

    const userMessage = message;
    const userMessageObj = {
      id: generateId(),
      role: "user" as const,
      content: userMessage,
      createdAt: new Date(),
      tokenCount: userMessage.trim().split(/\s+/).length,
    };

    try {
      let convId = currentConversationId;
      let conversation = conversations.find((c) => c.id === convId);

      if (!convId || !conversation) {
        const newConversation = {
          id: generateId(),
          title: "Новый чат",
          isArena: arenaMode || false,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        convId = newConversation.id;
        conversation = newConversation;

        setConversations((prev) => {
          const updated = [...prev, newConversation];
          localStorage.setItem("conversations", JSON.stringify(updated));
          return updated;
        });

        localStorage.setItem("currentConversationId", convId);

        if (typeof window !== "undefined") {
          const event = new CustomEvent("setCurrentConversationId", {
            detail: convId,
          });
          window.dispatchEvent(event);
        }
      }

      // Обновляем заголовок, если он "Новый чат"
      if (conversation?.title === "Новый чат") {
        const trimmed = userMessage.trim().replace(/\s+/g, " ").slice(0, 30);
        const newTitle = trimmed.length > 0 ? trimmed : "Новый чат";

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === convId ? { ...conv, title: newTitle } : conv
          )
        );

        const saved = JSON.parse(localStorage.getItem("conversations") || "[]");
        const updated = saved.map((conv: any) =>
          conv.id === convId ? { ...conv, title: newTitle } : conv
        );
        localStorage.setItem("conversations", JSON.stringify(updated));
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                messages: [...conv.messages, userMessageObj],
                updatedAt: new Date(),
              }
            : conv
        )
      );

      setMessage("");

      const messages = [];

      if (settings.systemPrompt?.trim()) {
        messages.push({ role: "system", content: settings.systemPrompt });
      }

      messages.push(
        ...conversation.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: userMessage }
      );

      const chatRequest = {
        messages,
        model: "local-ai",
        temperature: settings.temperature,
        stream: settings.streamEnabled,
      };

      const response = await sendChatRequest("local-ai", {
        role: "user",
        content: userMessage,
      });

      if (settings.streamEnabled && response instanceof ReadableStream) {
        const assistantMessage = {
          id: generateId(),
          role: "assistant" as const,
          content: "",
          createdAt: new Date(),
          tokenCount: 0,
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === convId
              ? {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: new Date(),
                }
              : conv
          )
        );

        const controller = startStreaming();
        let rawText = "";

        try {
          const stream = streamChatResponse(response);
          for await (const chunk of stream) {
            if (controller.signal.aborted) break;
            rawText += chunk;
          }

          const cleaned = cleanAndFixText(rawText);

          const words = cleaned
            .trim()
            .split(/\s+|[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/)
            .filter((word) => word.length > 0);

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === convId
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            content: cleaned,
                            tokenCount: words.length,
                          }
                        : msg
                    ),
                    updatedAt: new Date(),
                  }
                : conv
            )
          );
        } catch (err: any) {
          if (err.name !== "AbortError") throw err;
          console.log("Поток отменён пользователем");
        }
      } else if (!(response instanceof ReadableStream)) {
        const nonStreamResponse = response as ChatResponse;
        const content =
          nonStreamResponse.choices?.[0]?.message?.content ||
          "Нет ответа от Халык Автопилот";

        const cleaned = cleanAndFixText(content);

        const assistantMessage = {
          id: generateId(),
          role: "assistant" as const,
          content: cleaned,
          createdAt: new Date(),
          tokenCount: cleaned.trim().split(/\s+/).length,
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === convId
              ? {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: new Date(),
                }
              : conv
          )
        );
      }
    } catch (error: any) {
      console.error("Ошибка при отправке сообщения:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить сообщение",
        variant: "destructive",
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id: generateId(),
                    role: "assistant" as const,
                    content: "Произошла ошибка. Пожалуйста, попробуйте снова.",
                    createdAt: new Date(),
                    tokenCount: 0,
                  },
                ],
                updatedAt: new Date(),
              }
            : conv
        )
      );
    } finally {
      setIsSubmitting(false);
      setIsReasoning(false);
      stopStreaming();
    }
  };
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsSubmitting(true);
  setIsReasoning(true);

  const userMessage = `📎 Пользователь загрузил файл: ${file.name}`;

  const userMessageObj = {
    id: generateId(),
    role: "user" as const,
    content: userMessage,
    createdAt: new Date(),
    tokenCount: userMessage.trim().split(/\s+/).length,
  };

  // Добавим сообщение в чат
  setConversations((prev) =>
    prev.map((conv) =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, userMessageObj],
            updatedAt: new Date(),
          }
        : conv
    )
  );

  // Очистим input
  e.target.value = "";

  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Не удалось загрузить файл");
    }

    const result = await uploadResponse.json();

    // Можно отправить assistant-ответ
    const assistantMessage = {
      id: generateId(),
      role: "assistant" as const,
      content: `Файл "${file.name}" успешно обработан. ${result.message || ""}`,
      createdAt: new Date(),
      tokenCount: result.message?.split(/\s+/).length || 0,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: new Date(),
            }
          : conv
      )
    );
  } catch (error: any) {
    console.error(error);
    toast({
      title: "Ошибка при загрузке файла",
      description: error.message || "Попробуйте позже",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
    setIsReasoning(false);
  }
};

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t p-4 bg-background/80 backdrop-blur-sm"
    >
    <div className="relative flex items-center">
  <Textarea
    ref={textareaRef}
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    }}
    placeholder={
      isReasoning
        ? "Халык Автопилот размышляет..."
        : isInputDisabled
        ? "Обработка голосового сообщения..."
        : "Введите ваше сообщение..."
    }
    className="pr-14 min-h-[60px] max-h-[200px] resize-none"
    disabled={isSubmitting || isReasoning || isInputDisabled}
  />

  {isReasoning ? (
    <div className="absolute right-2 flex items-center justify-center">
      {isStreaming ? (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="h-8 w-8"
          onClick={() => stopStreaming()}
          title="Остановить генерацию"
        >
          <Square className="h-4 w-4" />
          <span className="sr-only">Остановить</span>
        </Button>
      ) : (
        <div className="h-8 w-8 flex items-center justify-center">
          <div className="animate-pulse h-4 w-4 bg-primary rounded-full"></div>
        </div>
      )}
    </div>
  ) : (
    <div className="absolute right-2 flex items-center space-x-2">
      {/* Загрузка файла */}
      <label className="cursor-pointer">
        <input
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isSubmitting || isReasoning || isInputDisabled}
        />
        <Paperclip className="h-5 w-5 text-muted-foreground hover:text-foreground" />
      </label>

      <AudioRecordButton />

      <Button
        type="submit"
        size="icon"
        disabled={
          isSubmitting ||
          isReasoning ||
          !message.trim() ||
          isInputDisabled
        }
      >
        <SendHorizontal className="h-5 w-5" />
        <span className="sr-only">Отправить</span>
      </Button>
    </div>
  )}
</div>

    </form>
  );
}
