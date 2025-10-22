import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SLATable from "@/components/SLATable";
import TicketDashboard from "@/components/TicketDashboard";
import WorkflowSection from "@/components/WorkflowSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <div id="dashboard">
          <TicketDashboard />
        </div>
        <div id="workflow">
          <WorkflowSection />
        </div>
        <div id="sla">
          <SLATable />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
