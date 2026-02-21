import { motion } from "framer-motion";
import { Eye, Target, Users } from "lucide-react";

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

const AboutSection = () => {
  return (
    <section id="about-section" className="container mx-auto px-4 py-16">
      <motion.div
        className="grid gap-8 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.title}
            className="group relative rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-8 transition-shadow hover:shadow-xl hover:shadow-primary/5"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <card.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-3">
              {card.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {card.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default AboutSection;
