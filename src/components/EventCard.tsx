import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { formatTurkishDate, formatTurkishTime } from "@/lib/date-utils";
import { motion } from "framer-motion";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  cityName: string;
  venueName?: string;
  categoryName: string;
  attendeeCount: number;
  index?: number;
  isPast?: boolean;
}

const EventCard = ({ id, title, date, time, cityName, venueName, categoryName, attendeeCount, index = 0, isPast = false }: EventCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className={isPast ? "opacity-40 blur-sm" : ""}
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card
          className="group cursor-pointer overflow-hidden border border-border/60 bg-card/90 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/40 relative"
          onClick={() => navigate(`/etkinlik/${id}`)}
        >
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top accent bar with gradient */}
          <motion.div 
            className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary opacity-70 group-hover:opacity-100 transition-opacity" 
            layoutId={`accent-bar-${id}`}
          />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between gap-2 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Badge className="bg-gradient-to-r from-secondary to-accent/80 text-secondary-foreground border-0 text-xs font-bold px-3 py-1 shadow-md">
                  {categoryName}
                </Badge>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-primary/10 px-2.5 py-1.5 rounded-lg"
                whileHover={{ backgroundColor: "hsl(var(--primary) / 0.2)" }}
              >
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>{attendeeCount}</span>
              </motion.div>
            </div>

            <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight mb-4">
              {title}
            </h3>

            <div className="mt-5 space-y-3">
              <motion.div 
                className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                whileHover={{ x: 4 }}
              >
                <motion.div 
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Calendar className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="font-semibold">{formatTurkishDate(date)}</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                whileHover={{ x: 4 }}
              >
                <motion.div 
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-colors"
                  whileHover={{ rotate: -5, scale: 1.1 }}
                >
                  <Clock className="h-4 w-4 text-accent" />
                </motion.div>
                <span className="font-semibold">{formatTurkishTime(time)}</span>
              </motion.div>
              
              {cityName && (
                <motion.div 
                  className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <motion.div 
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{cityName}</span>
                    {venueName && <span className="text-xs text-muted-foreground/80">{venueName}</span>}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Click hint */}
            <motion.div 
              className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              Detayları görmek için tıklayın →
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EventCard;