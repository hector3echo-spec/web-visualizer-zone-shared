import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const tickets = [
  {
    id: "TKT-1001",
    title: "Can't access AI agent",
    priority: "p0" as const,
    status: "In Progress",
    assignee: "Sarah Chen",
    created: "30m ago",
    statusVariant: "status" as const,
  },
  {
    id: "TKT-1002",
    title: "OCR not working on mobile",
    priority: "p1" as const,
    status: "In Review",
    assignee: "Mike Rodriguez",
    created: "2h ago",
    statusVariant: "status" as const,
  },
  {
    id: "TKT-1003",
    title: "Dashboard loading slowly",
    priority: "p2" as const,
    status: "To-Do",
    assignee: "Alex Kim",
    created: "5h ago",
    statusVariant: "secondary" as const,
  },
  {
    id: "TKT-1004",
    title: "Feature request: Dark mode",
    priority: "p3" as const,
    status: "Done",
    assignee: "Jordan Lee",
    created: "1d ago",
    statusVariant: "default" as const,
  },
];

const TicketDashboard = () => {
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
                <span className="text-3xl font-bold">24</span>
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
                <span className="text-3xl font-bold">8</span>
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
                <span className="text-3xl font-bold">12</span>
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
                <span className="text-3xl font-bold">45m</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="shadow-card border-border hover:shadow-elegant transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={ticket.priority}>{ticket.id.split('-')[0]}{ticket.priority.toUpperCase().slice(1)}</Badge>
                      <Badge variant={ticket.statusVariant}>{ticket.status}</Badge>
                    </div>
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Assigned to {ticket.assignee} · {ticket.created}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TicketDashboard;
