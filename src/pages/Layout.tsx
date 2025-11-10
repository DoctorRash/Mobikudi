import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
