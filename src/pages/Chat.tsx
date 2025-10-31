/**
 * Chat Page - Integrated with Backend CARE Agent
 * Connects to the FastAPI backend for real AI-powered chat and ticket creation
 * Includes session management sidebar like ChatGPT
 */
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, ArrowLeft, Loader2, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateChatSession,
  useSendMessage,
  useChatMessages,
  useUserChatSessions,
} from "@/hooks/use-chat";
import { useToast } from "@/hooks/use-toast";
import { ChatSessionSidebar } from "@/components/ChatSessionSidebar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  ticketId?: string;
  priority?: "p0" | "p1" | "p2" | "p3";
  intent?: string;
}

const Chat = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createSession = useCreateChatSession();
  const sendMessage = useSendMessage();
  const { data: sessionsData } = useUserChatSessions(user?.id || "", "active");
  const { data: messagesData, isLoading: loadingMessages } = useChatMessages(
    sessionId || undefined,
    100
  );

  // Load most recent active session on mount, or create new one
  useEffect(() => {
    if (user && userProfile && !sessionId && !createSession.isPending) {
      const sessions = sessionsData?.sessions || [];
      if (sessions.length > 0) {
        // Load the most recent active session
        const mostRecent = sessions[0];
        setSessionId(mostRecent.id);
      } else if (sessionsData !== undefined) {
        // Only create if we've confirmed no sessions exist
        createNewSession();
      }
    }
  }, [user, userProfile, sessionsData, sessionId]);

  const createNewSession = () => {
    createSession.mutate(
      {
        user_id: user!.id,
        channel: "web",
      },
      {
        onSuccess: (data) => {
          setSessionId(data.session_id);
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content:
                "Hello! I'm the CARE Agent. I can help you with support issues and create tickets if needed. What can I help you with today?",
              timestamp: new Date(),
            },
          ]);
        },
        onError: (error) => {
          toast({
            title: "Failed to start chat",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSessionSelect = (newSessionId: string) => {
    if (newSessionId !== sessionId) {
      setSessionId(newSessionId);
      setMessages([]); // Messages will be loaded by useEffect
    }
  };

  // Load existing messages when session is ready
  useEffect(() => {
    if (messagesData?.messages && messagesData.messages.length > 0) {
      const formattedMessages: Message[] = messagesData.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.message || msg.content, // Support both field names
        timestamp: new Date(msg.timestamp || msg.created_at || Date.now()), // Support both field names with fallback
        intent: msg.intent,
        // Extract ticket info from metadata if available
        ticketId: msg.metadata?.ticket_id,
        priority: msg.metadata?.priority?.toLowerCase(),
      }));

      setMessages(formattedMessages);
    }
  }, [messagesData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  console.log(user)
  const handleSend = async () => {
    if (!input.trim() || !sessionId || !user || !userProfile) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendMessage.mutateAsync({
        session_id: sessionId,
        user_id: user.id,
        message: currentInput,
      });

      // Add bot response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.bot_response,
        timestamp: new Date(),
        intent: response.intent,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Show success notification if ticket was created
      if (response.intent?.includes("TICKET") || response.intent?.includes("ISSUE")) {
        toast({
          title: "Processing your request",
          description: "The CARE Agent is analyzing your issue...",
        });
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));

      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show chat UI immediately - no full-screen loading
  // Messages will load in the background

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Session Sidebar */}
      {sidebarOpen && (
        <div className="h-full overflow-y-auto border-r border-border bg-card/50">
          <ChatSessionSidebar
            currentSessionId={sessionId || undefined}
            onSessionSelect={handleSessionSelect}
            onNewSession={createNewSession}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Link to="/">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold">CARE Agent</h1>
                    <p className="text-xs text-muted-foreground">AI Support Assistant</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Online
                </Badge>
              </div>
            </div>
          </div>
        </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="space-y-6">
            {loadingMessages && messages.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            ) : null}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}

                <Card
                  className={`p-4 max-w-[80%] shadow-card ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.ticketId && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                      <Badge variant={message.priority}>
                        {message.priority?.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono">{message.ticketId}</span>
                    </div>
                  )}
                  {message.intent && (
                    <p className="text-xs opacity-50 mt-2">
                      Intent: {message.intent}
                    </p>
                  )}
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>

                {message.role === "user" && (
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <Card className="p-4 bg-card shadow-card">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-6 py-4 max-w-4xl">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your issue or ask a question..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="flex-shrink-0"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            The CARE Agent can help resolve issues or create support tickets
            automatically
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Chat;
