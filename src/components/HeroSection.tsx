import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-[520px] flex items-center justify-center">
      {/* Night Ramazan Background with Hanging Lanterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-amber-900/20 to-black">
        {/* Dark base */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Bokeh Light Circles */}
      <motion.div className="absolute inset-0 pointer-events-none">
        {/* Orange bokeh lights */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`bokeh-orange-${i}`}
            className="absolute rounded-full blur-2xl"
            style={{
              width: `${80 + i * 30}px`,
              height: `${80 + i * 30}px`,
              left: `${-10 + i * 20}%`,
              top: `${10 + i * 12}%`,
              background: "radial-gradient(circle, hsl(25 100% 60% / 0.6), hsl(25 100% 50% / 0.2))"
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.9, 1.2, 0.9]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}

        {/* Yellow bokeh lights */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`bokeh-yellow-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${100 + i * 40}px`,
              height: `${100 + i * 40}px`,
              right: `${5 + i * 15}%`,
              top: `${20 + i * 15}%`,
              background: "radial-gradient(circle, hsl(44 100% 65% / 0.5), hsl(44 100% 55% / 0.15))"
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 5 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
          />
        ))}

        {/* Blue bokeh lights */}
        {[0, 1].map((i) => (
          <motion.div
            key={`bokeh-blue-${i}`}
            className="absolute rounded-full blur-2xl"
            style={{
              width: `${90 + i * 35}px`,
              height: `${90 + i * 35}px`,
              left: `${50 + i * 25}%`,
              top: `${5 + i * 20}%`,
              background: "radial-gradient(circle, hsl(210 100% 60% / 0.4), hsl(210 100% 50% / 0.1))"
            }}
            animate={{
              opacity: [0.25, 0.6, 0.25],
              scale: [0.9, 1.15, 0.9]
            }}
            transition={{
              duration: 6 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}

        {/* Purple bokeh lights */}
        {[0, 1].map((i) => (
          <motion.div
            key={`bokeh-purple-${i}`}
            className="absolute rounded-full blur-2xl"
            style={{
              width: `${70 + i * 25}px`,
              height: `${70 + i * 25}px`,
              left: `${20 + i * 60}%`,
              top: `${40 + i * 25}%`,
              background: "radial-gradient(circle, hsl(270 100% 60% / 0.35), hsl(270 100% 50% / 0.1))"
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [0.85, 1.1, 0.85]
            }}
            transition={{
              duration: 5.5 + i * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6
            }}
          />
        ))}

        {/* White bokeh lights */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`bokeh-white-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              left: `${30 + i * 20}%`,
              top: `${55 + i * 18}%`,
              background: "radial-gradient(circle, hsl(0 0% 100% / 0.3), hsl(0 0% 90% / 0.1))"
            }}
            animate={{
              opacity: [0.15, 0.4, 0.15],
              scale: [0.9, 1.2, 0.9]
            }}
            transition={{
              duration: 4.5 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
          />
        ))}
      </motion.div>

      {/* Hanging Lanterns - Realistic Bulb Style */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={`lantern-hang-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: "0px",
            left: `${8 + i * 17}%`,
          }}
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
        >
          {/* Wire/Cable */}
          <div className="w-0.5 h-16 mx-auto bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900/20 shadow-md" />
          
          {/* Light Bulb Socket */}
          <div className="flex justify-center">
            <svg viewBox="0 0 60 100" width="60" height="100" className="drop-shadow-2xl">
              <defs>
                <filter id={`bulb-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                </filter>
                <radialGradient id={`bulb-light-${i}`} cx="40%" cy="30%">
                  <stop offset="0%" stopColor="hsl(39 100% 75%)" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="hsl(25 100% 60%)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(15 100% 50%)" stopOpacity="0.1" />
                </radialGradient>
                <filter id={`bulb-outer-glow-${i}`}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
                </filter>
              </defs>
              
              {/* Outer glow/aura */}
              <circle cx="30" cy="35" r="22" fill="hsl(39 100% 65%)" opacity="0.3" filter={`url(#bulb-outer-glow-${i})`} />
              
              {/* Main bulb sphere */}
              <circle cx="30" cy="35" r="18" fill={`url(#bulb-light-${i})`} filter={`url(#bulb-glow-${i})`} />
              
              {/* Bulb highlight */}
              <ellipse cx="24" cy="25" rx="7" ry="8" fill="hsl(39 100% 85%)" opacity="0.6" />
              
              {/* Bulb base/socket - threads */}
              <rect x="20" y="50" width="20" height="8" rx="1" fill="hsl(25 60% 35%)" />
              <line x1="22" y1="52" x2="22" y2="56" stroke="hsl(25 50% 25%)" strokeWidth="0.8" opacity="0.6" />
              <line x1="26" y1="52" x2="26" y2="56" stroke="hsl(25 50% 25%)" strokeWidth="0.8" opacity="0.6" />
              <line x1="30" y1="52" x2="30" y2="56" stroke="hsl(25 50% 25%)" strokeWidth="0.8" opacity="0.6" />
              <line x1="34" y1="52" x2="34" y2="56" stroke="hsl(25 50% 25%)" strokeWidth="0.8" opacity="0.6" />
              <line x1="38" y1="52" x2="38" y2="56" stroke="hsl(25 50% 25%)" strokeWidth="0.8" opacity="0.6" />
              
              {/* Metal base bottom */}
              <ellipse cx="30" cy="60" rx="11" ry="3" fill="hsl(25 50% 40%)" />
              <ellipse cx="30" cy="59" rx="11" ry="3" fill="hsl(25 60% 50%)" opacity="0.7" />
              
              {/* Filament glow inside */}
              <line x1="28" y1="32" x2="32" y2="38" stroke="hsl(39 100% 70%)" strokeWidth="1.5" opacity="0.8" />
              <line x1="32" y1="32" x2="28" y2="38" stroke="hsl(39 100% 70%)" strokeWidth="1.5" opacity="0.8" />
            </svg>
          </div>

          {/* Ambient glow below bulb */}
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full blur-2xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(39 100% 60% / 0.4), transparent)"
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.25
            }}
          />
        </motion.div>
      ))}

      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="container relative z-10 mx-auto px-4 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}>

          <motion.div 
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-900/20 backdrop-blur-md px-4 py-1.5 mb-6 shadow-lg shadow-amber-600/30"
            whileHover={{ scale: 1.05, borderColor: "hsl(39 95% 64% / 1)" }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </motion.div>
            <span className="text-xs font-medium tracking-widest text-amber-300 uppercase">Kültür · Sanat · Keşif</span>
          </motion.div>
        </motion.div>

        <div className="overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* First Line */}
            <div className="flex flex-wrap gap-4 items-baseline justify-center">
              <motion.span
                className="font-display text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text drop-shadow-2xl"
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
              >
                Refik,
              </motion.span>
              <motion.span
                className="font-display text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text drop-shadow-2xl"
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.35, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
              >
                Keşif
              </motion.span>
            </div>

            {/* Second Line */}
            <div className="flex justify-center">
              <motion.span
                className="font-display text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-orange-300 via-yellow-400 to-amber-400 bg-clip-text drop-shadow-2xl"
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
              >
                ve İnşa
              </motion.span>
            </div>
          </motion.div>
        </div>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-amber-100/90 leading-relaxed md:text-sm drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}>
          Etkinlik hatırlatıcıları için aşağıdaki butona tıklayarak abone olabilirsiniz
        </motion.p>

        <motion.div
          className="mt-10 flex items-center justify-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold hover:shadow-2xl hover:shadow-orange-600/50 px-8 py-6 text-base shadow-xl rounded-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
              onClick={() => navigate("/kayit")}>
              <span className="relative z-10">Abone Ol</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-yellow-400/60 bg-amber-900/30 text-amber-200 hover:bg-amber-900/50 px-8 py-6 text-base backdrop-blur-md rounded-xl transition-all duration-300 hover:-translate-y-1 font-semibold hover:border-yellow-300/100"
              onClick={() => {
                document.querySelector('#events-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
              Etkinlikleri Keşfet
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom wave divider with enhanced animation */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="hsl(var(--background))" />
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;