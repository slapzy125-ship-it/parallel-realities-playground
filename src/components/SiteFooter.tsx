import { Link } from "@tanstack/react-router";
import { RevenioLogo, RevenioWordmark } from "@/components/RevenioLogo";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border py-12 px-6 mt-px">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3">
          <RevenioLogo size={28} />
          <RevenioWordmark className="text-base" />
          <span className="hidden md:inline text-border ml-2">|</span>
          <span className="hidden md:inline text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground">
            One Headset. Infinite Worlds.
          </span>
        </Link>
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground/60">
          © 2026 Revenio LLC · Wellesley, MA · Coming 2031
        </p>
      </div>
    </footer>
  );
}
