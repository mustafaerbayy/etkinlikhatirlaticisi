import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import EventCard from "@/components/EventCard";
import HeroSection from "@/components/HeroSection";
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

  useEffect(() => {
    const fetchData = async () => {
      const [eventsRes, citiesRes, categoriesRes] = await Promise.all([
        supabase
          .from("events")
          .select("*, cities(name), categories(name), rsvps(status, guest_count)")
          .gte("date", new Date().toISOString().split("T")[0])
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

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "all" || e.city_id === cityFilter;
    const matchesCategory = categoryFilter === "all" || e.category_id === categoryFilter;
    return matchesSearch && matchesCity && matchesCategory;
  });

  const getAttendeeCount = (rsvps: { status: string; guest_count: number }[]) => {
    return rsvps
      .filter((r) => r.status === "attending")
      .reduce((sum, r) => sum + 1 + r.guest_count, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      <section className="container mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Yaklaşan Etkinlikler
        </h2>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Etkinlik ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="mt-10 text-center text-muted-foreground">Yükleniyor...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-10 text-center text-muted-foreground">
            Yaklaşan etkinlik bulunamadı.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                time={event.time}
                cityName={event.cities?.name || ""}
                categoryName={event.categories?.name || ""}
                attendeeCount={getAttendeeCount(event.rsvps || [])}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t bg-card py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Refik, Keşif ve İnşa. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default Index;
