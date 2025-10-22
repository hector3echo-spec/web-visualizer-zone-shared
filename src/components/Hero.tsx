import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Shield } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-hero z-0" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI-Powered Customer Support
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
            Intelligent ticketing system that triages, routes, and resolves support issues with AI precision
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Button variant="hero" size="lg">
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Chat
            </Button>
            <Button variant="outline" size="lg">
              View Dashboard
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-card shadow-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Triage</h3>
              <p className="text-sm text-muted-foreground">AI automatically prioritizes P0-P3 with 95%+ accuracy</p>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">CARE Agent</h3>
              <p className="text-sm text-muted-foreground">80%+ FAQ resolution without human intervention</p>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">SLA Guaranteed</h3>
              <p className="text-sm text-muted-foreground">P0: 30m response, P1: 1hr, strict timelines</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
