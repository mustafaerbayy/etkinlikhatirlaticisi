import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, MapPin, Users, UserCheck, UserX } from "lucide-react";
import { formatTurkishDate, formatTurkishTime } from "@/lib/date-utils";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  cities: { name: string } | null;
  venues: { name: string } | null;
  categories: { name: string } | null;
}

interface RsvpWithProfile {
  id: string;
  user_id: string;
  status: string;
  guest_count: number;
  profiles: { first_name: string; last_name: string } | null;
}

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [rsvps, setRsvps] = useState<RsvpWithProfile[]>([]);
  const [myRsvp, setMyRsvp] = useState<{ status: string; guest_count: number } | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    const [eventRes, rsvpRes] = await Promise.all([
      supabase
        .from("events")
        .select("*, cities(name), venues(name), categories(name)")
        .eq("id", id)
        .single(),
      supabase
        .from("rsvps")
        .select("*, profiles(first_name, last_name)")
        .eq("event_id", id),
    ]);
    setEvent(eventRes.data as unknown as EventDetail);
    const rsvpData = (rsvpRes.data as unknown as RsvpWithProfile[]) || [];
    setRsvps(rsvpData);

    if (user) {
      const mine = rsvpData.find((r) => r.user_id === user.id);
      if (mine) {
        setMyRsvp({ status: mine.status, guest_count: mine.guest_count });
        setGuestCount(mine.guest_count);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleRsvp = async (status: "attending" | "not_attending") => {
    if (!user) {
      navigate("/giris");
      return;
    }
    if (!id) return;

    const gc = status === "attending" ? guestCount : 0;
    const existing = rsvps.find((r) => r.user_id === user.id);

    if (existing) {
      await supabase
        .from("rsvps")
        .update({ status, guest_count: gc })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("rsvps")
        .insert({ user_id: user.id, event_id: id, status, guest_count: gc });
    }

    setMyRsvp({ status, guest_count: gc });
    if (status === "not_attending") setGuestCount(0);
    toast.success(status === "attending" ? "Katılım kaydedildi!" : "Katılmama kaydedildi.");
    fetchData();
  };

  const updateGuestCount = async (count: number) => {
    setGuestCount(count);
    if (myRsvp?.status === "attending" && user) {
      const existing = rsvps.find((r) => r.user_id === user.id);
      if (existing) {
        await supabase.from("rsvps").update({ guest_count: count }).eq("id", existing.id);
        fetchData();
      }
    }
  };

  const attendingRsvps = rsvps.filter((r) => r.status === "attending");
  const notAttendingRsvps = rsvps.filter((r) => r.status === "not_attending");
  const totalAttendees = attendingRsvps.reduce((s, r) => s + 1 + r.guest_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Etkinlik bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Event Info */}
          <Badge variant="secondary" className="mb-3">{event.categories?.name}</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{event.title}</h1>

          <div className="mt-4 flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatTurkishDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{formatTurkishTime(event.time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{event.venues?.name}, {event.cities?.name}</span>
            </div>
          </div>

          {event.description && (
            <p className="mt-6 text-foreground/80 leading-relaxed">{event.description}</p>
          )}

          {/* RSVP Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-display text-xl">Katılım Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{totalAttendees}</span> toplam katılımcı
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{attendingRsvps.length}</span> katılıyor
                </div>
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-destructive" />
                  <span className="font-semibold">{notAttendingRsvps.length}</span> katılmıyor
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  variant={myRsvp?.status === "attending" ? "default" : "outline"}
                  onClick={() => handleRsvp("attending")}
                >
                  Katılıyorum
                </Button>
                <Button
                  variant={myRsvp?.status === "not_attending" ? "destructive" : "outline"}
                  onClick={() => handleRsvp("not_attending")}
                >
                  Katılmıyorum
                </Button>
                {myRsvp?.status === "attending" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Misafir:</span>
                    <Input
                      type="number"
                      min={0}
                      value={guestCount}
                      onChange={(e) => updateGuestCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-display text-xl">Katılımcı Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              {rsvps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz katılım kaydı yok.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">Misafir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rsvps.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.profiles?.first_name} {r.profiles?.last_name}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "attending" ? "default" : "secondary"}>
                            {r.status === "attending" ? "Katılıyor" : "Katılmıyor"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{r.guest_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
