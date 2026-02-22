import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CalendarDays, Loader } from "lucide-react";
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
      
      {/* Events Section with background decoration */}
      <section id="events-section" className="relative py-20">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 -left-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl"
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 -right-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/5 rounded-full blur-3xl"
            animate={{ y: [0, -50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <motion.div 
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CalendarDays className="h-6 w-6 text-primary font-bold" />
              </motion.div>
              <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                Yaklaşan Etkinlikler
              </h2>
            </div>
            <p className="text-muted-foreground mt-2 text-lg">Katılmak istediğiniz etkinlikleri keşfedin ve hatırlatıcı ekleyin</p>
          </motion.div>

          {/* Enhanced Filters */}
          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center p-6 rounded-2xl bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-md border border-border/30 shadow-lg"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Etkinlik ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-11 bg-card/80 backdrop-blur border-border/40 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-11 bg-card/80 backdrop-blur border-border/40 focus:border-primary/50 focus:ring-primary/20 rounded-xl">
                <SelectValue placeholder="Şehir Seç" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tüm Şehirler</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-11 bg-card/80 backdrop-blur border-border/40 focus:border-primary/50 focus:ring-primary/20 rounded-xl">
                <SelectValue placeholder="Kategori Seç" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Event Grid */}
          {loading ? (
            <motion.div
              className="mt-20 flex flex-col items-center justify-center gap-4 py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="h-10 w-10 text-primary" />
              </motion.div>
              <motion.p 
                className="text-lg text-muted-foreground font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Etkinlikler yükleniyor...
              </motion.p>
            </motion.div>
          ) : upcomingEvents.length === 0 ? (
            <motion.div
              className="mt-20 text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 shadow-lg mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
              </motion.div>
              <p className="text-2xl font-display font-bold text-foreground">Etkinlik bulunamadı</p>
              <p className="mt-2 text-muted-foreground text-lg">Yaklaşan etkinlikler burada görünecek.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.05 }}
            >
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
            </motion.div>
          )}
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative border-t border-border/50 bg-card/80 backdrop-blur-md overflow-hidden">
        {/* Decorative top border gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-6 md:flex-row md:justify-between"
          >
            <motion.div 
              className="flex items-center gap-3 group"
              whileHover={{ x: 5 }}
            >
              <motion.div 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                R
              </motion.div>
              <div>
                <span className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">Refik</span>
                <p className="text-xs text-muted-foreground">Keşif ve İnşa</p>
              </div>
            </motion.div>
            <motion.p 
              className="text-sm text-muted-foreground text-center md:text-right"
              whileHover={{ color: "hsl(var(--foreground))" }}
            >
              © 2026 Tüm hakları saklıdır. Kültür, sanat ve topluluk ruhunu yaşatıyoruz.
            </motion.p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Index;