import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { AuthContext } from "@/contexts/auth";
import { ModulesProvider } from "@/hooks/useModules";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface MyRouterContext {
  auth: AuthContext
}

export const Route = createRootRoute<MyRouterContext>({ component: () => (
  <TooltipProvider>
    <ModulesProvider>
      <main className="min-h-screen w-[calc(100vw)] dark bg-background text-foreground">
        <Outlet />
      </main>
      <Toaster theme="dark" />
      <TanStackRouterDevtools />
    </ModulesProvider>
  </TooltipProvider>
), });
