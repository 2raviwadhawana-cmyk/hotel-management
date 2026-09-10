import { prisma } from "./prisma";
import { addDays, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";

export async function isRoomAvailable(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const overlapping = await prisma.booking.findFirst({
    where: {
      roomId,
      status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      AND: [
        { checkIn: { lt: checkOut } },
        { checkOut: { gt: checkIn } },
      ],
    },
  });

  return !overlapping;
}

export async function findAvailableRooms(
  checkIn: Date,
  checkOut: Date,
  roomTypeId?: string,
  guests?: number
) {
  const rooms = await prisma.room.findMany({
    where: {
      status: { in: ["AVAILABLE", "CLEANING"] },
      ...(roomTypeId ? { roomTypeId } : {}),
      ...(guests
        ? {
            roomType: {
              capacity: { gte: guests },
            },
          }
        : {}),
    },
    include: {
      roomType: true,
      bookings: {
        where: {
          status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
          AND: [
            { checkIn: { lt: checkOut } },
            { checkOut: { gt: checkIn } },
          ],
        },
      },
    },
  });

  return rooms.filter((r) => r.bookings.length === 0);
}

export function generateBookingCode(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HTL-${y}${m}${d}-${rand}`;
}

export function calculateStay(
  checkIn: Date,
  checkOut: Date,
  basePrice: number
): { nights: number; total: number } {
  const nights = Math.max(
    1,
    Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );
  return {
    nights,
    total: nights * basePrice,
  };
}

export { addDays, isBefore, isAfter, startOfDay, endOfDay };
