import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

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
    <nav className="sticky top-0 z-50 border-b border-border/50 glass">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold text-foreground tracking-tight">
            Refik
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <NavItem to="/" label="Etkinlikler" />
          <button className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50" onClick={onAboutClick}>Hakkımızda</button>
          {user && <NavItem to="/profil" label="Hatırlatıcılar" />}
          {isAdmin && <NavItem to="/yonetim" label="Yönetim" />}
          
          <div className="ml-3 h-5 w-px bg-border" />
          
          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {profile?.first_name?.[0] || "U"}
              </div>
              <span className="text-sm font-medium text-foreground">
                {profile?.first_name}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="ml-3 flex gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/giris")}>
                Giriş Yap
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-sm" onClick={() => navigate("/kayit")}>
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
        <div className="border-t border-border/50 bg-card px-4 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            <MobileNavItem to="/" label="Etkinlikler" onClick={() => setMobileOpen(false)} />
            <button className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors text-left" onClick={() => { onAboutClick?.(); setMobileOpen(false); }}>Hakkımızda</button>
            {user && <MobileNavItem to="/profil" label="Hatırlatıcılar" onClick={() => setMobileOpen(false)} />}
            {isAdmin && <MobileNavItem to="/yonetim" label="Yönetim" onClick={() => setMobileOpen(false)} />}
            <div className="my-2 h-px bg-border" />
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
                <Button size="sm" className="flex-1" onClick={() => { navigate("/kayit"); setMobileOpen(false); }}>
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
    className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
  >
    {label}
  </Link>
);

const MobileNavItem = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => (
  <Link
    to={to}
    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
    onClick={onClick}
  >
    {label}
  </Link>
);

export default Navbar;