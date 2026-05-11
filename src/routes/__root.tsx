import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Database, Upload, Settings as SettingsIcon, BookOpen } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-background text-foreground">
        {/* Far-Left Vertical Corpus Sidebar (Layer 1) */}
        <div className="w-16 flex flex-col items-center border-r border-border bg-card py-4 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Link to="/" className="flex flex-col items-center p-2 rounded bg-[oklch(0.3_0.05_150)] text-white">
              <Database className="w-5 h-5" />
              <span className="text-[10px] mt-1">DKJ</span>
            </Link>
            <Link to="/" className="flex flex-col items-center p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] mt-1">KSK</span>
            </Link>
            <Link to="/" className="flex flex-col items-center p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
              <Database className="w-5 h-5" />
              <span className="text-[10px] mt-1">Tempo</span>
            </Link>
          </div>
          <div className="mt-auto flex flex-col items-center space-y-4">
            <button className="flex flex-col items-center p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
              <Upload className="w-5 h-5" />
              <span className="text-[10px] mt-1">Import</span>
            </button>
            <button className="flex flex-col items-center p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
              <SettingsIcon className="w-5 h-5" />
              <span className="text-[10px] mt-1">Settings</span>
            </button>
          </div>
        </div>
        {/* Main Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </div>
      </div>
    </QueryClientProvider>
  );
}
