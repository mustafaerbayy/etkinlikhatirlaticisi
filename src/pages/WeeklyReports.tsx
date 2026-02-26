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

      {/* Reports Section - matching homepage style */}
      <section className="relative py-20">
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
                <FileText className="h-6 w-6 text-primary font-bold" />
              </motion.div>
              <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                Haftalık Raporlar
              </h2>
            </div>
            <p className="text-muted-foreground mt-2 text-lg">Son 3 aya ait haftalık raporların tümü</p>
          </motion.div>

          {canReport && (
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Button 
                className="gap-2 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold h-11 px-6 rounded-xl"
                onClick={openCreateDialog}
              >
                <Plus className="h-5 w-5" /> 
                Yeni Rapor Oluştur
              </Button>
            </motion.div>
          )}

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
                <Loader2 className="h-10 w-10 text-primary" />
              </motion.div>
              <motion.p 
                className="text-lg text-muted-foreground font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Raporlar yükleniyor...
              </motion.p>
            </motion.div>
          ) : reports.length === 0 ? (
            <motion.div
              className="mt-12 text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 shadow-lg mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="h-12 w-12 text-muted-foreground/40" />
              </motion.div>
              <p className="text-2xl font-display font-bold text-foreground">Rapor bulunamadı</p>
              <p className="mt-2 text-muted-foreground text-lg">Raporlar burada görünecek.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.1 }}
            >
              {reports.map((report, i) => (
                <motion.div 
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedReport(report)}
                  className="cursor-pointer"
                >
                  <Card
                    className={`border-border/50 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-md shadow-lg transition-all hover:shadow-xl hover:border-primary/30 h-full group ${
                      selectedReport?.id === report.id 
                        ? "ring-2 ring-primary shadow-xl border-primary/50" 
                        : "hover:border-accent/20 hover:-translate-y-1"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/15 transition-colors flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        {selectedReport?.id === report.id && (
                          <motion.div
                            className="h-2 w-2 bg-accent rounded-full flex-shrink-0 mt-1"
                            layoutId="activeIndicator"
                            transition={{ type: "spring", stiffness: 200, damping: 30 }}
                          />
                        )}
                      </div>
                      <div>
                        <CardTitle className="font-display text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{report.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(report.week_start).toLocaleDateString("tr-TR", { 
                            day: "numeric", 
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-2">
                        {report.content && (
                          <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-medium">Metin</span>
                        )}
                        {report.file_url && (
                          <span className="text-xs bg-accent/15 text-accent px-2.5 py-1 rounded-full font-medium">{report.file_type?.toUpperCase() || "DOSYA"}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Report Detail Modal/Drawer */}
      {selectedReport && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedReport(null)}
        />
      )}
      
      {selectedReport && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReport(null);
          }}
        >
          <Card className="w-full max-w-2xl border-border/50 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4 border-b border-border/30 sticky top-0 bg-gradient-to-br from-card/95 to-card/85">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl">{selectedReport.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedReport.week_start).toLocaleDateString("tr-TR", { 
                        day: "numeric", 
                        month: "long", 
                        year: "numeric",
                        weekday: "long"
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {canReport && (
                    <>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-all rounded-lg"
                          onClick={() => {
                            openEditDialog(selectedReport);
                            setSelectedReport(null);
                          }}
                          title="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-all rounded-lg"
                          onClick={() => {
                            handleDelete(selectedReport);
                            setSelectedReport(null);
                          }}
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 hover:bg-muted/50"
                    onClick={() => setSelectedReport(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {selectedReport.content && (
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    <div className="h-1 w-5 bg-gradient-to-r from-primary to-accent rounded-full" />
                    Rapor İçeriği
                  </h4>
                  <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap bg-primary/5 p-4 rounded-lg border border-primary/10 leading-relaxed">
                    {selectedReport.content}
                  </div>
                </div>
              )}

              {selectedReport.file_url && (
                <div className="pt-4 border-t border-border/30">
                  <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    <div className="h-1 w-5 bg-gradient-to-r from-accent to-primary rounded-full" />
                    Dosya
                  </h4>
                  <motion.div whileHover={{ x: 5 }}>
                    <Button 
                      variant="outline" 
                      className="gap-3 w-full group hover:border-primary/50 hover:bg-primary/5 transition-all rounded-lg"
                      asChild
                    >
                      <a href={selectedReport.file_url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                        <span>{selectedReport.file_type?.toUpperCase()} Dosyasını İndir</span>
                      </a>
                    </Button>
                  </motion.div>
                </div>
              )}

              {!selectedReport.content && !selectedReport.file_url && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground/60 italic">Bu raporda henüz içerik bulunmuyor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg border-border/50 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-3">
              <div className="rounded-lg bg-primary/15 p-2">
                {editingReport ? (
                  <Pencil className="h-5 w-5 text-primary" />
                ) : (
                  <Plus className="h-5 w-5 text-primary" />
                )}
              </div>
              {editingReport ? "Raporu Düzenle" : "Yeni Rapor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Başlık *</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="Rapor başlığını girin..." 
                className="h-11 bg-card/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-lg transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Tarih *</Label>
              <Input 
                type="date" 
                value={formData.report_date} 
                onChange={(e) => setFormData({ ...formData, report_date: e.target.value })} 
                className="h-11 bg-card/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-lg transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">İçerik</Label>
              <Textarea 
                rows={4}
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                placeholder="Rapor içeriğini yazın..." 
                className="bg-card/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-lg transition-all placeholder:text-muted-foreground/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Dosya (PDF, Word)</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="h-11 bg-card/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-lg transition-all text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/15 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {file && <p className="text-xs text-accent font-medium">✓ {file.name}</p>}
              {editingReport?.file_url && !file && (
                <p className="text-xs text-muted-foreground/70">Mevcut: {editingReport.file_type?.toUpperCase()}</p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => setDialogOpen(false)}
                variant="outline" 
                className="flex-1 h-11 rounded-lg border-border/50 hover:bg-card/50 transition-all"
              >
                İptal
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1 h-11 rounded-lg gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                    Kaydediliyor...
                  </>
                ) : editingReport ? (
                  <>
                    <Pencil className="h-4 w-4" />
                    Güncelle
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyReports;
