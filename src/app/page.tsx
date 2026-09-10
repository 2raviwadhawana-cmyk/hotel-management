import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getRoomTypes() {
  try {
    return await prisma.roomType.findMany({
      include: {
        _count: { select: { rooms: true } },
      },
      orderBy: { basePrice: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const roomTypes = await getRoomTypes();

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-8 py-20 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome to Grand Horizon Hotel
          </h1>
          <p className="mt-4 text-lg text-brand-100">
            Experience comfort, elegance, and seamless online booking.
            Real-time availability, secure reservations, and modern hotel management.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/book" className="btn bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 text-base font-semibold">
              Book Your Stay
            </Link>
            <Link href="/admin" className="btn border-2 border-white/40 text-white hover:bg-white/10 px-6 py-3 text-base">
              Staff Portal
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-brand-400/20 blur-3xl" />
      </section>

      <section>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Our Rooms</h2>
          <p className="mt-2 text-slate-600">Choose from our carefully designed accommodations</p>
        </div>

        {roomTypes.length === 0 ? (
          <div className="card text-center text-slate-500">
            <p>No rooms configured yet. Run the database seed after deploying.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((type) => {
              const amenities: string[] = JSON.parse(type.amenities || "[]");
              return (
                <div key={type.id} className="card flex flex-col transition hover:shadow-md">
                  <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-4xl text-slate-400">
                    🛏️
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{type.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-2">{type.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {amenities.slice(0, 4).map((a) => (
                      <span key={a} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{a}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">${type.basePrice}</span>
                      <span className="text-sm text-slate-500"> / night</span>
                    </div>
                    <span className="text-sm text-slate-500">Up to {type.capacity} guests</span>
                  </div>
                  <Link href={`/book?type=${type.id}`} className="btn-primary mt-4 w-full">Book Now</Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          { title: "Real-time Availability", desc: "Instant room inventory checks prevent double bookings.", icon: "📅" },
          { title: "Secure Online Booking", desc: "Simple guest booking flow with confirmation codes.", icon: "🔒" },
          { title: "Staff Dashboard", desc: "Manage rooms, check-ins, and housekeeping from one place.", icon: "🖥️" },
        ].map((f) => (
          <div key={f.title} className="card text-center">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
