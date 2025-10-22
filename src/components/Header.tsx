import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Support System
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="#sla" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              SLA Levels
            </a>
            <a href="#workflow" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Workflow
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Login</Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
