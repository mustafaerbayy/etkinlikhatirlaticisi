import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatTurkishDate, formatTurkishTime } from "@/lib/date-utils";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  cityName: string;
  categoryName: string;
  attendeeCount: number;
}

const EventCard = ({ id, title, date, time, cityName, categoryName, attendeeCount }: EventCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
      onClick={() => navigate(`/etkinlik/${id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {categoryName}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {attendeeCount} katılımcı
          </span>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        <div className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            <span>{formatTurkishDate(date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary/70" />
            <span>{formatTurkishTime(time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
            <span>{cityName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
