import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus, BarChart3, Calendar, MapPin, Tag, Building, Shield, Mail, MailX, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

interface City { id: string; name: string }
interface Category { id: string; name: string }
interface Venue { id: string; name: string; city_id: string }
interface Event {
  id: string; title: string; description: string; date: string; time: string;
  city_id: string; venue_id: string; category_id: string;
  cities: { name: string } | null; venues: { name: string } | null; categories: { name: string } | null;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalUsers: 0, reminderStats: { r2h: 0, r1d: 0, r2d: 0, r3d: 0, r1w: 0 }, totalSent: 0, totalFailed: 0 });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"city" | "category" | "venue" | "event">("city");
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchAll = async () => {
    const [citiesR, catsR, venuesR, eventsR, profilesR, logsR] = await Promise.all([
      supabase.from("cities").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("venues").select("*").order("name"),
      supabase.from("events").select("*, cities(name), venues(name), categories(name)").order("date", { ascending: false }),
      supabase.from("profiles").select("reminder_2h, reminder_1d, reminder_2d, reminder_3d, reminder_1w"),
      supabase.from("reminder_logs").select("status"),
    ]);
    setCities(citiesR.data || []);
    setCategories(catsR.data || []);
    setVenues(venuesR.data || []);
    setEvents((eventsR.data as unknown as Event[]) || []);

    const profiles = profilesR.data || [];
    setStats({
      totalEvents: (eventsR.data || []).length,
      totalUsers: profiles.length,
      reminderStats: {
        r2h: profiles.filter(p => p.reminder_2h).length,
        r1d: profiles.filter(p => p.reminder_1d).length,
        r2d: profiles.filter(p => p.reminder_2d).length,
        r3d: profiles.filter(p => p.reminder_3d).length,
        r1w: profiles.filter(p => p.reminder_1w).length,
      },
      totalSent: (logsR.data || []).filter(l => l.status === "sent").length,
      totalFailed: (logsR.data || []).filter(l => l.status === "failed").length,
    });
  };

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  const openDialog = (type: typeof dialogType, item?: any) => {
    setDialogType(type);
    setEditingItem(item || null);
    if (type === "city") setFormData({ name: item?.name || "" });
    else if (type === "category") setFormData({ name: item?.name || "" });
    else if (type === "venue") setFormData({ name: item?.name || "", city_id: item?.city_id || "" });
    else if (type === "event") setFormData({
      title: item?.title || "", description: item?.description || "", date: item?.date || "",
      time: item?.time || "", city_id: item?.city_id || "", venue_id: item?.venue_id || "", category_id: item?.category_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (dialogType === "venue" && !formData.city_id) {
      toast.error("Lütfen bir şehir seçin.");
      return;
    }
    if (dialogType === "event") {
      if (!formData.title || !formData.date || !formData.time || !formData.category_id) {
        toast.error("Lütfen başlık, tarih, saat ve kategori alanlarını doldurun.");
        return;
      }
    }
    if ((dialogType === "city" || dialogType === "category") && !formData.name?.trim()) {
      toast.error("Lütfen bir ad girin.");
      return;
    }
    const dataToSave = { ...formData };
    if (dialogType === "event") {
      if (!dataToSave.city_id) dataToSave.city_id = null;
      if (!dataToSave.venue_id) dataToSave.venue_id = null;
    }
    const doSave = async (table: "cities" | "categories" | "venues" | "events") => {
      if (editingItem) {
        return supabase.from(table).update(dataToSave).eq("id", editingItem.id);
      } else {
        return supabase.from(table).insert(dataToSave);
      }
    };
    const table = dialogType === "city" ? "cities" as const : dialogType === "category" ? "categories" as const : dialogType === "venue" ? "venues" as const : "events" as const;
    const { error } = await doSave(table);
    if (error) { toast.error((editingItem ? "Güncelleme" : "Ekleme") + " başarısız: " + error.message); return; }
    toast.success(editingItem ? "Güncellendi." : "Eklendi.");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (table: "cities" | "categories" | "venues" | "events", id: string) => {
    if (!confirm("Silmek istediğinizden emin misiniz?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error("Silme başarısız: " + error.message); return; }
    toast.success("Silindi.");
    fetchAll();
  };

  if (loading || !isAdmin) return null;

  const statCards = [
    { icon: Calendar, label: "Toplam Etkinlik", value: stats.totalEvents, color: "text-primary", bg: "bg-primary/10" },
    { icon: Users, label: "Aktif Kullanıcı", value: stats.totalUsers, color: "text-accent", bg: "bg-accent/10" },
    { icon: Mail, label: "Gönderilen E-posta", value: stats.totalSent, color: "text-primary", bg: "bg-primary/10" },
    { icon: MailX, label: "Başarısız E-posta", value: stats.totalFailed, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  const reminderBars = [
    { label: "2 saat", val: stats.reminderStats.r2h },
    { label: "1 gün", val: stats.reminderStats.r1d },
    { label: "2 gün", val: stats.reminderStats.r2d },
    { label: "3 gün", val: stats.reminderStats.r3d },
    { label: "1 hafta", val: stats.reminderStats.r1w },
  ];
  const maxReminder = Math.max(...reminderBars.map(r => r.val), 1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, hsl(var(--gold) / 0.4) 0%, transparent 50%)' }} />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/10">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                Yönetim Paneli
              </h1>
              <p className="text-primary-foreground/75 mt-1">Etkinlik, şehir, mekan ve kategorileri yönetin</p>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 20C360 40 720 0 1080 20C1260 30 1380 10 1440 20V40H0V20Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg} ${s.color} transition-colors`}>
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Reminder Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Card className="mt-6 border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">Hatırlatıcı Tercihleri Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminderBars.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16 text-right shrink-0">{s.label} önce</span>
                    <div className="flex-1 h-8 rounded-lg bg-muted/50 overflow-hidden relative">
                      <motion.div
                        className="h-full rounded-lg bg-gradient-to-r from-primary/80 to-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.val / maxReminder) * 100}%` }}
                        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                      />
                      <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-primary-foreground mix-blend-difference">
                        {s.val} kullanıcı
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CRUD Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <Tabs defaultValue="events" className="mt-8">
            <TabsList className="bg-card/70 border border-border/50 backdrop-blur-sm p-1">
              <TabsTrigger value="events" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-3.5 w-3.5" /> Etkinlikler
              </TabsTrigger>
              <TabsTrigger value="cities" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapPin className="h-3.5 w-3.5" /> Şehirler
              </TabsTrigger>
              <TabsTrigger value="venues" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building className="h-3.5 w-3.5" /> Mekanlar
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Tag className="h-3.5 w-3.5" /> Kategoriler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{events.length} etkinlik</p>
                    <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openDialog("event")}>
                      <Plus className="h-4 w-4" /> Yeni Etkinlik
                    </Button>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="font-semibold">Başlık</TableHead>
                          <TableHead className="font-semibold">Tarih</TableHead>
                          <TableHead className="font-semibold">Şehir</TableHead>
                          <TableHead className="font-semibold">Kategori</TableHead>
                          <TableHead className="text-right font-semibold">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((e) => (
                          <TableRow key={e.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{e.title}</TableCell>
                            <TableCell className="text-muted-foreground">{e.date}</TableCell>
                            <TableCell>
                              {e.cities?.name && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                                  <MapPin className="h-3 w-3" /> {e.cities.name}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {e.categories?.name && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                                  <Tag className="h-3 w-3" /> {e.categories.name}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("event", e)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("events", e.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cities">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{cities.length} şehir</p>
                    <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openDialog("city")}>
                      <Plus className="h-4 w-4" /> Yeni Şehir
                    </Button>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="font-semibold">Ad</TableHead>
                          <TableHead className="text-right font-semibold">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cities.map((c) => (
                          <TableRow key={c.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("city", c)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("cities", c.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="venues">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{venues.length} mekan</p>
                    <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openDialog("venue")}>
                      <Plus className="h-4 w-4" /> Yeni Mekan
                    </Button>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="font-semibold">Ad</TableHead>
                          <TableHead className="font-semibold">Şehir</TableHead>
                          <TableHead className="text-right font-semibold">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {venues.map((v) => (
                          <TableRow key={v.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{v.name}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                                {cities.find(c => c.id === v.city_id)?.name}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("venue", v)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("venues", v.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{categories.length} kategori</p>
                    <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openDialog("category")}>
                      <Plus className="h-4 w-4" /> Yeni Kategori
                    </Button>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="font-semibold">Ad</TableHead>
                          <TableHead className="text-right font-semibold">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((c) => (
                          <TableRow key={c.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("category", c)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("categories", c.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Edit/Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editingItem ? "Düzenle" : "Yeni Ekle"} — {dialogType === "city" ? "Şehir" : dialogType === "category" ? "Kategori" : dialogType === "venue" ? "Mekan" : "Etkinlik"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {(dialogType === "city" || dialogType === "category") && (
                <div className="space-y-2">
                  <Label>Ad</Label>
                  <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
              )}
              {dialogType === "venue" && (
                <>
                  <div className="space-y-2">
                    <Label>Ad</Label>
                    <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Şehir</Label>
                    <Select value={formData.city_id || ""} onValueChange={(v) => setFormData({ ...formData, city_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {dialogType === "event" && (
                <>
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Açıklama</Label>
                    <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tarih</Label>
                      <Input type="date" value={formData.date || ""} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Saat</Label>
                      <Input type="time" value={formData.time || ""} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Şehir</Label>
                    <Select value={formData.city_id || ""} onValueChange={(v) => setFormData({ ...formData, city_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
                      <SelectContent>{cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mekan</Label>
                    <Select value={formData.venue_id || ""} onValueChange={(v) => setFormData({ ...formData, venue_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Mekan seçin" /></SelectTrigger>
                      <SelectContent>{venues.filter(v => !formData.city_id || v.city_id === formData.city_id).map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={formData.category_id || ""} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <Button onClick={handleSave} className="w-full shadow-sm">
                {editingItem ? "Güncelle" : "Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
