import { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/context/ChatContext";
import { sendChatRequest } from "@/services/apiService";
import { streamChatResponse, generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { SendHorizontal, Square } from "lucide-react";
import { ChatResponse } from "@/types";
import { AudioRecordButton } from "@/components/AudioRecordButton";

const CHAT_ARENA_ENABLED = import.meta.env.VITE_CHAT_ARENA_ENABLED === 'true';

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
    isInputDisabled
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

    if (!message.trim() || isSubmitting || !currentConversationId) return;

    addMessage("user", message);
    setIsSubmitting(true);
    setIsReasoning(true);
    setMessage("");

    let responseHandled = false;

    try {
      const messages = [];

      if (settings.systemPrompt && settings.systemPrompt.trim() !== '') {
        messages.push({ role: "system", content: settings.systemPrompt });
      }

      messages.push(
        ...(currentConversation?.messages.map(m => ({
          role: m.role,
          content: m.content
        })) || [])
      );

      messages.push({ role: "user", content: message });

      const chatRequest = {
        messages,
        model: settings.model,
        temperature: settings.temperature,
        stream: settings.streamEnabled
      };

      const response = await sendChatRequest(settings.provider, chatRequest);

      if (settings.streamEnabled && response instanceof ReadableStream) {
        let responseContent = '';

        const assistantMessage = {
          id: generateId(),
          role: 'assistant' as const,
          content: '',
          createdAt: new Date(),
          tokenCount: 0
        };

        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: new Date()
                }
              : conv
          )
        );

        const controller = startStreaming();

        try {
          const stream = streamChatResponse(response);

          for await (const chunk of stream) {
            if (controller.signal.aborted) break;

            responseContent += chunk;

            const words = responseContent
              .trim()
              .split(/\s+|[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/)
              .filter(word => word.length > 0);

            setConversations(prev =>
              prev.map(conv =>
                conv.id === currentConversationId
                  ? {
                      ...conv,
                      messages: conv.messages.map(msg =>
                        msg.id === assistantMessage.id
                          ? {
                              ...msg,
                              content: responseContent,
                              tokenCount: words.length
                            }
                          : msg
                      ),
                      updatedAt: new Date()
                    }
                  : conv
              )
            );
          }

          responseHandled = true;
        } catch (error) {
          if (error.name !== 'AbortError') {
            throw error;
          }
          console.log('Поток отменён пользователем');
        }
      } else if (!settings.streamEnabled && !(response instanceof ReadableStream)) {
        const nonStreamResponse = response as ChatResponse;
        const responseContent =
          nonStreamResponse.choices[0]?.message?.content || "Нет ответа от Халык Автопилот";
        addMessage("assistant", responseContent);
        responseHandled = true;
      }
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось отправить сообщение",
        variant: "destructive"
      });

      if (!responseHandled) {
        addMessage("assistant", "Произошла ошибка. Пожалуйста, попробуйте снова.");
      }
    } finally {
      setIsSubmitting(false);
      setIsReasoning(false);
      stopStreaming();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-background/80 backdrop-blur-sm">
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
          placeholder={isReasoning
            ? "Халык Автопилот размышляет..."
            : isInputDisabled
              ? "Обработка голосового сообщения..."
              : "Введите ваше сообщение..."}
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
            <AudioRecordButton />
            <Button
              type="submit"
              size="icon"
              disabled={isSubmitting || isReasoning || !message.trim() || isInputDisabled}
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
