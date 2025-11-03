/**
 * React Query hooks for chat operations
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  chatApi,
  type SendMessageRequest,
  type CreateSessionRequest,
  type SessionType,
} from '@/lib/api-client';
import { useToast } from './use-toast';

export const useChatSession = (sessionId?: string) => {
  return useQuery({
    queryKey: ['chatSession', sessionId],
    queryFn: () => (sessionId ? chatApi.getSession(sessionId) : Promise.resolve(null)),
    enabled: !!sessionId,
  });
};

export const useUserChatSessions = (userId: string, sessionType?: SessionType) => {
  return useQuery({
    queryKey: ['userChatSessions', userId, sessionType],
    queryFn: () => chatApi.getUserSessions(userId, sessionType),
    enabled: !!userId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

export const useChatMessages = (sessionId?: string, limit = 50, offset = 0) => {
  return useQuery({
    queryKey: ['chatMessages', sessionId, limit, offset],
    queryFn: () =>
      sessionId ? chatApi.getMessages(sessionId, limit, offset) : Promise.resolve({ messages: [], total: 0 }),
    enabled: !!sessionId,
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

export const useCreateChatSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSessionRequest) => chatApi.createSession(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userChatSessions', variables.user_id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create chat session',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => chatApi.sendMessage(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.session_id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCloseChatSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => chatApi.closeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['chatSession', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['userChatSessions'] });
      toast({
        title: 'Session closed',
        description: 'Chat session has been closed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to close session',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
