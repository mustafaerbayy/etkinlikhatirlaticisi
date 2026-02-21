import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

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
      toast.error("Kaydetme başarısız.");
    } else {
      toast.success("Hatırlatıcı tercihleri güncellendi.");
      refreshProfile();
    }
  };

  const reminderOptions = [
    { key: "reminder_2h" as const, label: "2 saat önce" },
    { key: "reminder_1d" as const, label: "1 gün önce" },
    { key: "reminder_2d" as const, label: "2 gün önce" },
    { key: "reminder_3d" as const, label: "3 gün önce" },
    { key: "reminder_1w" as const, label: "1 hafta önce" },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-3xl font-bold">Profilim</h1>
          <p className="mt-2 text-muted-foreground">
            {profile?.first_name} {profile?.last_name}
          </p>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-display text-xl">Hatırlatıcı Tercihleri</CardTitle>
              <CardDescription>
                Katıldığınız etkinlikler için ne zaman e-posta hatırlatıcısı almak istediğinizi seçin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reminderOptions.map((opt) => (
                <div key={opt.key} className="flex items-center justify-between">
                  <Label htmlFor={opt.key}>{opt.label}</Label>
                  <Switch
                    id={opt.key}
                    checked={reminders[opt.key]}
                    onCheckedChange={(val) =>
                      setReminders((prev) => ({ ...prev, [opt.key]: val }))
                    }
                  />
                </div>
              ))}
              <Button onClick={handleSave} className="w-full mt-4" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
