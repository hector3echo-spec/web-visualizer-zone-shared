/**
 * TypeScript types matching the 3Echo AI Assistant database schema
 * These types align with the backend Supabase database structure
 */

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'client' | 'engineer' | 'admin' | 'project_manager';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  phone?: string;
  company?: string;
  created_at: string;
  updated_at: string;
  jira_account_id?: string;
}

// ============================================
// TICKET TYPES
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
  created_at: string;
  updated_at: string;
  closed_at?: string;
  user_id: string; // Changed from client_id
  assigned_engineer_id?: string;
  project_manager_id?: string;
  symptoms?: string; // TEXT field, not array
  screenshot_url?: string;
  routing_emails?: string[]; // ARRAY type in database
  resolution_notes?: string;
  client_confirmed?: boolean;
  client_feedback?: string;
  jira_issue_key?: string;
  jira_issue_id?: string;
  jira_issue_url?: string;
}

export interface TicketWithDetails extends Ticket {
  // Optional joined data
  user?: User;
  assigned_engineer?: User;
  project_manager?: User;
  sla?: TicketSLA;
}

// ============================================
// TICKET SLA TYPES
// ============================================

export type SLAStatus = 'on_track' | 'at_risk' | 'breached';

export interface TicketSLA {
  ticket_id: string;
  initial_response_due?: string;
  workaround_due?: string;
  resolution_due?: string;
  initial_response_time?: number; // double precision
  workaround_time?: number;
  resolution_time?: number;
  initial_response_breached: boolean;
  workaround_breached: boolean;
  resolution_breached: boolean;
  sla_status: SLAStatus;
  created_at: string;
  updated_at: string;
}

// ============================================
// TICKET EVENT TYPES
// ============================================

export type TicketEventType =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'priority_changed'
  | 'comment_added'
  | 'resolution_added'
  | 'client_confirmed'
  | 'sla_breached'
  | 'jira_synced';

export type ActorType = 'user' | 'system' | 'jira_webhook';

export interface TicketEvent {
  id: string;
  ticket_id: string;
  event_type: TicketEventType;
  actor_user_id?: string;
  actor_type: ActorType;
  timestamp: string;
  message: string;
  details: Record<string, any>; // jsonb
  jira_webhook_event_id?: string;
}

export interface TicketEventWithActor extends TicketEvent {
  actor_user?: User;
}

// ============================================
// CHAT SESSION TYPES
// ============================================

export type SessionType = 'general' | 'ticket_support' | 'knowledge_base';

export interface ChatSession {
  id: string;
  user_id: string;
  session_type: SessionType;
  title?: string;
  created_at: string;
  updated_at: string;
  related_ticket_id?: string;
}

export interface ChatSessionWithDetails extends ChatSession {
  user?: User;
  related_ticket?: Ticket;
  message_count?: number;
}

// ============================================
// CHAT MESSAGE TYPES
// ============================================

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  session_id: string; // Changed from conversation_id
  message: string;
  role: ChatRole;
  intent?: string;
  timestamp: string;
  user_id?: string;
}

export interface ChatMessageWithUser extends ChatMessage {
  user?: User;
}

// ============================================
// API REQUEST TYPES
// ============================================

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: Priority;
  user_id: string;
  symptoms?: string;
  screenshot_url?: string;
  routing_emails?: string[];
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  assigned_engineer_id?: string;
  project_manager_id?: string;
  resolution_notes?: string;
  client_confirmed?: boolean;
  client_feedback?: string;
}

export interface CreateSessionRequest {
  user_id: string;
  session_type?: SessionType;
  title?: string;
}

export interface SendMessageRequest {
  session_id: string;
  user_id: string;
  message: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  error?: string;
}

export interface TicketDetailResponse {
  ticket: Ticket;
  events: TicketEvent[];
  sla?: TicketSLA;
}

export interface CreateSessionResponse {
  success: boolean;
  session_id: string;
  user_id: string;
  created_at: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  session_id: string;
  message_id: string;
  user_message: string;
  bot_response: string;
  intent?: string;
  processing_time_ms?: number;
  metadata?: Record<string, any>;
}
