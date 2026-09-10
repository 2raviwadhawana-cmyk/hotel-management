import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@hotel.com",
      name: "Hotel Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const guestPassword = await bcrypt.hash("guest123", 10);
  await prisma.user.create({
    data: {
      email: "guest@example.com",
      name: "John Guest",
      password: guestPassword,
      role: "GUEST",
    },
  });

  const standard = await prisma.roomType.create({
    data: {
      name: "Standard Room",
      description: "Comfortable room with essential amenities, perfect for solo travelers or couples.",
      basePrice: 89,
      capacity: 2,
      amenities: JSON.stringify(["WiFi", "TV", "AC", "Private Bathroom"]),
      imageUrl: "/rooms/standard.jpg",
    },
  });

  const deluxe = await prisma.roomType.create({
    data: {
      name: "Deluxe Room",
      description: "Spacious room with premium furnishings, city view and enhanced comfort.",
      basePrice: 149,
      capacity: 3,
      amenities: JSON.stringify(["WiFi", "Smart TV", "AC", "Mini Bar", "Work Desk", "City View"]),
      imageUrl: "/rooms/deluxe.jpg",
    },
  });

  const suite = await prisma.roomType.create({
    data: {
      name: "Executive Suite",
      description: "Luxurious suite with separate living area, perfect for families or extended stays.",
      basePrice: 249,
      capacity: 4,
      amenities: JSON.stringify([
        "WiFi", "Smart TV", "AC", "Mini Bar", "Living Room", "Bathtub", "Balcony", "Kitchenette",
      ]),
      imageUrl: "/rooms/suite.jpg",
    },
  });

  const roomsData = [
    { number: "101", floor: 1, roomTypeId: standard.id },
    { number: "102", floor: 1, roomTypeId: standard.id },
    { number: "103", floor: 1, roomTypeId: standard.id },
    { number: "104", floor: 1, roomTypeId: standard.id },
    { number: "201", floor: 2, roomTypeId: deluxe.id },
    { number: "202", floor: 2, roomTypeId: deluxe.id },
    { number: "203", floor: 2, roomTypeId: deluxe.id },
    { number: "301", floor: 3, roomTypeId: suite.id },
    { number: "302", floor: 3, roomTypeId: suite.id },
  ];

  for (const r of roomsData) {
    await prisma.room.create({ data: r });
  }

  console.log("Seed completed");
  console.log("Admin: admin@hotel.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
