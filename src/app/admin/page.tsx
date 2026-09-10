"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

interface Booking {
  id: string;
  bookingCode: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalAmount: number;
  room: { number: string; roomType: { name: string } };
}

interface Room {
  id: string;
  number: string;
  floor: number;
  status: string;
  roomType: { name: string; basePrice: number };
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tab, setTab] = useState<"bookings" | "rooms">("bookings");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [bRes, rRes] = await Promise.all([fetch("/api/bookings"), fetch("/api/rooms")]);
      const bData = await bRes.json();
      const rData = await rRes.json();
      setBookings(Array.isArray(bData) ? bData : []);
      setRooms(Array.isArray(rData) ? rData : []);
    } catch {
      setMessage("Failed to load data. Database may not be set up yet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateBookingStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      setMessage(`Booking updated to ${status}`);
      loadData();
    } catch {
      setMessage("Failed to update booking");
    }
  }

  async function updateRoomStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      setMessage("Room status updated");
      loadData();
    } catch {
      setMessage("Failed to update room");
    }
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    CHECKED_IN: "bg-green-100 text-green-800",
    CHECKED_OUT: "bg-slate-100 text-slate-800",
    CANCELLED: "bg-red-100 text-red-800",
    AVAILABLE: "bg-green-100 text-green-800",
    OCCUPIED: "bg-orange-100 text-orange-800",
    MAINTENANCE: "bg-red-100 text-red-800",
    CLEANING: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Manage bookings and rooms</p>
        </div>
        <button onClick={loadData} className="btn-secondary">Refresh</button>
      </div>

      {message && (
        <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        <button onClick={() => setTab("bookings")} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "bookings" ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500"}`}>
          Bookings ({bookings.length})
        </button>
        <button onClick={() => setTab("rooms")} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "rooms" ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500"}`}>
          Rooms ({rooms.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading...</div>
      ) : tab === "bookings" ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No bookings yet</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingCode}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.guestName}</div>
                      <div className="text-xs text-slate-500">{b.guestEmail}</div>
                    </td>
                    <td className="px-4 py-3">{b.room.number} · {b.room.roomType.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(new Date(b.checkIn), "MMM d")} → {format(new Date(b.checkOut), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 font-medium">${b.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[b.status] || "bg-slate-100"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {b.status === "CONFIRMED" && (
                          <button onClick={() => updateBookingStatus(b.id, "CHECKED_IN")} className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Check-in</button>
                        )}
                        {b.status === "CHECKED_IN" && (
                          <button onClick={() => updateBookingStatus(b.id, "CHECKED_OUT")} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800">Check-out</button>
                        )}
                        {["PENDING", "CONFIRMED"].includes(b.status) && (
                          <button onClick={() => updateBookingStatus(b.id, "CANCELLED")} className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Room {room.number}</h3>
                  <p className="text-sm text-slate-600">Floor {room.floor} · {room.roomType.name}</p>
                  <p className="mt-1 text-sm font-medium">${room.roomType.basePrice}/night</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[room.status] || "bg-slate-100"}`}>
                  {room.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE"].map((s) => (
                  <button key={s} onClick={() => updateRoomStatus(room.id, s)} disabled={room.status === s} className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-40">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-slate-50 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Demo credentials</p>
        <p>Admin: admin@hotel.com / admin123</p>
      </div>
    </div>
  );
}
