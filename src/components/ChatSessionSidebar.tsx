/**
 * Chat Session Sidebar Component
 * Displays list of chat sessions for the current user (like ChatGPT)
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Plus,
  MoreVertical,
  Trash2,
  Archive,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useUserChatSessions, useCloseChatSession } from "@/hooks/use-chat";
import { formatDistanceToNow } from "date-fns";

interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  status: "active" | "closed" | "archived";
  channel: string;
  ticket_id?: string;
}

interface ChatSessionSidebarProps {
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export const ChatSessionSidebar: React.FC<ChatSessionSidebarProps> = ({
  currentSessionId,
  onSessionSelect,
  onNewSession,
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"active" | "all">("active");

  // Fetch user's chat sessions
  const { data: sessionsData, isLoading } = useUserChatSessions(
    user?.id || "",
    filter === "active" ? "active" : undefined
  );

  const closeSession = useCloseChatSession();

  const sessions: ChatSession[] = sessionsData?.sessions || [];

  const handleCloseSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await closeSession.mutateAsync(sessionId);
  };

  const getSessionTitle = (session: ChatSession) => {
    if (session.title) return session.title;
    if (session.ticket_id) return `Ticket: ${session.ticket_id}`;
    return `Chat ${session.created_at.slice(0, 10)}`;
  };

  return (
    <div className="w-72 h-full border-r border-border bg-card/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewSession}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-2 border-b border-border">
        <Button
          variant={filter === "active" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No chat sessions yet</p>
              <p className="text-xs mt-1">Start a new conversation</p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                  currentSessionId === session.id
                    ? "bg-accent border-primary"
                    : "border-transparent"
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                      <p className="text-sm font-medium truncate">
                        {getSessionTitle(session)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                      {session.status === "closed" && (
                        <Badge variant="outline" className="text-xs">
                          Closed
                        </Badge>
                      )}
                      {currentSessionId === session.id && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Session Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleCloseSession(session.id, e)}
                        disabled={session.status === "closed"}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Close Session
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement delete
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
