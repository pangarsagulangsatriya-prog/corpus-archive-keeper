import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Pabrik Keindahan — Corpus Tables is a research app for literary award data." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Pabrik Keindahan — Corpus Tables is a research app for literary award data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Pabrik Keindahan — Corpus Tables is a research app for literary award data." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cff56e3d-71cb-441c-b6d7-3d72421e43c7/id-preview-48b7ada3--ae974cb4-272f-4ec9-b492-70efdc94e271.lovable.app-1778473454342.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cff56e3d-71cb-441c-b6d7-3d72421e43c7/id-preview-48b7ada3--ae974cb4-272f-4ec9-b492-70efdc94e271.lovable.app-1778473454342.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

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
