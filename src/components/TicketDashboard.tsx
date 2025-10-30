import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useTickets } from "@/hooks/use-tickets";
import { formatDistanceToNow } from "date-fns";

const TicketDashboard = () => {
  const { data, isLoading, error } = useTickets();

  if (isLoading) {
    return (
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-red-500">
            Error loading tickets: {error.message}
          </div>
        </div>
      </section>
    );
  }

  const tickets = data?.tickets || [];
  const totalTickets = tickets.length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'done' || t.status === 'closed').length;

  // Calculate average response time (simplified - you may want to implement this properly)
  const avgResponse = '45m';

  const getPriorityVariant = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'P0': 'destructive',
      'P1': 'destructive',
      'P2': 'secondary',
      'P3': 'outline',
    };
    return variants[priority] || 'default';
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'created': 'secondary',
      'in_progress': 'default',
      'in_review': 'outline',
      'done': 'outline',
      'on_hold': 'secondary',
      'closed': 'secondary',
    };
    return variants[status] || 'default';
  };
  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ticket Dashboard</h2>
          <p className="text-muted-foreground text-lg">Real-time tracking of support tickets</p>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{totalTickets}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[hsl(var(--priority-p1))]" />
                <span className="text-3xl font-bold">{inProgressTickets}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">{resolvedTickets}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{avgResponse}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {tickets.length === 0 ? (
            <Card className="shadow-card border-border">
              <CardContent className="py-8 text-center text-muted-foreground">
                No tickets found. Create a ticket by reporting an issue to the chatbot.
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="shadow-card border-border hover:shadow-elegant transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                      </div>
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {ticket.assigned_engineer ? `Assigned to ${ticket.assigned_engineer}` : 'Unassigned'} · {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TicketDashboard;
