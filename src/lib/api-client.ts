/**
 * API Client for backend communication
 * Handles authentication headers and error handling for all API requests.
 */
import { supabase } from './supabase';
import type {
  User,
  Ticket,
  TicketEvent,
  TicketSLA,
  ChatSession,
  ChatMessage,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateSessionRequest,
  SendMessageRequest,
  ApiResponse,
  PaginatedResponse,
  TicketDetailResponse,
  CreateSessionResponse,
  SendMessageResponse,
  Priority,
  TicketStatus,
  SessionType,
} from './types';

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
// Types are imported from ./types.ts

export const chatApi = {
  createSession: (data: CreateSessionRequest) =>
    apiRequest<CreateSessionResponse>('/api/v1/chat/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendMessage: (data: SendMessageRequest) =>
    apiRequest<SendMessageResponse>('/api/v1/chat/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMessages: (sessionId: string, limit = 50, offset = 0) =>
    apiRequest<{ success: boolean; messages: ChatMessage[]; total: number }>(
      `/api/v1/chat/messages/${sessionId}?limit=${limit}&offset=${offset}`
    ),

  getSession: (sessionId: string) =>
    apiRequest<{ success: boolean; data: ChatSession }>(`/api/v1/chat/sessions/${sessionId}`),

  getUserSessions: (userId: string, sessionType?: SessionType) => {
    const query = sessionType ? `?session_type=${sessionType}` : '';
    return apiRequest<{ success: boolean; sessions: ChatSession[]; total: number }>(
      `/api/v1/chat/sessions/user/${userId}${query}`
    );
  },

  closeSession: (sessionId: string) =>
    apiRequest<{ success: boolean; message: string }>('/api/v1/chat/sessions/close', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),
};

// ============================================
// TICKET API
// ============================================
// Types are imported from ./types.ts

export const ticketApi = {
  createTicket: (data: CreateTicketRequest) =>
    apiRequest<ApiResponse<Ticket>>('/api/v1/tickets/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createTicketFromForm: (data: Omit<CreateTicketRequest, 'priority'>) =>
    apiRequest<ApiResponse<Ticket & {
      priority_classification?: {
        classified_priority: string;
        reasoning: string;
      };
    }>>('/api/v1/tickets/create-from-form', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTicket: async (ticketId: string) => {
    const response = await apiRequest<ApiResponse<TicketDetailResponse>>(
      `/api/v1/tickets/${ticketId}`
    );
    return response.data!;
  },

  getTickets: async (filters?: {
    query?: string;
    priority?: Priority;
    status?: TicketStatus;
    user_id?: string; // Changed from client_id
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    const response = await apiRequest<PaginatedResponse<Ticket>>(
      `/api/v1/tickets?${params.toString()}`
    );
    return {
      tickets: response.data || [],
      total: response.total || 0
    };
  },

  updateTicket: (ticketId: string, data: UpdateTicketRequest) =>
    apiRequest<ApiResponse<Ticket>>(`/api/v1/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateTicketStatus: (ticketId: string, status: TicketStatus, userId: string, notes?: string) =>
    apiRequest<ApiResponse<Ticket>>('/api/v1/tickets/status', {
      method: 'POST',
      body: JSON.stringify({
        ticket_id: ticketId,
        new_status: status,
        notes: notes,
        user_id: userId
      }),
    }),

  assignTicket: (ticketId: string, engineerId: string, projectManagerId?: string) =>
    apiRequest<ApiResponse<Ticket>>('/api/v1/tickets/assign', {
      method: 'POST',
      body: JSON.stringify({
        ticket_id: ticketId,
        engineer_id: engineerId,
        project_manager_id: projectManagerId,
      }),
    }),

  getTicketsByPriority: (priority: Priority) =>
    apiRequest<PaginatedResponse<Ticket>>(
      `/api/v1/tickets/by-priority/${priority}`
    ),

  getTicketsByStatus: (status: TicketStatus) =>
    apiRequest<PaginatedResponse<Ticket>>(
      `/api/v1/tickets/by-status/${status}`
    ),

  getUserTickets: async (userId: string) => {
    const response = await apiRequest<PaginatedResponse<Ticket>>(
      `/api/v1/tickets/by-client/${userId}` // Backend still uses /by-client endpoint
    );
    return {
      tickets: response.data || [],
      total: response.total || 0
    };
  },

  getEngineerTickets: async (engineerId: string) => {
    const response = await apiRequest<PaginatedResponse<Ticket>>(
      `/api/v1/tickets/by-engineer/${engineerId}`
    );
    return {
      tickets: response.data || [],
      total: response.total || 0
    };
  },

  getSLABreachCandidates: async () => {
    const response = await apiRequest<PaginatedResponse<Ticket>>(
      '/api/v1/tickets/sla/breach-candidates'
    );
    return {
      tickets: response.data || [],
      total: response.total || 0
    };
  },

  getTicketSLA: (ticketId: string) =>
    apiRequest<ApiResponse<TicketSLA>>(`/api/v1/tickets/${ticketId}/sla`),
};

// ============================================
// USER API
// ============================================
// Types are imported from ./types.ts

export const userApi = {
  getUsersByRole: (role: User['role']) =>
    apiRequest<{ success: boolean; role: string; users: User[]; total: number }>(
      `/api/v1/users/role/${role}`
    ),

  getEngineers: () =>
    apiRequest<{ success: boolean; role: string; users: User[]; total: number }>(
      '/api/v1/users/engineers'
    ),

  getUser: (userId: string) =>
    apiRequest<ApiResponse<User>>(`/api/v1/users/${userId}`),

  getCurrentUser: () =>
    apiRequest<ApiResponse<User>>('/api/v1/users/me'),
};

// Export the base API request function for custom requests
export { apiRequest };

// Re-export types for convenience
export type {
  User,
  UserRole,
  Ticket,
  TicketEvent,
  TicketSLA,
  ChatSession,
  ChatMessage,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateSessionRequest,
  SendMessageRequest,
  Priority,
  TicketStatus,
  SessionType,
  ChatRole,
  SLAStatus,
  TicketEventType,
  ActorType,
} from './types';
