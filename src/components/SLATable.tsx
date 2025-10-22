import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const slaData = [
  {
    priority: "P0",
    name: "Blackhawk Down",
    definition: "Entire IMS down; core workflows non-functional",
    response: "30 mins",
    workaround: "4 hrs",
    resolution: "8 hrs",
    badge: "p0" as const,
  },
  {
    priority: "P1",
    name: "Critical",
    definition: "Major function unavailable, no workaround",
    response: "1 hr",
    workaround: "6 hrs",
    resolution: "1 day",
    badge: "p1" as const,
  },
  {
    priority: "P2",
    name: "Non-Critical",
    definition: "Partial impact; workaround exists",
    response: "12 hrs",
    workaround: "Next build",
    resolution: "Next release",
    badge: "p2" as const,
  },
  {
    priority: "P3",
    name: "Minor / Requests",
    definition: "Enhancements or low impact",
    response: "As required",
    workaround: "As agreed",
    resolution: "Project timeline",
    badge: "p3" as const,
  },
];

const SLATable = () => {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">SLA Levels</h2>
          <p className="text-muted-foreground text-lg">Our commitment to response and resolution times</p>
        </div>

        <div className="bg-card rounded-xl shadow-elegant border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Priority</TableHead>
                <TableHead className="font-semibold">Definition</TableHead>
                <TableHead className="font-semibold">Response</TableHead>
                <TableHead className="font-semibold">Workaround</TableHead>
                <TableHead className="font-semibold">Resolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slaData.map((item) => (
                <TableRow key={item.priority} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Badge variant={item.badge}>{item.priority}</Badge>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.definition}</TableCell>
                  <TableCell className="font-medium">{item.response}</TableCell>
                  <TableCell className="font-medium">{item.workaround}</TableCell>
                  <TableCell className="font-medium">{item.resolution}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default SLATable;
