import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import OrnamentalLogo from "@/components/OrnamentalLogo";

interface NavbarProps {
  onAboutClick?: () => void;
}

const Navbar = ({ onAboutClick }: NavbarProps) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 glass shadow-lg shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="container mx-auto flex items-center justify-between px-4 py-3 relative">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600/20 to-blue-900/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
            <OrnamentalLogo className="h-10 w-10 relative drop-shadow-lg" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-foreground transition-colors duration-300 group-hover:text-amber-700">
              Refik
            </span>
            <span className="text-xs text-muted-foreground font-medium group-hover:text-blue-900 transition-colors duration-300">
              Keşif ve İnşa
            </span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <NavItem to="/" label="Etkinlikler" />
          <button className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 group" onClick={onAboutClick}>
            Hakkımızda
            <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </button>
          {user && <NavItem to="/profil" label="Hatırlatıcılar" />}
          {isAdmin && <NavItem to="/yonetim" label="Yönetim" />}
          
          <div className="ml-3 h-5 w-px bg-gradient-to-b from-border via-border to-transparent" />
          
          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-bold ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                {profile?.first_name?.[0] || "U"}
              </div>
              <span className="text-sm font-medium text-foreground">
                {profile?.first_name}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 rounded-lg" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="ml-3 flex gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 rounded-lg" onClick={() => navigate("/giris")}>
                Giriş Yap
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 text-primary-foreground font-medium rounded-lg transition-all duration-300 hover:-translate-y-0.5" onClick={() => navigate("/kayit")}>
                Abone Ol
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm px-4 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            <MobileNavItem to="/" label="Etkinlikler" onClick={() => setMobileOpen(false)} />
            <button className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all text-left" onClick={() => { onAboutClick?.(); setMobileOpen(false); }}>Hakkımızda</button>
            {user && <MobileNavItem to="/profil" label="Hatırlatıcılar" onClick={() => setMobileOpen(false)} />}
            {isAdmin && <MobileNavItem to="/yonetim" label="Yönetim" onClick={() => setMobileOpen(false)} />}
            <div className="my-2 h-px bg-gradient-to-r from-border via-border to-transparent" />
            {user ? (
              <button
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" /> Çıkış Yap
              </button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate("/giris"); setMobileOpen(false); }}>
                  Giriş Yap
                </Button>
                <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent" onClick={() => { navigate("/kayit"); setMobileOpen(false); }}>
                  Abone Ol
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 group"
  >
    {label}
    <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
  </Link>
);

const MobileNavItem = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => (
  <Link
    to={to}
    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all"
    onClick={onClick}
  >
    {label}
  </Link>
);

export default Navbar;