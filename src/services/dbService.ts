import { v4 as uuidv4 } from "uuid";
import { Conversation, Message } from "@/types";

// Convert Prisma Message to app Message type
const convertPrismaMessage = (prismaMessage: any): Message => ({
  id: prismaMessage.id,
  role: prismaMessage.role as "user" | "assistant" | "system",
  content: prismaMessage.content,
  createdAt: new Date(prismaMessage.createdAt),
  modelA: prismaMessage.modelA,
  modelB: prismaMessage.modelB,
  providerA: prismaMessage.providerA,
  providerB: prismaMessage.providerB,
});

// Convert Prisma Conversation to app Conversation type
const convertPrismaConversation = (prismaConversation: any): Conversation => ({
  id: prismaConversation.id,
  title: prismaConversation.title,
  isArena: prismaConversation.isArena,
  messages: prismaConversation.messages.map(convertPrismaMessage),
  createdAt: new Date(prismaConversation.createdAt),
  updatedAt: new Date(prismaConversation.updatedAt),
});

// Get all conversations from localStorage
export const getConversations = async (): Promise<Conversation[]> => {
  const conversations = JSON.parse(
    localStorage.getItem("conversations") || "[]"
  );
  return conversations.map(convertPrismaConversation);
};

// Get a single conversation by ID from localStorage
export const getConversation = async (
  id: string
): Promise<Conversation | null> => {
  const conversations = JSON.parse(
    localStorage.getItem("conversations") || "[]"
  );
  const conversation = conversations.find(
    (conv: Conversation) => conv.id === id
  );

  return conversation ? convertPrismaConversation(conversation) : null;
};

// Create a new conversation and save to localStorage
export const createConversation = async (
  title: string,
  isArena: boolean = false,
  initialMessage?: Message
): Promise<Conversation> => {
  const newConversation: Conversation = {
    id: uuidv4(),
    title,
    isArena,
    messages: initialMessage ? [initialMessage] : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const conversations = JSON.parse(
    localStorage.getItem("conversations") || "[]"
  );
  conversations.push(newConversation);
  localStorage.setItem("conversations", JSON.stringify(conversations));

  // 💡 Устанавливаем текущий ID
  localStorage.setItem("currentConversationId", newConversation.id);

  return newConversation;
};

// Add a message to a conversation in localStorage
export function addMessage(
  role: "user" | "assistant" | "system",
  content: string
) {
  if (!content?.trim()) return; // <-- защита от null / пустых

  const message: Message = {
    id: generateId(),
    role,
    content,
    createdAt: new Date(),
    modelA: null,
    modelB: null,
    providerA: null,
    providerB: null,
  };

  setConversations((prev) =>
    prev.map((conv) =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date(),
          }
        : conv
    )
  );
}

// Update conversation title in localStorage
export const updateConversationTitle = async (
  id: string,
  title: string
): Promise<Conversation> => {
  const conversations = JSON.parse(
    localStorage.getItem("conversations") || "[]"
  );
  const conversation = conversations.find(
    (conv: Conversation) => conv.id === id
  );

  if (!conversation) throw new Error("Conversation not found");

  conversation.title = title;
  conversation.updatedAt = new Date();

  localStorage.setItem("conversations", JSON.stringify(conversations));

  return convertPrismaConversation(conversation);
};

// Delete a conversation from localStorage
export const deleteConversation = async (id: string): Promise<void> => {
  const conversations = JSON.parse(
    localStorage.getItem("conversations") || "[]"
  );
  const updatedConversations = conversations.filter(
    (conv: Conversation) => conv.id !== id
  );

  localStorage.setItem("conversations", JSON.stringify(updatedConversations));
};

// Delete all conversations from localStorage
export const deleteAllConversations = async (): Promise<void> => {
  localStorage.removeItem("conversations");
};
