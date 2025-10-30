/**
 * Dashboard Page - Integrated with Backend Tickets API
 * Displays real tickets with filtering and real-time updates
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Loader2,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets, useClientTickets, useEngineerTickets, useSLABreachCandidates } from "@/hooks/use-tickets";
import type { Priority, TicketStatus } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";

const priorityVariants: Record<Priority, any> = {
  P0: "destructive",
  P1: "p1",
  P2: "p2",
  P3: "p3",
};

const statusVariants: Record<TicketStatus, any> = {
  created: "secondary",
  in_progress: "status",
  in_review: "outline",
  done: "default",
  on_hold: "secondary",
  closed: "outline",
};

const Dashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch tickets based on user role
  // - Admin: sees all tickets
  // - Engineer: sees tickets assigned to them
  // - Client: sees only their tickets (filtered by client_id)
  const role = userProfile?.role;
  const userId = userProfile?.id;
  const clientId = userProfile?.client_id;

  // Fetch tickets using all hooks (React rules: hooks must be called unconditionally)
  const adminQuery = useTickets();
  const engineerQuery = useEngineerTickets(userId);
  const clientQuery = useClientTickets(clientId);

  // Select the appropriate data based on role
  const ticketsData = role === 'admin' ? adminQuery.data :
                      role === 'engineer' ? engineerQuery.data :
                      clientQuery.data;
  const isLoading = role === 'admin' ? adminQuery.isLoading :
                    role === 'engineer' ? engineerQuery.isLoading :
                    clientQuery.isLoading;
  const error = role === 'admin' ? adminQuery.error :
                role === 'engineer' ? engineerQuery.error :
                clientQuery.error;

  // Fetch SLA breach candidates
  const { data: breachData } = useSLABreachCandidates();

  // Filter tickets by search query
  const tickets = ticketsData?.tickets || [];
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalTickets = tickets.length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "in_progress" || t.status === "in_review"
  ).length;
  const urgentTickets = tickets.filter(
    (t) => (t.priority === "P0" || t.priority === "P1") && t.status !== "closed" && t.status !== "done"
  ).length;
  const resolvedToday = tickets.filter((t) => {
    if (t.status !== "done" && t.status !== "closed") return false;
    const updatedDate = new Date(t.updated_at);
    const today = new Date();
    return updatedDate.toDateString() === today.toDateString();
  }).length;
  const breachCandidates = breachData?.tickets || [];

  // Calculate average response time (mock for now - would need actual response time data)
  const avgResponseTime = "45m";

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  const formatStatusDisplay = (status: TicketStatus) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Tickets</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Failed to load tickets"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                  <h1 className="font-semibold text-lg">Support Dashboard</h1>
                  <p className="text-xs text-muted-foreground">
                    Ticket management & tracking
                  </p>
                </div>
              </div>
            </div>
            <Link to="/chat">
              <Button>Create Ticket</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* SLA Breach Warning */}
        {breachCandidates.length > 0 && (
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">
                  SLA Breach Warning
                </CardTitle>
              </div>
              <CardDescription>
                {breachCandidates.length} ticket(s) are at risk of breaching SLA
                deadlines
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{totalTickets}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time tickets
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[hsl(var(--priority-p1))]" />
                <span className="text-3xl font-bold">{inProgressTickets}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {urgentTickets} urgent (P0/P1)
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">{resolvedToday}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Great progress!
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{avgResponseTime}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Below 1hr target
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            {searchQuery ? "Search Results" : "Your Tickets"}
          </h2>

          {filteredTickets.length === 0 ? (
            <Card className="shadow-card border-border">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No tickets match your search"
                    : "No tickets found. Create your first ticket via the CARE Agent."}
                </p>
                {!searchQuery && (
                  <Link to="/chat">
                    <Button className="mt-4">Start Chat</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="shadow-card border-border hover:shadow-elegant transition-shadow duration-200 cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge variant={priorityVariants[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant={statusVariants[ticket.status]}>
                          {formatStatusDisplay(ticket.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{ticket.id}
                        </span>
                        {ticket.resolution_due && (
                          <span className="text-xs text-muted-foreground">
                            Due:{" "}
                            {formatTimeAgo(ticket.resolution_due)}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {ticket.title}
                      </CardTitle>
                      <CardDescription className="mb-2 line-clamp-2">
                        {ticket.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {ticket.assigned_engineer && (
                          <>
                            <span>Assigned to {ticket.assigned_engineer}</span>
                            <span>·</span>
                          </>
                        )}
                        <span>Created {formatTimeAgo(ticket.created_at)}</span>
                        <span>·</span>
                        <span>Updated {formatTimeAgo(ticket.updated_at)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
