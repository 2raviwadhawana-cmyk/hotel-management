import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBookingCode, calculateStay, isRoomAvailable } from "@/lib/booking";
import { z } from "zod";

const bookingSchema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().int().min(1).max(10),
  children: z.number().int().min(0).max(10).default(0),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  specialReq: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
      include: { roomType: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.booking.findFirst({
        where: {
          roomId: data.roomId,
          status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
          AND: [
            { checkIn: { lt: checkOut } },
            { checkOut: { gt: checkIn } },
          ],
        },
      });

      if (overlapping) {
        throw new Error("ROOM_UNAVAILABLE");
      }

      const { nights, total } = calculateStay(checkIn, checkOut, room.roomType.basePrice);
      const bookingCode = generateBookingCode();

      const booking = await tx.booking.create({
        data: {
          bookingCode,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone || null,
          checkIn,
          checkOut,
          adults: data.adults,
          children: data.children,
          totalAmount: total,
          status: "CONFIRMED",
          specialReq: data.specialReq || null,
          roomId: data.roomId,
        },
        include: {
          room: { include: { roomType: true } },
        },
      });

      return booking;
    });

    return NextResponse.json({
      success: true,
      bookingCode: result.bookingCode,
      booking: result,
    });
  } catch (error: any) {
    if (error.message === "ROOM_UNAVAILABLE") {
      return NextResponse.json(
        { error: "Sorry, this room was just booked by someone else. Please choose another." },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (code) {
      const booking = await prisma.booking.findUnique({
        where: { bookingCode: code },
        include: { room: { include: { roomType: true } } },
      });
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json(booking);
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { room: { include: { roomType: true } } },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
