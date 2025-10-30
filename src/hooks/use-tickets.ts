/**
 * React Query hooks for ticket operations
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ticketApi,
  type CreateTicketRequest,
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

export const useClientTickets = (clientId?: string) => {
  return useQuery({
    queryKey: ['clientTickets', clientId],
    queryFn: () => (clientId ? ticketApi.getClientTickets(clientId) : Promise.resolve({ tickets: [], total: 0 })),
    enabled: !!clientId,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['clientTickets', data.ticket.client_id] });
      toast({
        title: 'Ticket created',
        description: `Ticket ${data.ticket.id} has been created with ${data.ticket.priority} priority.`,
      });
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
    }: {
      ticketId: string;
      status: TicketStatus;
      notes?: string;
    }) => ticketApi.updateTicketStatus(ticketId, status, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', data.ticket.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['clientTickets'] });
      toast({
        title: 'Status updated',
        description: `Ticket status changed to ${data.ticket.status}.`,
      });
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', data.ticket.id] });
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
