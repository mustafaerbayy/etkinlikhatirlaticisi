import { motion, AnimatePresence } from "framer-motion";
import { Eye, Target, Users, X } from "lucide-react";

const cards = [
  {
    icon: Users,
    title: "Hakkımızda",
    description:
      "Refik, Keşif ve İnşa; kültür, sanat ve topluluk ruhunu bir araya getiren bir etkinlik platformudur. Amacımız, insanları ortak ilgi alanları etrafında buluşturarak kalıcı bağlar kurmak ve topluluk bilincini güçlendirmektir.",
  },
  {
    icon: Eye,
    title: "Vizyon",
    description:
      "Türkiye'nin her köşesinde kültürel ve sanatsal etkinliklere erişimi kolaylaştıran, toplulukları bir araya getiren öncü bir platform olmak. Herkesin sanat ve kültürle buluştuğu bir gelecek hayal ediyoruz.",
  },
  {
    icon: Target,
    title: "Misyon",
    description:
      "Etkinlikleri keşfetmeyi, takip etmeyi ve katılmayı herkes için kolay ve keyifli hale getirmek. Teknoloji ile kültürü birleştirerek toplulukların büyümesine katkıda bulunmak en temel görevimizdir.",
  },
];

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

const AboutModal = ({ open, onClose }: AboutModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-foreground/50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-4 z-[101] m-auto max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-border/50 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl p-6 md:p-10 shadow-2xl shadow-primary/20"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>

            <motion.h2 
              className="font-display text-4xl font-bold text-foreground mb-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Bizi Tanıyın
            </motion.h2>

            <div className="grid gap-6 md:grid-cols-3">
              {cards.map((card, i) => (
                <motion.div
                  key={card.title}
                  className="group relative rounded-2xl border-2 border-border/40 bg-gradient-to-br from-background/80 to-background/40 p-6 transition-all hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.4, type: "spring" }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                  <motion.div 
                    className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 text-primary transition-all group-hover:from-primary/30 group-hover:to-accent/20 group-hover:shadow-lg group-hover:shadow-primary/20"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <card.icon className="h-6 w-6" />
                  </motion.div>
                  
                  <h3 className="relative font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="relative text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/90 transition-colors">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AboutModal;
