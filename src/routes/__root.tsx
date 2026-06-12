import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

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
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

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
      { name: "google-site-verification", content: "iQHuy2aq_EbBF5wmZEXnWi46_kKJn4SE8HTieYuNVa4" },
      { title: "Revenio — Explore the Life You Never Lived" },
      { name: "description", content: "AI-powered alternate life simulation game across 8 worlds, plus your own parallel life simulator." },
      { name: "author", content: "Revenio" },
      { property: "og:title", content: "Revenio — Explore the Life You Never Lived" },
      { property: "og:description", content: "AI-powered alternate life simulation game across 8 worlds, plus your own parallel life simulator." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Revenio" },
      { property: "og:url", content: "https://revenio.net" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Revenio — Explore the Life You Never Lived" },
      { name: "twitter:description", content: "AI-powered alternate life simulation game across 8 worlds, plus your own parallel life simulator." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/fceeb6fd-38b0-43d7-96cf-febb3da32dfa" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/fceeb6fd-38b0-43d7-96cf-febb3da32dfa" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Josefin+Sans:wght@300;400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Revenio",
              url: "https://revenio.net",
              logo: "https://revenio.net/favicon.ico",
            },
            {
              "@type": "WebSite",
              name: "Revenio",
              url: "https://revenio.net",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
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

  // Remember-Me: when the auth page sets `revenio_session_only=1`, mirror the
  // Supabase auth token between localStorage (so the client picks it up) and
  // sessionStorage (so it vanishes when the browser/tab closes).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("revenio_session_only") !== "1") return;

    const matches = (k: string) => k.startsWith("sb-") && k.endsWith("-auth-token");

    // Restore from sessionStorage → localStorage on load (handles in-tab reloads).
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && matches(k)) {
        const v = sessionStorage.getItem(k);
        if (v) localStorage.setItem(k, v);
      }
    }

    const offload = () => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && matches(k)) keys.push(k);
      }
      keys.forEach((k) => {
        const v = localStorage.getItem(k);
        if (v) sessionStorage.setItem(k, v);
        localStorage.removeItem(k);
      });
    };
    window.addEventListener("pagehide", offload);
    return () => window.removeEventListener("pagehide", offload);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
