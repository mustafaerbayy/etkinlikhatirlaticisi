import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Bell, Clock, CalendarDays, CalendarRange, CalendarClock, User, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getErrorMessage } from "@/lib/error-messages";

const Profile = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState({
    reminder_2h: false,
    reminder_1d: false,
    reminder_2d: false,
    reminder_3d: false,
    reminder_1w: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/giris");
    }
    if (profile) {
      setReminders({
        reminder_2h: profile.reminder_2h,
        reminder_1d: profile.reminder_1d,
        reminder_2d: profile.reminder_2d,
        reminder_3d: profile.reminder_3d,
        reminder_1w: profile.reminder_1w,
      });
    }
  }, [user, profile, loading, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(reminders)
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(getErrorMessage(error));
    } else {
      toast.success("Hatırlatıcı tercihleri güncellendi.");
      refreshProfile();
    }
  };

  const reminderOptions = [
    { key: "reminder_2h" as const, label: "2 saat önce", description: "Etkinlik başlamadan 2 saat önce", icon: Clock },
    { key: "reminder_1d" as const, label: "1 gün önce", description: "Etkinlikten bir gün önce", icon: CalendarDays },
    { key: "reminder_2d" as const, label: "2 gün önce", description: "Etkinlikten iki gün önce", icon: CalendarClock },
    { key: "reminder_3d" as const, label: "3 gün önce", description: "Etkinlikten üç gün önce", icon: CalendarRange },
    { key: "reminder_1w" as const, label: "1 hafta önce", description: "Etkinlikten bir hafta önce", icon: CalendarRange },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, hsl(var(--gold) / 0.4) 0%, transparent 50%)' }} />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/10">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                Profilim
              </h1>
              <p className="text-primary-foreground/75 mt-1">
                {profile?.first_name} {profile?.last_name}
              </p>
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
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm shadow-lg shadow-primary/5 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="font-display text-xl">Hatırlatıcı Tercihleri</CardTitle>
                  <CardDescription className="mt-0.5">
                    Katıldığınız etkinlikler için ne zaman e-posta hatırlatıcısı almak istediğinizi seçin.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {reminderOptions.map((opt, i) => (
                <motion.div
                  key={opt.key}
                  className="group flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/50"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <opt.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <Label htmlFor={opt.key} className="text-sm font-medium text-foreground cursor-pointer">
                        {opt.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={opt.key}
                    checked={reminders[opt.key]}
                    onCheckedChange={(val) =>
                      setReminders((prev) => ({ ...prev, [opt.key]: val }))
                    }
                  />
                </motion.div>
              ))}

              <div className="pt-4 px-4">
                <Button onClick={handleSave} className="w-full gap-2 shadow-md shadow-primary/10" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Kaydediliyor..." : "Tercihleri Kaydet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
