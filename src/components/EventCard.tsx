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
  categoryName: string;
  attendeeCount: number;
  index?: number;
  isPast?: boolean;
}

const EventCard = ({ id, title, date, time, cityName, categoryName, attendeeCount, index = 0, isPast = false }: EventCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className={isPast ? "opacity-50 grayscale" : ""}
    >
      <Card
        className="group cursor-pointer overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1.5"
        onClick={() => navigate(`/etkinlik/${id}`)}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary opacity-60 group-hover:opacity-100 transition-opacity" />
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-2">
            <Badge className="bg-secondary text-secondary-foreground border-0 text-xs font-medium px-3 py-1">
              {categoryName}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{attendeeCount}</span>
            </div>
          </div>

          <h3 className="mt-4 font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
            {title}
          </h3>

          <div className="mt-5 space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{formatTurkishDate(date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <span className="font-medium">{formatTurkishTime(time)}</span>
            </div>
            {cityName && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{cityName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventCard;