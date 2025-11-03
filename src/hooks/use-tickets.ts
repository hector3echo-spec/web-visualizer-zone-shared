/**
 * React Query hooks for ticket operations
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ticketApi,
  userApi,
  type CreateTicketRequest,
  type UpdateTicketRequest,
  type Priority,
  type TicketStatus,
} from '@/lib/api-client';
import { useToast } from './use-toast';

export const useTicket = (ticketId?: string) => {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => (ticketId ? ticketApi.getTicket(ticketId) : Promise.resolve(null)),
    enabled: !!ticketId,
  });
};

export const useTickets = (filters?: {
  query?: string;
  priority?: Priority;
  status?: TicketStatus;
  client_id?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketApi.getTickets(filters),
  });
};

export const useUserTickets = (userId?: string) => {
  return useQuery({
    queryKey: ['userTickets', userId],
    queryFn: () => (userId ? ticketApi.getUserTickets(userId) : Promise.resolve({ tickets: [], total: 0 })),
    enabled: !!userId,
  });
};

// Legacy alias for backward compatibility
export const useClientTickets = useUserTickets;

export const useEngineerTickets = (engineerId?: string) => {
  return useQuery({
    queryKey: ['engineerTickets', engineerId],
    queryFn: () => (engineerId ? ticketApi.getEngineerTickets(engineerId) : Promise.resolve({ tickets: [], total: 0 })),
    enabled: !!engineerId,
  });
};

export const useSLABreachCandidates = () => {
  return useQuery({
    queryKey: ['slaBreachCandidates'],
    queryFn: () => ticketApi.getSLABreachCandidates(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateTicketRequest) => ticketApi.createTicket(data),
    onSuccess: (response) => {
      const ticket = response.data;
      if (ticket) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['userTickets', ticket.user_id] });
        toast({
          title: 'Ticket created',
          description: `Ticket ${ticket.id} has been created with ${ticket.priority} priority.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      ticketId,
      status,
      notes,
      userId,
    }: {
      ticketId: string;
      status: TicketStatus;
      notes?: string;
      userId: string;
    }) => ticketApi.updateTicketStatus(ticketId, status, userId, notes),
    onSuccess: (response) => {
      const ticket = response.data;
      if (ticket) {
        queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['userTickets'] });
        queryClient.invalidateQueries({ queryKey: ['engineerTickets'] });
        toast({
          title: 'Status updated',
          description: `Ticket status changed to ${ticket.status}.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: UpdateTicketRequest }) =>
      ticketApi.updateTicket(ticketId, data),
    onSuccess: (response) => {
      const ticket = response.data;
      if (ticket) {
        queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['userTickets'] });
        toast({
          title: 'Ticket updated',
          description: 'Ticket has been updated successfully.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};


export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      ticketId,
      engineerId,
      projectManagerId,
    }: {
      ticketId: string;
      engineerId: string;
      projectManagerId?: string;
    }) => ticketApi.assignTicket(ticketId, engineerId, projectManagerId),
    onSuccess: (response) => {
      const ticket = response.data;
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Ticket assigned',
        description: 'Ticket has been assigned successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to assign ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useEngineers = () => {
  return useQuery({
    queryKey: ['engineers'],
    queryFn: () => userApi.getEngineers(),
  });
};

export const useTicketSLA = (ticketId?: string) => {
  return useQuery({
    queryKey: ['ticketSLA', ticketId],
    queryFn: () => (ticketId ? ticketApi.getTicketSLA(ticketId) : Promise.resolve(null)),
    enabled: !!ticketId,
  });
};
