import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ArrowLeft, Clock, AlertCircle, CheckCircle2, Filter, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

const tickets = [
  {
    id: "TKT-1001",
    title: "Can't access AI agent",
    priority: "p0" as const,
    status: "In Progress",
    assignee: "Sarah Chen",
    created: "30m ago",
    statusVariant: "status" as const,
    description: "Users unable to access the AI agent interface after latest deployment",
  },
  {
    id: "TKT-1002",
    title: "OCR not working on mobile",
    priority: "p1" as const,
    status: "In Review",
    assignee: "Mike Rodriguez",
    created: "2h ago",
    statusVariant: "status" as const,
    description: "Mobile OCR functionality failing on iOS devices",
  },
  {
    id: "TKT-1003",
    title: "Dashboard loading slowly",
    priority: "p2" as const,
    status: "To-Do",
    assignee: "Alex Kim",
    created: "5h ago",
    statusVariant: "secondary" as const,
    description: "Dashboard takes 5+ seconds to load with large datasets",
  },
  {
    id: "TKT-1004",
    title: "Feature request: Dark mode",
    priority: "p3" as const,
    status: "Done",
    assignee: "Jordan Lee",
    created: "1d ago",
    statusVariant: "default" as const,
    description: "Customer requested dark mode support for better UX",
  },
  {
    id: "TKT-1005",
    title: "API timeout on reports",
    priority: "p1" as const,
    status: "In Progress",
    assignee: "Sarah Chen",
    created: "3h ago",
    statusVariant: "status" as const,
    description: "Report generation API timing out for large date ranges",
  },
  {
    id: "TKT-1006",
    title: "Export feature not working",
    priority: "p2" as const,
    status: "To-Do",
    assignee: "Mike Rodriguez",
    created: "6h ago",
    statusVariant: "secondary" as const,
    description: "CSV export failing for datasets over 1000 rows",
  },
];

const Dashboard = () => {
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
                  <p className="text-xs text-muted-foreground">Ticket management & tracking</p>
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
        {/* Stats Cards */}
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
              <p className="text-xs text-muted-foreground mt-1">+3 from yesterday</p>
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
              <p className="text-xs text-muted-foreground mt-1">2 urgent (P0/P1)</p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">12</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">95% SLA compliance</p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">45m</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Below 1hr target</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tickets..." className="pl-9" />
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Active Tickets</h2>
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="shadow-card border-border hover:shadow-elegant transition-shadow duration-200 cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Badge variant={ticket.priority}>
                        {ticket.id.split("-")[0]}
                        {ticket.priority.toUpperCase().slice(1)}
                      </Badge>
                      <Badge variant={ticket.statusVariant}>{ticket.status}</Badge>
                      <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                    </div>
                    <CardTitle className="text-lg mb-2">{ticket.title}</CardTitle>
                    <CardDescription className="mb-2">{ticket.description}</CardDescription>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Assigned to {ticket.assignee}</span>
                      <span>·</span>
                      <span>{ticket.created}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
