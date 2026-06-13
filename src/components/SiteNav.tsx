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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? { email: data.session.user.email } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { email: session.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home", exact: true },
    { to: "/worlds", label: "Worlds" },
    { to: "/hardware", label: "Hardware" },
    { to: "/play", label: "Play" },
    { to: "/parallel", label: "Parallel Life", accent: true as const },
    { to: "/parallel2", label: "Parallel 2.0", accent: true as const },
  ];

  return (
    <>
      <style>{`
        .nav-link-wrap {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }
        .nav-link-wrap::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--gold, #D4A843);
          transform: scaleX(0);
          transform-origin: right center;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .nav-link-wrap:hover::after,
        .nav-link-wrap.active::after {
          transform: scaleX(1);
          transform-origin: left center;
        }
        .nav-link-wrap.accent::after {
          background: #4A9EFF;
        }
      `}</style>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
          backgroundColor: scrolled ? 'rgba(10,10,12,0.92)' : 'rgba(10,10,12,0.70)',
          borderBottom: scrolled ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(255,255,255,0.06)',
          transition: 'background-color 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
          boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group" style={{ transition: 'opacity 0.3s' }}>
            <RevenioLogo size={30} className="transition-transform group-hover:rotate-3" />
            <RevenioWordmark className="text-lg" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10 text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">
            {navLinks.map((link) => (
              <span key={link.to} className={`nav-link-wrap${link.accent ? ' accent' : ''}`}>
                <Link
                  to={link.to}
                  className={
                    link.accent
                      ? "text-[#4A9EFF] hover:text-[#7BB8FF] transition-colors duration-200"
                      : "hover:text-[var(--gold)] transition-colors duration-200"
                  }
                  activeProps={{ className: link.accent ? "text-[#7BB8FF]" : "text-[var(--gold)]" }}
                  activeOptions={{ exact: link.exact }}
                >
                  {link.label}
                </Link>
              </span>
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
                  className="text-[0.65rem] tracking-[0.25em] uppercase border border-border text-muted-foreground hover:text-[var(--gold)] hover:border-[var(--gold)] px-4 py-2 transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-[0.65rem] tracking-[0.25em] uppercase border border-[var(--gold)]/60 text-[var(--gold)] px-5 py-2 hover:bg-[var(--gold)] hover:text-background transition-all duration-300"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 text-muted-foreground hover:text-[var(--gold)] transition-colors duration-200"
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
                        className={
                          link.accent
                            ? "text-sm tracking-[0.2em] uppercase text-[#4A9EFF] hover:text-[#7BB8FF] transition-colors duration-200"
                            : "text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-[var(--gold)] transition-colors duration-200"
                        }
                        activeProps={{ className: link.accent ? "text-[#7BB8FF]" : "text-[var(--gold)]" }}
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
    </>
  );
}
