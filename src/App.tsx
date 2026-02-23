import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Auth from "./pages/Auth";
import TodayDashboard from "./pages/TodayDashboard";
import AllTasksDashboard from "./pages/AllTasksDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import TvDisplay from "./pages/TvDisplay";

import { ThemeProvider } from "@/components/theme-provider";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ScheduleProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <HelmetProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/auth" replace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/tv-display" element={<TvDisplay />} />
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<TodayDashboard />} />
                      <Route path="all" element={<AllTasksDashboard />} />
                      <Route path="admin" element={<AdminDashboard />} />
                    </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </HelmetProvider>
        </ThemeProvider>
      </ScheduleProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
