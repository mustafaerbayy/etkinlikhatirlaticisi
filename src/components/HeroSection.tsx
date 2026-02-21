import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroSunset from "@/assets/hero-sunset.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-[420px] flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroSunset})` }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/80" />

      <div className="container relative z-10 mx-auto px-4 py-20 text-center md:py-28">
        <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-6xl lg:text-7xl animate-fade-in drop-shadow-lg">
          Refik, Keşif ve İnşa
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90 md:text-xl animate-fade-in drop-shadow" style={{ animationDelay: "0.15s" }}>
          Kültürel keşifler, sanatsal buluşmalar ve yaratıcı deneyimler için tek adres.
        </p>
        <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 px-8 shadow-lg"
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
