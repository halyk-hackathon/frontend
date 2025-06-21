import { prisma } from '@/lib/prisma';
import { Conversation, Message } from '@/types';

// Convert Prisma Message to app Message type
const convertPrismaMessage = (prismaMessage: any): Message => ({
  id: prismaMessage.id,
  role: prismaMessage.role as 'user' | 'assistant' | 'system',
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

// Get all conversations
export const getConversations = async (): Promise<Conversation[]> => {
  return []; // Возвращаем пустой массив для имитации
};

// Get a single conversation by ID
export const getConversation = async (id: string): Promise<Conversation | null> => {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: true,
    },
  });
  
  if (!conversation) return null;
  return convertPrismaConversation(conversation);
};

// Create a new conversation

export const createConversation = async (
  title: string,
  isArena: boolean = false,
  initialMessage?: Message,
): Promise<Conversation> => {
  return {
    id: 'mocked-id',
    title,
    isArena,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }; // Возвращаем замоканную структуру
};

// Add a message to a conversation
export const addMessage = async (
  conversationId: string,
  message: Partial<Message>,
): Promise<Message> => {
  const createdMessage = await prisma.message.create({
    data: {
      role: message.role as string,
      content: message.content || null,
      modelA: message.modelA || null,
      modelB: message.modelB || null,
      providerA: message.providerA || null,
      providerB: message.providerB || null,
      conversationId,
    },
  });
  
  // Update the conversation's updatedAt timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
  
  return convertPrismaMessage(createdMessage);
};

// Update conversation title
export const updateConversationTitle = async (id: string, title: string): Promise<Conversation> => {
  const conversation = await prisma.conversation.update({
    where: { id },
    data: { title },
    include: {
      messages: true,
    },
  });
  return convertPrismaConversation(conversation);
};

// Delete a conversation
export const deleteConversation = async (id: string): Promise<void> => {
  await prisma.conversation.delete({
    where: { id },
  });
};

// Delete all conversations
export const deleteAllConversations = async (): Promise<void> => {
  await prisma.conversation.deleteMany({});
};