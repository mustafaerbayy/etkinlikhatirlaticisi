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
            className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-4 z-[101] m-auto max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border/50 bg-card p-6 md:p-10 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Bizi Tanıyın
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {cards.map((card, i) => (
                <motion.div
                  key={card.title}
                  className="group relative rounded-2xl border border-border/50 bg-background/50 p-6 transition-shadow hover:shadow-xl hover:shadow-primary/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
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
