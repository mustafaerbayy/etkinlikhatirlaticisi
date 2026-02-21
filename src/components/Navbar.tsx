import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold text-primary transition-transform duration-200 hover:scale-110 inline-block">
          Refik, Keşif ve İnşa
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 hover:scale-110 inline-block">
            Etkinlikler
          </Link>
          {user && (
            <Link to="/profil" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 hover:scale-110 inline-block">
              Hatırlatıcılar
            </Link>
          )}
          {isAdmin && (
            <Link to="/yonetim" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 hover:scale-110 inline-block">
              Yönetim
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground transition-all duration-200 hover:scale-110 inline-block cursor-default">
                {profile?.first_name} {profile?.last_name}
              </span>
              <Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-110" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-110" onClick={() => navigate("/giris")}>
                Giriş Yap
              </Button>
              <Button size="sm" className="transition-all duration-200 hover:scale-110" onClick={() => navigate("/kayit")}>
                Abone Ol
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
              Etkinlikler
            </Link>
            {user && (
              <Link to="/profil" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Hatırlatıcılar
              </Link>
            )}
            {isAdmin && (
              <Link to="/yonetim" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Yönetim
              </Link>
            )}
            {user ? (
              <Button variant="ghost" size="sm" className="justify-start" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { navigate("/giris"); setMobileOpen(false); }}>
                  Giriş Yap
                </Button>
                <Button size="sm" onClick={() => { navigate("/kayit"); setMobileOpen(false); }}>
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

export default Navbar;
