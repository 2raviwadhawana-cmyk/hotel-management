"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, addDays } from "date-fns";

interface RoomType {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  amenities: string;
}

interface AvailableRoom {
  id: string;
  number: string;
  floor: number;
  roomType: RoomType;
}

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedType = searchParams.get("type") || "";

  const [checkIn, setCheckIn] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 3), "yyyy-MM-dd"));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomTypeId, setRoomTypeId] = useState(preselectedType);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialReq, setSpecialReq] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [bookingCode, setBookingCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rooms/types")
      .then((r) => r.json())
      .then((data) => setRoomTypes(Array.isArray(data) ? data : []))
      .catch(() => setRoomTypes([]));
  }, []);

  async function searchAvailability() {
    setSearching(true);
    setMessage(null);
    setAvailableRooms([]);
    setSelectedRoomId("");
    try {
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        adults: String(adults + children),
      });
      if (roomTypeId) params.set("roomTypeId", roomTypeId);

      const res = await fetch(`/api/rooms/available?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setAvailableRooms(data);
      if (data.length === 0) {
        setMessage({ type: "error", text: "No rooms available for selected dates." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSearching(false);
    }
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoomId || !guestName || !guestEmail) {
      setMessage({ type: "error", text: "Please fill all required fields and select a room." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoomId,
          checkIn,
          checkOut,
          adults,
          children,
          guestName,
          guestEmail,
          guestPhone,
          specialReq,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setBookingCode(data.bookingCode);
      setMessage({ type: "success", text: `Booking confirmed! Code: ${data.bookingCode}` });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  }

  if (bookingCode) {
    return (
      <div className="mx-auto max-w-lg card text-center">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Booking Confirmed!</h1>
        <p className="mt-2 text-slate-600">Your reservation has been successfully created.</p>
        <div className="mt-6 rounded-lg bg-brand-50 px-4 py-3">
          <p className="text-sm text-brand-700">Booking Code</p>
          <p className="text-2xl font-mono font-bold text-brand-900">{bookingCode}</p>
        </div>
        <button onClick={() => router.push("/")} className="btn-primary mt-6 w-full">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Book a Room</h1>
        <p className="mt-1 text-slate-600">Select dates and find available rooms in real time.</p>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-900">1. Search Availability</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Check-in</label>
            <input type="date" className="input" value={checkIn} min={format(new Date(), "yyyy-MM-dd")} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div>
            <label className="label">Check-out</label>
            <input type="date" className="input" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div>
            <label className="label">Adults</label>
            <input type="number" min={1} max={6} className="input" value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Children</label>
            <input type="number" min={0} max={4} className="input" value={children} onChange={(e) => setChildren(Number(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Room Type (optional)</label>
            <select className="input" value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
              <option value="">Any type</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — ${t.basePrice}/night</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={searchAvailability} disabled={searching} className="btn-primary w-full sm:w-auto">
          {searching ? "Searching..." : "Search Available Rooms"}
        </button>
      </div>

      {availableRooms.length > 0 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">2. Select a Room ({availableRooms.length} available)</h2>
          <div className="space-y-3">
            {availableRooms.map((room) => {
              const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
              const total = nights * room.roomType.basePrice;
              return (
                <label key={room.id} className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${selectedRoomId === room.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="room" value={room.id} checked={selectedRoomId === room.id} onChange={() => setSelectedRoomId(room.id)} className="h-4 w-4 text-brand-600" />
                    <div>
                      <p className="font-medium text-slate-900">Room {room.number} · Floor {room.floor}</p>
                      <p className="text-sm text-slate-600">{room.roomType.name} · Up to {room.roomType.capacity} guests</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${total}</p>
                    <p className="text-xs text-slate-500">{nights} night{nights > 1 ? "s" : ""} × ${room.roomType.basePrice}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {selectedRoomId && (
        <form onSubmit={submitBooking} className="card space-y-4">
          <h2 className="font-semibold text-slate-900">3. Guest Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Full Name *</label>
              <input required className="input" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input required type="email" className="input" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+1 234 567 8900" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Special Requests</label>
              <textarea className="input" rows={3} value={specialReq} onChange={(e) => setSpecialReq(e.target.value)} placeholder="Late check-in, high floor, etc." />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading booking form...</div>}>
      <BookingForm />
    </Suspense>
  );
}
