import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { RevenioLogo, RevenioWordmark } from "@/components/RevenioLogo";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";

export function SiteNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? { email: data.session.user.email } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { email: session.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home", exact: true },
    { to: "/worlds", label: "Worlds" },
    { to: "/pricing", label: "Pricing" },
    { to: "/hardware", label: "Hardware" },
    { to: "/play", label: "Play" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <RevenioLogo size={30} className="transition-transform group-hover:rotate-3" />
          <RevenioWordmark className="text-lg" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10 text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-[var(--gold)] transition"
              activeProps={{ className: "text-[var(--gold)]" }}
              activeOptions={{ exact: link.exact }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-[0.65rem] tracking-[0.25em] uppercase border border-border text-muted-foreground hover:text-[var(--gold)] hover:border-[var(--gold)] px-4 py-2 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-[0.65rem] tracking-[0.25em] uppercase border border-[var(--gold)]/60 text-[var(--gold)] px-5 py-2 hover:bg-[var(--gold)] hover:text-background transition-all duration-300"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 text-muted-foreground hover:text-[var(--gold)] transition"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 border-l border-border bg-background/95 backdrop-blur-xl">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-[var(--gold)] transition"
                      activeProps={{ className: "text-[var(--gold)]" }}
                      activeOptions={{ exact: link.exact }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
