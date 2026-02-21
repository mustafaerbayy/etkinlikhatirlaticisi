import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import heroSunset from "@/assets/hero-sunset.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-[520px] flex items-center justify-center">
      {/* Background image with parallax feel */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${heroSunset})` }} />

      {/* Rich gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/50 to-background" />
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, hsl(var(--gold) / 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, hsl(var(--primary-glow) / 0.2) 0%, transparent 50%)' }} />

      <div className="container relative z-10 mx-auto px-4 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}>

          <div className="inline-flex items-center gap-2 rounded-full border border-gold-light/30 bg-primary-foreground/10 backdrop-blur-sm px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-medium tracking-wide text-primary-foreground/90 uppercase">Kültür · Sanat · Keşif</span>
          </div>
        </motion.div>

        <motion.h1
          className="font-display text-5xl font-bold text-primary-foreground md:text-7xl lg:text-8xl drop-shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}>

          Refik, Keşif
          <br />
          <span className="text-gradient block mt-3">ve İnşa</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/85 md:text-xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}>

          Kültürel keşifler, sanatsal buluşmalar ve yaratıcı deneyimler için tek adres.
        </motion.p>

        <motion.div
          className="mt-10 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}>

          <Button
            size="lg"
            className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 px-8 py-6 text-base shadow-xl shadow-accent/20 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/30 hover:-translate-y-0.5"
            onClick={() => navigate("/kayit")}>

            Abone Ol
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-base backdrop-blur-sm"
            onClick={() => {
              document.querySelector('#events-section')?.scrollIntoView({ behavior: 'smooth' });
            }}>

            Etkinlikleri Keşfet
          </Button>
        </motion.div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>);

};

export default HeroSection;