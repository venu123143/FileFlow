import { DashboardProvider } from "@/contexts/DashboardContext";
import { HomeDashboard } from "@/pages/home-dashboard";

export function Home() {
  return (
    <DashboardProvider>
      <HomeDashboard />
    </DashboardProvider>
  );
}

export default Home;
