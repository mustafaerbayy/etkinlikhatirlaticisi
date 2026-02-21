import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Lütfen e-posta adresinizi girin."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-password-reset", {
        body: { email: email.trim(), redirectUrl: `${window.location.origin}/sifre-sifirla` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSent(true);
    } catch (err: any) {
      // Don't reveal whether email exists
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Şifremi Unuttum</CardTitle>
            <CardDescription>
              {sent ? "E-postanızı kontrol edin" : "Şifrenizi sıfırlamak için e-posta adresinizi girin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Eğer <strong>{email}</strong> adresiyle bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.
                  Lütfen gelen kutunuzu kontrol edin.
                </p>
                <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/giris")}>
                  <ArrowLeft className="h-4 w-4" /> Giriş sayfasına dön
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  <Link to="/giris" className="text-primary underline inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Giriş sayfasına dön
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
