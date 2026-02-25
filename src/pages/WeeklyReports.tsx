import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FileText, Download, Plus, Pencil, Trash2, Calendar, Upload, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

interface WeeklyReport {
  id: string;
  title: string;
  week_start: string;
  week_end: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  created_by: string;
  created_at: string;
}

const WeeklyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReport, setCanReport] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [formData, setFormData] = useState({ title: "", report_date: "", content: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  // Require login
  useEffect(() => {
    if (!user && !loading) {
      navigate("/giris");
    }
  }, [user, loading, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoff = threeMonthsAgo.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("weekly_reports")
      .select("*")
      .gte("week_start", cutoff)
      .order("week_start", { ascending: false });

    if (error) {
      console.error("Failed to fetch reports:", error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const checkPermission = async () => {
    if (!user) { setCanReport(false); return; }
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (isAdmin) { setCanReport(true); return; }
    const { data: isReportAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "report_admin" as any });
    setCanReport(!!isReportAdmin);
  };

  useEffect(() => {
    fetchReports();
    checkPermission();
  }, [user?.id]);

  const openCreateDialog = () => {
    setEditingReport(null);
    setFormData({
      title: "",
      report_date: new Date().toISOString().split("T")[0],
      content: "",
    });
    setFile(null);
    setDialogOpen(true);
  };

  const openEditDialog = (report: WeeklyReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      report_date: report.week_start,
      content: report.content || "",
    });
    setFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error("Başlık gereklidir."); return; }
    if (!formData.report_date) { toast.error("Rapor tarihi gereklidir."); return; }
    if (!formData.content.trim() && !file && !editingReport?.file_url) {
      toast.error("İçerik veya dosya eklemelisiniz."); return;
    }

    setSaving(true);
    try {
      let fileUrl = editingReport?.file_url || null;
      let fileType = editingReport?.file_type || null;

      // Upload file if provided
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("weekly-reports")
          .upload(fileName, file, { contentType: file.type });
        if (uploadError) { toast.error("Dosya yüklenemedi: " + uploadError.message); setSaving(false); return; }

        const { data: urlData } = supabase.storage.from("weekly-reports").getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
        fileType = ext;
      }

      const record = {
        title: formData.title.trim(),
        week_start: formData.report_date,
        week_end: formData.report_date,
        content: formData.content.trim() || null,
        file_url: fileUrl,
        file_type: fileType,
        created_by: user!.id,
      };

      if (editingReport) {
        const { error } = await supabase.from("weekly_reports").update(record).eq("id", editingReport.id);
        if (error) throw error;
        toast.success("Rapor güncellendi.");
      } else {
        const { error } = await supabase.from("weekly_reports").insert(record);
        if (error) throw error;
        toast.success("Rapor oluşturuldu.");
      }

      setDialogOpen(false);
      fetchReports();
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (report: WeeklyReport) => {
    if (!confirm("Bu raporu silmek istediğinizden emin misiniz?")) return;
    try {
      // Delete file from storage if exists
      if (report.file_url) {
        const parts = report.file_url.split("/weekly-reports/");
        if (parts[1]) {
          await supabase.storage.from("weekly-reports").remove([parts[1]]);
        }
      }
      const { error } = await supabase.from("weekly_reports").delete().eq("id", report.id);
      if (error) throw error;
      toast.success("Rapor silindi.");
      if (selectedReport?.id === report.id) setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error("Silme başarısız: " + err.message);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, hsl(var(--gold) / 0.4) 0%, transparent 50%)' }} />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div className="flex items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/10">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">Haftalık Raporlar</h1>
              <p className="text-primary-foreground/75 mt-1">Son 3 aya ait haftalık raporlar</p>
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
        {canReport && (
          <div className="flex justify-end mb-6">
            <Button className="gap-2 shadow-sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" /> Yeni Rapor Oluştur
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground mt-4">Henüz rapor bulunmuyor</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Report List */}
            <div className="lg:col-span-1 space-y-3">
              {reports.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    className={`border-border/50 bg-card/70 backdrop-blur-sm cursor-pointer transition-all hover:shadow-md ${
                      selectedReport?.id === r.id ? "ring-2 ring-primary shadow-lg" : ""
                    }`}
                    onClick={() => setSelectedReport(r)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-display font-semibold text-foreground text-sm">{r.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(r.week_start).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {r.content && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Metin</span>}
                        {r.file_url && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{r.file_type?.toUpperCase()}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Report Detail */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm sticky top-24">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-display text-xl">{selectedReport.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(selectedReport.week_start).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {selectedReport.file_url && (
                          <Button variant="outline" size="sm" className="gap-1.5" asChild>
                            <a href={selectedReport.file_url} target="_blank" rel="noopener noreferrer" download>
                              <Download className="h-3.5 w-3.5" /> İndir
                            </a>
                          </Button>
                        )}
                        {canReport && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEditDialog(selectedReport)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(selectedReport)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedReport.content ? (
                      <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                        {selectedReport.content}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">Yazılı içerik bulunmuyor. Dosyayı indirmek için yukarıdaki butonu kullanın.</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
                  <CardContent className="py-16 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground mt-3">Detayları görmek için bir rapor seçin</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingReport ? "Raporu Düzenle" : "Yeni Rapor Oluştur"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Haftalık rapor başlığı..." />
            </div>
            <div className="space-y-2">
              <Label>Rapor Tarihi</Label>
              <Input type="date" value={formData.report_date} onChange={(e) => setFormData({ ...formData, report_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>İçerik (opsiyonel)</Label>
              <Textarea rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Rapor içeriğini yazın..." />
            </div>
            <div className="space-y-2">
              <Label>Dosya Yükle (PDF/Word)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                {editingReport?.file_url && !file && (
                  <span className="text-xs text-muted-foreground shrink-0">Mevcut: {editingReport.file_type?.toUpperCase()}</span>
                )}
              </div>
            </div>
            <Button onClick={handleSave} className="w-full shadow-sm" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Kaydediliyor...</> : editingReport ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyReports;
