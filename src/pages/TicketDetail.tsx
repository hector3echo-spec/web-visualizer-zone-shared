/**
 * Ticket Detail Page
 * Shows comprehensive ticket information with event history and timeline
 */
import { useState } from "react";
import { useParams, useNavigate, Link, UNSAFE_ErrorResponseImpl } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  FileText,
  History,
  Edit,
} from "lucide-react";
import { useTicket, useUpdateTicketStatus, useEngineers, useAssignTicket } from "@/hooks/use-tickets";
import { useAuth } from "@/contexts/AuthContext";
import type { Priority, TicketStatus } from "@/lib/api-client";
import { formatDistanceToNow, format } from "date-fns";

const priorityVariants: Record<Priority, any> = {
  P0: "destructive",
  P1: "p1",
  P2: "p2",
  P3: "p3",
};

const priorityLabels: Record<Priority, string> = {
  P0: "Critical",
  P1: "High",
  P2: "Medium",
  P3: "Low",
};

const statusVariants: Record<TicketStatus, any> = {
  created: "secondary",
  in_progress: "status",
  in_review: "outline",
  done: "default",
  on_hold: "secondary",
  closed: "outline",
};

const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const { data, isLoading, error } = useTicket(ticketId);
  const updateTicketStatus = useUpdateTicketStatus();
  const assignTicket = useAssignTicket();
  const { data: engineersData } = useEngineers();

  const isAdmin = userProfile?.role === 'admin';
  const userId = userProfile?.id;
  const engineers = engineersData?.users || [];


  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticketId || !isAdmin || !userId) {
      console.warn('Missing required data:', { ticketId, isAdmin, userId });
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateTicketStatus.mutateAsync({
        ticketId,
        status: newStatus,
        notes: `Status updated to ${newStatus} by admin`,
        user_id: userId
      });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEngineerAssignment = async (engineerId: string) => {
    if (!ticketId || !isAdmin) {
      console.warn('Missing required data:', { ticketId, isAdmin });
      return;
    }

    setIsAssigning(true);
    try {
      await assignTicket.mutateAsync({
        ticketId,
        engineerId,
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "N/A";
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
          <p className="text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Ticket Not Found</CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "This ticket does not exist or you don't have access to it."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticket = data;
  const events = data.events;

  // Calculate time remaining for SLA deadlines
  const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const due = new Date(deadline);
    const diff = due.getTime() - now.getTime();

    if (diff < 0) return "Overdue";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m remaining`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h remaining`;
    return formatTimeAgo(deadline);
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-lg">Ticket Details</h1>
              <p className="text-xs text-muted-foreground">#{ticket.id}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <Badge variant={priorityVariants[ticket.priority]}>
                        {ticket.priority} - {priorityLabels[ticket.priority]}
                      </Badge>
                      <Badge variant={statusVariants[ticket.status]}>
                        {formatStatusDisplay(ticket.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">
                      {ticket.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {formatTimeAgo(ticket.created_at)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Updated {formatTimeAgo(ticket.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>

                  {ticket.symptoms && ticket.symptoms.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Symptoms</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {ticket.symptoms.map((symptom, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {ticket.resolution_notes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Resolution
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {ticket.resolution_notes}
                        </p>
                      </div>
                    </>
                  )}

                  {ticket.client_feedback && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Client Feedback</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {ticket.client_feedback}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  Complete history of ticket updates and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events && events.length > 0 ? (
                    events.map((event, idx) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {event.event_type.includes("created") && (
                              <AlertCircle className="h-4 w-4 text-primary" />
                            )}
                            {event.event_type.includes("status") && (
                              <Clock className="h-4 w-4 text-primary" />
                            )}
                            {event.event_type.includes("assigned") && (
                              <User className="h-4 w-4 text-primary" />
                            )}
                            {event.event_type.includes("resolution") && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          {idx < events.length - 1 && (
                            <div className="w-px h-full bg-border min-h-[40px] mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-sm">{event.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(event.timestamp)} · by {event.actor}
                          </p>
                          {Object.keys(event.details).length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {JSON.stringify(event.details, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No activity recorded yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Metadata & SLA */}
          <div className="space-y-6">
            {/* SLA Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SLA Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.initial_response_due && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Initial Response</span>
                      {isOverdue(ticket.initial_response_due) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(ticket.initial_response_due)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTimeRemaining(ticket.initial_response_due)}
                    </p>
                  </div>
                )}

                {ticket.workaround_due && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Workaround Due</span>
                      {isOverdue(ticket.workaround_due) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(ticket.workaround_due)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTimeRemaining(ticket.workaround_due)}
                    </p>
                  </div>
                )}

                {ticket.resolution_due && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Resolution Due</span>
                      {isOverdue(ticket.resolution_due) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(ticket.resolution_due)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTimeRemaining(ticket.resolution_due)}
                    </p>
                  </div>
                )}

                {!ticket.initial_response_due &&
                  !ticket.workaround_due &&
                  !ticket.resolution_due && (
                    <p className="text-sm text-muted-foreground">
                      No SLA deadlines set for this priority level
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* Assignment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium block mb-1">Engineer</span>
                  <p className="text-sm text-muted-foreground">
                    {ticket.assigned_engineer || "Unassigned"}
                  </p>
                </div>
                {ticket.project_manager && (
                  <div>
                    <span className="text-sm font-medium block mb-1">
                      Project Manager
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {ticket.project_manager}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Controls */}
            {isAdmin && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Admin Controls
                  </CardTitle>
                  <CardDescription>Update ticket status and assignment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Assign Engineer
                    </label>
                    <Select
                      value={
                        // Find the engineer ID that matches the assigned engineer (by ID, name, or email)
                        engineers.find(
                          (eng) =>
                            eng.id === ticket.assigned_engineer ||
                            eng.full_name === ticket.assigned_engineer ||
                            eng.email === ticket.assigned_engineer
                        )?.id || "unassigned"
                      }
                      onValueChange={(value) => {
                        if (value !== "unassigned") {
                          handleEngineerAssignment(value);
                        }
                      }}
                      disabled={isAssigning}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an engineer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.full_name || engineer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isAssigning && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Assigning ticket...
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Change Status
                    </label>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => handleStatusUpdate(value as TicketStatus)}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created">Created</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    {isUpdatingStatus && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Updating status...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/chat">
                  <Button variant="outline" className="w-full">
                    Message Support
                  </Button>
                </Link>
                {ticket.status === "done" && !ticket.client_confirmed && (
                  <Button className="w-full">Confirm Resolution</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketDetail;
