import { NextRequest, NextResponse } from "next/server";
import { findAvailableRooms } from "@/lib/booking";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkInStr = searchParams.get("checkIn");
    const checkOutStr = searchParams.get("checkOut");
    const roomTypeId = searchParams.get("roomTypeId") || undefined;
    const guests = searchParams.get("adults") ? Number(searchParams.get("adults")) : undefined;

    if (!checkInStr || !checkOutStr) {
      return NextResponse.json({ error: "checkIn and checkOut are required" }, { status: 400 });
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: "checkOut must be after checkIn" }, { status: 400 });
    }

    const rooms = await findAvailableRooms(checkIn, checkOut, roomTypeId, guests);
    const cleaned = rooms.map(({ bookings, ...rest }) => rest);

    return NextResponse.json(cleaned);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to search rooms" }, { status: 500 });
  }
}
