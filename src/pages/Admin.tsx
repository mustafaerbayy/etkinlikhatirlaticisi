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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus, Calendar, MapPin, Tag, Building, Shield, Mail, MailX, Users, Send, Megaphone, CheckCircle2, XCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

interface City { id: string; name: string }
interface Category { id: string; name: string }
interface Venue { id: string; name: string; city_id: string }
interface Event {
  id: string; title: string; description: string; date: string; time: string;
  city_id: string; venue_id: string; category_id: string;
  cities: { name: string } | null; venues: { name: string } | null; categories: { name: string } | null;
}
interface Profile { id: string; first_name: string; last_name: string; email?: string }
interface AdminUser { id: string; email: string; first_name: string; last_name: string; has_announcement_access?: boolean }
interface Announcement {
  id: string; subject: string; body: string; recipient_count: number; created_at: string;
  announcement_recipients?: { status: string }[];
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [hasAnnouncementAccess, setHasAnnouncementAccess] = useState(false);
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
  const [useCustomVenue, setUseCustomVenue] = useState(false);
  const [customVenueName, setCustomVenueName] = useState("");

  // Announcement state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sending, setSending] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Admin management state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchAll = async () => {
    const [citiesR, catsR, venuesR, eventsR, profilesR, logsR, announcementsR] = await Promise.all([
      supabase.from("cities").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("venues").select("*").order("name"),
      supabase.from("events").select("*, cities(name), venues(name), categories(name)").order("date", { ascending: false }),
      supabase.from("profiles").select("id, first_name, last_name, reminder_2h, reminder_1d, reminder_2d, reminder_3d, reminder_1w"),
      supabase.from("reminder_logs").select("status"),
      supabase.from("announcements").select("*, announcement_recipients(status)").order("created_at", { ascending: false }),
    ]);
    setCities(citiesR.data || []);
    setCategories(catsR.data || []);
    setVenues(venuesR.data || []);
    setEvents((eventsR.data as unknown as Event[]) || []);
    setProfiles((profilesR.data as any[]) || []);
    setAnnouncements((announcementsR.data as unknown as Announcement[]) || []);

