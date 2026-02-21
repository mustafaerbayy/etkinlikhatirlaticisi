import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import EventCard from "@/components/EventCard";
import HeroSection from "@/components/HeroSection";
import AboutModal from "@/components/AboutModal";
import Navbar from "@/components/Navbar";

interface EventWithRelations {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  city_id: string;
  venue_id: string;
  category_id: string;
  cities: { name: string } | null;
  categories: { name: string } | null;
  rsvps: { status: string; guest_count: number }[];
}

const Index = () => {
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [eventsRes, citiesRes, categoriesRes] = await Promise.all([
        supabase
          .from("events")
          .select("*, cities(name), categories(name), rsvps(status, guest_count)")
          .order("date", { ascending: true }),
        supabase.from("cities").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
      ]);
      setEvents((eventsRes.data as unknown as EventWithRelations[]) || []);
      setCities(citiesRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "all" || e.city_id === cityFilter;
    const matchesCategory = categoryFilter === "all" || e.category_id === categoryFilter;
    return matchesSearch && matchesCity && matchesCategory;
  });

  const upcomingEvents = filteredEvents.filter((e) => e.date >= today);
  const pastEvents = filteredEvents.filter((e) => e.date < today).reverse();

  const getAttendeeCount = (rsvps: { status: string; guest_count: number }[]) => {
    return rsvps
      .filter((r) => r.status === "attending")
      .reduce((sum, r) => sum + 1 + r.guest_count, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAboutClick={() => setAboutOpen(true)} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <HeroSection />
      <section id="events-section" className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Yaklaşan Etkinlikler
            </h2>
          </div>
          <p className="text-muted-foreground mt-1 ml-[52px]">Katılmak istediğiniz etkinlikleri keşfedin</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Etkinlik ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/60 backdrop-blur-sm border-border/50 focus:border-primary/30"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card/60 backdrop-blur-sm border-border/50">
              <SelectValue placeholder="Şehir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Şehirler</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card/60 backdrop-blur-sm border-border/50">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Event Grid */}
        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Etkinlikler yükleniyor...</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">Etkinlik bulunamadı</p>
            <p className="mt-1 text-sm text-muted-foreground">Yaklaşan etkinlikler burada görünecek.</p>
          </motion.div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, i) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                time={event.time}
                cityName={event.cities?.name || ""}
                categoryName={event.categories?.name || ""}
                attendeeCount={getAttendeeCount(event.rsvps || [])}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Past Events - Hidden */}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-xs font-bold">R</span>
              </div>
              <span className="font-display text-sm font-semibold text-foreground">Refik, Keşif ve İnşa</span>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;