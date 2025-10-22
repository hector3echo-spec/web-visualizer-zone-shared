import { ArrowRight, Bot, Ticket, Users, Code, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Bot,
    title: "CARE Agent",
    description: "AI resolves FAQ or creates ticket",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Ticket,
    title: "Ticket Creation",
    description: "Auto-prioritized P0-P3 with context",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Assignment",
    description: "FLOW agents route to engineer",
    color: "bg-[hsl(var(--priority-p1))]/10 text-[hsl(var(--priority-p1))]",
  },
  {
    icon: Code,
    title: "CODE Agent",
    description: "Fast recommendation to fix",
    color: "bg-[hsl(var(--priority-p2))]/10 text-[hsl(var(--priority-p2))]",
  },
  {
    icon: CheckCircle,
    title: "Resolution",
    description: "QA review and client delivery",
    color: "bg-green-500/10 text-green-600",
  },
];

const WorkflowSection = () => {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Automated workflow from ticket to resolution</p>
        </div>

        <div className="relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex flex-col items-center flex-1">
                  <div className={`w-16 h-16 rounded-xl ${step.color} flex items-center justify-center mb-4 shadow-card`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-center">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-[200px]">{step.description}</p>
                  
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-8 h-6 w-6 text-muted-foreground/40" 
                      style={{ left: `${(index + 1) * (100 / steps.length)}%` }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
