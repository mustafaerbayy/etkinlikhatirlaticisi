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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, BarChart3, Calendar, MapPin, Tag, Building } from "lucide-react";
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

  // Form state
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
    // Validation
    if (dialogType === "venue" && !formData.city_id) {
      toast.error("Lütfen bir şehir seçin.");
      return;
    }
    if (dialogType === "event") {
      if (!formData.city_id || !formData.venue_id || !formData.category_id || !formData.title || !formData.date || !formData.time) {
        toast.error("Lütfen tüm alanları doldurun.");
        return;
      }
    }
    if ((dialogType === "city" || dialogType === "category") && !formData.name?.trim()) {
      toast.error("Lütfen bir ad girin.");
      return;
    }
    const doSave = async (table: "cities" | "categories" | "venues" | "events") => {
      if (editingItem) {
        return supabase.from(table).update(formData).eq("id", editingItem.id);
      } else {
        return supabase.from(table).insert(formData);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Yönetim Paneli</h1>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                  <p className="text-xs text-muted-foreground">Toplam Etkinlik</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Aktif Kullanıcı</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Gönderilen E-posta</p>
                <p className="text-2xl font-bold text-primary">{stats.totalSent}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Başarısız E-posta</p>
                <p className="text-2xl font-bold text-destructive">{stats.totalFailed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reminder Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-display text-lg">Hatırlatıcı Tercihleri Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                { label: "2 saat", val: stats.reminderStats.r2h },
                { label: "1 gün", val: stats.reminderStats.r1d },
                { label: "2 gün", val: stats.reminderStats.r2d },
                { label: "3 gün", val: stats.reminderStats.r3d },
                { label: "1 hafta", val: stats.reminderStats.r1w },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-lg border p-3">
                  <p className="text-xl font-bold text-primary">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label} önce</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CRUD Tabs */}
        <Tabs defaultValue="events" className="mt-8">
          <TabsList>
            <TabsTrigger value="events">Etkinlikler</TabsTrigger>
            <TabsTrigger value="cities">Şehirler</TabsTrigger>
            <TabsTrigger value="venues">Mekanlar</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => openDialog("event")}><Plus className="h-4 w-4 mr-1" /> Yeni Etkinlik</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.cities?.name}</TableCell>
                    <TableCell>{e.categories?.name}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog("event", e)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete("events", e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="cities">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => openDialog("city")}><Plus className="h-4 w-4 mr-1" /> Yeni Şehir</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Ad</TableHead><TableHead className="text-right">İşlem</TableHead></TableRow></TableHeader>
              <TableBody>
                {cities.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog("city", c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete("cities", c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="venues">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => openDialog("venue")}><Plus className="h-4 w-4 mr-1" /> Yeni Mekan</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Ad</TableHead><TableHead>Şehir</TableHead><TableHead className="text-right">İşlem</TableHead></TableRow></TableHeader>
              <TableBody>
                {venues.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{cities.find(c => c.id === v.city_id)?.name}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog("venue", v)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete("venues", v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="categories">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => openDialog("category")}><Plus className="h-4 w-4 mr-1" /> Yeni Kategori</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Ad</TableHead><TableHead className="text-right">İşlem</TableHead></TableRow></TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog("category", c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete("categories", c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        {/* Edit/Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingItem ? "Düzenle" : "Yeni Ekle"} — {dialogType === "city" ? "Şehir" : dialogType === "category" ? "Kategori" : dialogType === "venue" ? "Mekan" : "Etkinlik"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
              <Button onClick={handleSave} className="w-full">
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