    const allProfiles = profilesR.data || [];
    setStats({
      totalEvents: (eventsR.data || []).length,
      totalUsers: allProfiles.length,
      reminderStats: {
        r2h: allProfiles.filter((p: any) => p.reminder_2h).length,
        r1d: allProfiles.filter((p: any) => p.reminder_1d).length,
        r2d: allProfiles.filter((p: any) => p.reminder_2d).length,
        r3d: allProfiles.filter((p: any) => p.reminder_3d).length,
        r1w: allProfiles.filter((p: any) => p.reminder_1w).length,
      },
      totalSent: (logsR.data || []).filter(l => l.status === "sent").length,
      totalFailed: (logsR.data || []).filter(l => l.status === "failed").length,
    });
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", { body: { action: "list" } });
      if (error) {
        console.error("Failed to fetch admins:", error);
        return;
      }
      if (data?.admins) {
        setAdmins(data.admins);
        // Check if current user has announcement access
        const currentAdmin = data.admins.find((a: AdminUser) => a.id === user?.id);
        if (currentAdmin) setHasAnnouncementAccess(!!currentAdmin.has_announcement_access);
      }
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  const parseEdgeFnError = async (error: any): Promise<string> => {
    if (error?.context?.body) {
      try {
        const text = await error.context.text();
        const parsed = JSON.parse(text);
        return parsed.error || "Bilinmeyen hata";
      } catch { /* ignore */ }
    }
    return error?.message || "Bilinmeyen hata";
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) { toast.error("Lütfen bir e-posta adresi girin."); return; }
    setAdminLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", { body: { action: "add", email: newAdminEmail.trim() } });
      if (error) {
        const msg = await parseEdgeFnError(error);
        toast.error(msg);
        return;
      }
      if (data?.error) { toast.error(data.error); return; }
      toast.success("Admin eklendi.");
      setNewAdminEmail("");
      fetchAdmins();
    } catch (err: any) { toast.error(err.message || "Admin eklenemedi."); }
    finally { setAdminLoading(false); }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm("Bu kullanıcının admin yetkisini kaldırmak istediğinizden emin misiniz?")) return;
    setAdminLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", { body: { action: "remove", user_id: userId } });
      if (error) {
        const msg = await parseEdgeFnError(error);
        toast.error(msg);
        return;
      }
      if (data?.error) { toast.error(data.error); return; }
      toast.success("Admin yetkisi kaldırıldı.");
      fetchAdmins();
    } catch (err: any) { toast.error(err.message || "İşlem başarısız."); }
    finally { setAdminLoading(false); }
  };

  const handleToggleAnnouncement = async (userId: string) => {
    setAdminLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", { body: { action: "toggle_announcement", user_id: userId } });
      if (error) { const msg = await parseEdgeFnError(error); toast.error(msg); return; }
      if (data?.error) { toast.error(data.error); return; }
      toast.success("Duyuru yetkisi güncellendi.");
      fetchAdmins();
    } catch (err: any) { toast.error(err.message || "İşlem başarısız."); }
    finally { setAdminLoading(false); }
  };

  useEffect(() => { if (isAdmin) { fetchAll(); fetchAdmins(); } }, [isAdmin]);

  const openDialog = (type: typeof dialogType, item?: any) => {
    setDialogType(type);
    setEditingItem(item || null);
    setUseCustomVenue(false);
    setCustomVenueName("");
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
    if (dialogType === "venue" && !formData.city_id) { toast.error("Lütfen bir şehir seçin."); return; }
    if (dialogType === "event") {
      if (!formData.title || !formData.date || !formData.time || !formData.category_id) { toast.error("Lütfen başlık, tarih, saat ve kategori alanlarını doldurun."); return; }
    }
    if ((dialogType === "city" || dialogType === "category") && !formData.name?.trim()) { toast.error("Lütfen bir ad girin."); return; }
    
    let dataToSave = { ...formData };
    let createdVenueId: string | null = null;
    
    if (dialogType === "event" && useCustomVenue && customVenueName.trim()) {
      const { data: newVenue, error: venueError } = await supabase
        .from("venues")
        .insert({ name: customVenueName.trim(), city_id: formData.city_id })
        .select()
        .single();
      
      if (venueError) {
        toast.error("Mekan oluşturulamadı: " + venueError.message);
        return;
      }
      
      createdVenueId = newVenue.id;
      dataToSave.venue_id = createdVenueId;
    }
    
    if (dialogType === "event") { if (!dataToSave.city_id) dataToSave.city_id = null; if (!dataToSave.venue_id) dataToSave.venue_id = null; }
    const doSave = async (table: "cities" | "categories" | "venues" | "events") => {
      if (editingItem) return supabase.from(table).update(dataToSave).eq("id", editingItem.id);
      else return supabase.from(table).insert(dataToSave);
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

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === profiles.length) setSelectedUsers([]);
    else setSelectedUsers(profiles.map(p => p.id));
  };

  const handleSendAnnouncement = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) { toast.error("Lütfen konu ve mesaj alanlarını doldurun."); return; }
    if (selectedUsers.length === 0) { toast.error("Lütfen en az bir kullanıcı seçin."); return; }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-announcement", {
        body: { subject: emailSubject, body: emailBody, recipientIds: selectedUsers },
      });

      if (error) throw error;

      toast.success(`${data.sent} kullanıcıya e-posta gönderildi.${data.failed > 0 ? ` ${data.failed} başarısız.` : ""}`);
      setEmailSubject("");
      setEmailBody("");
      setSelectedUsers([]);
      fetchAll();
    } catch (err: any) {
      toast.error("Gönderim başarısız: " + (err.message || "Bilinmeyen hata"));
    } finally {
      setSending(false);
    }
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
          <motion.div className="flex items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/10">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">Yönetim Paneli</h1>
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
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
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
                      <motion.div className="h-full rounded-lg bg-gradient-to-r from-primary/80 to-primary" initial={{ width: 0 }} animate={{ width: `${(s.val / maxReminder) * 100}%` }} transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }} />
                      <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-primary-foreground mix-blend-difference">{s.val} kullanıcı</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CRUD Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}>
          <Tabs defaultValue="events" className="mt-8">
            <TabsList className="bg-card/70 border border-border/50 backdrop-blur-sm p-1 flex-wrap h-auto gap-1">
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
              {(user?.email === "admin@admin.com" || hasAnnouncementAccess) && (
                <TabsTrigger value="announcements" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Megaphone className="h-3.5 w-3.5" /> Duyurular
                </TabsTrigger>
              )}
              {user?.email === "admin@admin.com" && (
                <TabsTrigger value="admins" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Shield className="h-3.5 w-3.5" /> Adminler
                </TabsTrigger>
              )}
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  {(() => {
                    const today = new Date().toISOString().split("T")[0];
                    const upcomingEvents = events.filter(e => e.date >= today);
                    const pastEvents = events.filter(e => e.date < today);
                    return (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-muted-foreground">{upcomingEvents.length} yaklaşan etkinlik</p>
                          <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openDialog("event")}><Plus className="h-4 w-4" /> Yeni Etkinlik</Button>
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
                              {upcomingEvents.map((e) => (
                                <TableRow key={e.id} className="hover:bg-muted/20">
                                  <TableCell className="font-medium">{e.title}</TableCell>
                                  <TableCell className="text-muted-foreground">{e.date}</TableCell>
                                  <TableCell>{e.cities?.name && <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"><MapPin className="h-3 w-3" /> {e.cities.name}</span>}</TableCell>
                                  <TableCell>{e.categories?.name && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium"><Tag className="h-3 w-3" /> {e.categories.name}</span>}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("event", e)}><Pencil className="h-3.5 w-3.5" /></Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("events", e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Past Events Section */}
                        {pastEvents.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-border/30">
                            <p className="text-sm text-muted-foreground mb-4 font-semibold flex items-center gap-2">
                              <Clock className="h-4 w-4" /> {pastEvents.length} geçmiş etkinlik
                            </p>
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
                                  {pastEvents.map((e) => (
                                    <TableRow key={e.id} className="hover:bg-muted/20 opacity-60">
                                      <TableCell className="font-medium">{e.title}</TableCell>
                                      <TableCell className="text-muted-foreground">{e.date}</TableCell>
                                      <TableCell>{e.cities?.name && <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"><MapPin className="h-3 w-3" /> {e.cities.name}</span>}</TableCell>
                                      <TableCell>{e.categories?.name && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium"><Tag className="h-3 w-3" /> {e.categories.name}</span>}</TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("event", e)}><Pencil className="h-3.5 w-3.5" /></Button>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("events", e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cities Tab */}
            <TabsContent value="cities">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{cities.length} şehir</p>
                    <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openDialog("city")}><Plus className="h-4 w-4" /> Yeni Şehir</Button>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead className="font-semibold">Ad</TableHead><TableHead className="text-right font-semibold">İşlem</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {cities.map((c) => (
                          <TableRow key={c.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("city", c)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("cities", c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

            {/* Venues Tab */}
            <TabsContent value="venues">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{venues.length} mekan</p>
                    <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openDialog("venue")}><Plus className="h-4 w-4" /> Yeni Mekan</Button>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead className="font-semibold">Ad</TableHead><TableHead className="font-semibold">Şehir</TableHead><TableHead className="text-right font-semibold">İşlem</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {venues.map((v) => (
                          <TableRow key={v.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{v.name}</TableCell>
                            <TableCell><span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{cities.find(c => c.id === v.city_id)?.name}</span></TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("venue", v)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("venues", v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{categories.length} kategori</p>
                    <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openDialog("category")}><Plus className="h-4 w-4" /> Yeni Kategori</Button>
                  </div>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead className="font-semibold">Ad</TableHead><TableHead className="text-right font-semibold">İşlem</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {categories.map((c) => (
                          <TableRow key={c.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openDialog("category", c)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("categories", c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

            {/* Announcements Tab */}
            {(user?.email === "admin@admin.com" || hasAnnouncementAccess) && <TabsContent value="announcements">
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                {/* Send Email */}
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary" /> Duyuru Gönder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Konu</Label>
                      <Input placeholder="E-posta konusu..." value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mesaj</Label>
                      <Textarea placeholder="E-posta içeriğini yazın..." rows={5} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
                    </div>

                    {/* User selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Alıcılar ({selectedUsers.length}/{profiles.length})</Label>
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={toggleAllUsers}>
                          {selectedUsers.length === profiles.length ? "Tümünü Kaldır" : "Tümünü Seç"}
                        </Button>
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-border/50 divide-y divide-border/30">
                        {profiles.map((p) => (
                          <label
                            key={p.id}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={selectedUsers.includes(p.id)}
                              onCheckedChange={() => toggleUser(p.id)}
                            />
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                {p.first_name?.[0] || "?"}
                              </div>
                              <span className="text-sm font-medium text-foreground truncate">
                                {p.first_name} {p.last_name}
                              </span>
                            </div>
                          </label>
                        ))}
                        {profiles.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">Henüz kayıtlı kullanıcı yok</p>
                        )}
                      </div>
                    </div>

                    <Button onClick={handleSendAnnouncement} className="w-full gap-2 shadow-sm" disabled={sending}>
                      <Send className="h-4 w-4" />
                      {sending ? "Gönderiliyor..." : `${selectedUsers.length} Kullanıcıya Gönder`}
                    </Button>
                  </CardContent>
                </Card>

                {/* History */}
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-accent" /> Geçmiş Duyurular
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {announcements.length === 0 ? (
                      <div className="text-center py-10">
                        <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm text-muted-foreground mt-3">Henüz duyuru gönderilmedi</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {announcements.map((a) => {
                          const sentCount = a.announcement_recipients?.filter(r => r.status === "sent").length || 0;
                          const failedCount = a.announcement_recipients?.filter(r => r.status === "failed").length || 0;
                          return (
                            <div key={a.id} className="rounded-xl border border-border/50 p-4 hover:bg-muted/20 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-foreground text-sm">{a.subject}</h4>
                                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                                  {new Date(a.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
                              <div className="flex items-center gap-3 mt-2.5">
                                <span className="inline-flex items-center gap-1 text-xs text-primary">
                                  <Users className="h-3 w-3" /> {a.recipient_count} alıcı
                                </span>
                                {sentCount > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                                    <CheckCircle2 className="h-3 w-3" /> {sentCount} gönderildi
                                  </span>
                                )}
                                {failedCount > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs text-destructive">
                                    <XCircle className="h-3 w-3" /> {failedCount} başarısız
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>}
            {/* Admins Tab */}
            {user?.email === "admin@admin.com" && <TabsContent value="admins">
              <Card className="border-border/50 bg-card/70 backdrop-blur-sm mt-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{admins.length} admin</p>
                  </div>

                  {/* Add admin */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Kullanıcı e-posta adresi..."
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                    />
                    <Button size="sm" className="gap-1.5 shadow-sm shrink-0" onClick={handleAddAdmin} disabled={adminLoading}>
                      <Plus className="h-4 w-4" /> Admin Ekle
                    </Button>
                  </div>

                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="font-semibold">Ad Soyad</TableHead>
                          <TableHead className="font-semibold">E-posta</TableHead>
                          <TableHead className="font-semibold text-center">Duyuru Yetkisi</TableHead>
                          <TableHead className="text-right font-semibold">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((a) => (
                          <TableRow key={a.id} className="hover:bg-muted/20">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                  {a.first_name?.[0] || a.email?.[0]?.toUpperCase() || "?"}
                                </div>
                                {a.first_name} {a.last_name}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{a.email}</TableCell>
                            <TableCell className="text-center">
                              {a.email !== "admin@admin.com" ? (
                                <Button
                                  variant={a.has_announcement_access ? "default" : "outline"}
                                  size="sm"
                                  className="gap-1.5 text-xs"
                                  onClick={() => handleToggleAnnouncement(a.id)}
                                  disabled={adminLoading}
                                >
                                  <Megaphone className="h-3 w-3" />
                                  {a.has_announcement_access ? "Aktif" : "Pasif"}
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">Her zaman</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleRemoveAdmin(a.id)}
                                disabled={adminLoading || a.id === user?.id}
                                title={a.id === user?.id ? "Kendinizi çıkaramazsınız" : "Admin yetkisini kaldır"}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {admins.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              Henüz admin bulunmuyor
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>}
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
                  <div className="space-y-2"><Label>Ad</Label><Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="space-y-2">
                    <Label>Şehir</Label>
                    <Select value={formData.city_id || ""} onValueChange={(v) => setFormData({ ...formData, city_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
                      <SelectContent>{cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {dialogType === "event" && (
                <>
                  <div className="space-y-2"><Label>Başlık</Label><Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Açıklama</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Tarih</Label><Input type="date" value={formData.date || ""} onChange={(e) => setFormData({ ...formData, date: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Saat</Label><Input type="time" value={formData.time || ""} onChange={(e) => setFormData({ ...formData, time: e.target.value })} /></div>
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
                    {!useCustomVenue ? (
                      <div className="space-y-2">
                        <Select value={formData.venue_id || ""} onValueChange={(v) => setFormData({ ...formData, venue_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Mekan seçin" /></SelectTrigger>
                          <SelectContent>{venues.filter(v => !formData.city_id || v.city_id === formData.city_id).map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => { setUseCustomVenue(true); setFormData({ ...formData, venue_id: "" }); }}>
                          + Yeni Mekan Ekle
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input placeholder="Mekan adını girin" value={customVenueName} onChange={(e) => setCustomVenueName(e.target.value)} />
                        <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => { setUseCustomVenue(false); setCustomVenueName(""); }}>
                          Mevcut Mekanlardan Seç
                        </Button>
                      </div>
                    )}
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
              <Button onClick={handleSave} className="w-full shadow-sm">{editingItem ? "Güncelle" : "Ekle"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
