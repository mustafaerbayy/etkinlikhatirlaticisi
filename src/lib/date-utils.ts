import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export const formatTurkishDate = (dateStr: string): string => {
  return format(parseISO(dateStr), "d MMMM yyyy", { locale: tr });
};

export const formatTurkishTime = (timeStr: string): string => {
  // timeStr is HH:mm:ss or HH:mm
  return timeStr.substring(0, 5);
};

export const formatTurkishDateTime = (dateStr: string, timeStr: string): string => {
  return `${formatTurkishDate(dateStr)}, ${formatTurkishTime(timeStr)}`;
};
