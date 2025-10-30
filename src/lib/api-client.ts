/**
 * API Client for backend communication
 * Handles authentication headers and error handling for all API requests.
 */
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Generic API request function with auth header injection
 */
async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchConfig } = config;

  // Get auth token if required
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchConfig.headers,
  };

  if (requiresAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchConfig,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: 'An error occurred',
    }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ============================================
// CHAT API
// ============================================

export interface CreateSessionRequest {
  user_id: string;
  client_id?: string;
  channel?: 'web' | 'slack' | 'email' | 'whatsapp';
}

export interface SendMessageRequest {
  session_id: string;
  user_id: string;
  client_id?: string; // Optional - kept for backward compatibility but not used by backend
  message: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string; // Database uses conversation_id, not session_id
  user_id?: string;
  message: string; // Database uses message, not content
  role: 'user' | 'assistant' | 'system';
  timestamp: string; // Database uses timestamp, not created_at
  intent?: string;
  priority?: string;
  agent_name?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  status: 'active' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
  closed_at?: string;
  channel: string;
  metadata?: Record<string, any>;
  ticket_id?: string;
}

export const chatApi = {
  createSession: (data: CreateSessionRequest) =>
    apiRequest<{ success: boolean; session_id: string; user_id: string; created_at: string; message: string }>('/api/v1/chat/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendMessage: (data: SendMessageRequest) =>
    apiRequest<{
      success: boolean;
      session_id: string;
      message_id: string;
      user_message: string;
      bot_response: string;
      intent?: string;
      processing_time_ms?: number;
      metadata?: Record<string, any>;
    }>('/api/v1/chat/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMessages: (sessionId: string, limit = 50, offset = 0) =>
    apiRequest<{ messages: ChatMessage[]; total: number }>(
      `/api/v1/chat/messages/${sessionId}?limit=${limit}&offset=${offset}`
    ),

  getSession: (sessionId: string) =>
    apiRequest<{ session: ChatSession }>(`/api/v1/chat/sessions/${sessionId}`),

  getUserSessions: (userId: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<{ sessions: ChatSession[] }>(
      `/api/v1/chat/sessions/user/${userId}${query}`
    );
  },

  closeSession: (sessionId: string) =>
    apiRequest<{ message: string }>('/api/v1/chat/sessions/close', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),
};

// ============================================
// TICKET API
// ============================================

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type TicketStatus =
  | 'created'
  | 'in_progress'
  | 'in_review'
  | 'done'
  | 'on_hold'
  | 'closed';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  client_id: string;
  client_email?: string;
  assigned_engineer?: string;
  project_manager?: string;
  created_at: string;
  updated_at: string;
  initial_response_due?: string;
  workaround_due?: string;
  resolution_due?: string;
  symptoms?: string[];
  diagnostic_context?: Record<string, any>;
  related_files?: string[];
  routing_emails?: string[];
  routing_slack?: string[];
  resolution_notes?: string;
  client_confirmed?: boolean;
  client_feedback?: string;
}

export interface TicketEvent {
  id: string;
  ticket_id: string;
  event_type: string;
  timestamp: string;
  actor: string;
  details: Record<string, any>;
  message: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: Priority;
  client_id: string;
  client_email?: string;
  symptoms?: string[];
  diagnostic_context?: Record<string, any>;
  related_files?: string[];
  session_id?: string;
}

export const ticketApi = {
  createTicket: (data: CreateTicketRequest) =>
    apiRequest<{ ticket: Ticket }>('/api/v1/tickets/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTicket: async (ticketId: string) => {
    const response = await apiRequest<{ success: boolean; data: { ticket: Ticket; events: TicketEvent[] } }>(
      `/api/v1/tickets/${ticketId}`
    );
    return response.data;
  },

  getTickets: async (filters?: {
    query?: string;
    priority?: Priority;
    status?: TicketStatus;
    client_id?: string;
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    const response = await apiRequest<{ success: boolean; data: Ticket[]; total: number }>(
      `/api/v1/tickets?${params.toString()}`
    );
    // Transform backend response to frontend format
    return {
      tickets: response.data || [],
      total: response.total || 0
    };
  },

  updateTicketStatus: (ticketId: string, status: TicketStatus, notes?: string) =>
    apiRequest<{ ticket: Ticket }>('/api/v1/tickets/status', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId, new_status: status, notes }),
    }),

  assignTicket: (ticketId: string, engineerId: string, projectManagerId?: string) =>
    apiRequest<{ ticket: Ticket }>('/api/v1/tickets/assign', {
      method: 'POST',
      body: JSON.stringify({
        ticket_id: ticketId,
        engineer_id: engineerId,
        project_manager_id: projectManagerId,
      }),
    }),

  getTicketsByPriority: (priority: Priority) =>
    apiRequest<{ tickets: Ticket[]; total: number }>(
      `/api/v1/tickets/by-priority/${priority}`
    ),

  getTicketsByStatus: (status: TicketStatus) =>
    apiRequest<{ tickets: Ticket[]; total: number }>(
      `/api/v1/tickets/by-status/${status}`
    ),

  getClientTickets: async (clientId: string) => {
    const response = await apiRequest<{ success: boolean; data: Ticket[]; total: number }>(
      `/api/v1/tickets/by-client/${clientId}`
    );
    return {
      tickets: response.data || [],
      total: response.total || 0
    };
  },

  getSLABreachCandidates: async () => {
    const response = await apiRequest<{ success: boolean; data: Ticket[]; total: number }>(
      '/api/v1/tickets/sla/breach-candidates'
    );
    return {
      tickets: response.data || [],
      total: response.total || 0
    };
  },
};

// ============================================
// NOTIFICATION API (for future WebSocket integration)
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_ticket_id?: string;
  related_session_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  metadata?: Record<string, any>;
}

// Export the base API request function for custom requests
export { apiRequest };
