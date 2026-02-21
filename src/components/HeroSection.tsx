import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="container relative mx-auto px-4 py-20 text-center md:py-28">
        <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-6xl lg:text-7xl animate-fade-in">
          Refik, Keşif ve İnşa
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80 md:text-xl animate-fade-in" style={{ animationDelay: "0.15s" }}>
          Kültürel keşifler, sanatsal buluşmalar ve yaratıcı deneyimler için tek adres.
        </p>
        <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 px-8"
            onClick={() => navigate("/kayit")}
          >
            Abone Ol
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
