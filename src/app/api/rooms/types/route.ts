import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const types = await prisma.roomType.findMany({
      orderBy: { basePrice: "asc" },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch room types" }, { status: 500 });
  }
}
