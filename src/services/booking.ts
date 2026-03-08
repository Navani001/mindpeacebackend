import prisma from "../lib/prisma";

// ── Student: create a booking request ────────────────────────────────────────
export async function CreateBooking(
  studentId: number,
  data: { consultantId: number; date: string; time: string; topic: string; message?: string; meetingType?: "online" | "offline" }
) {
  const consultant = await prisma.user.findFirst({
    where: { id: data.consultantId, role: "consultant", isDeleted: false },
  });
  if (!consultant) return { error: "Consultant not found" };

  const booking = await prisma.booking.create({
    data: {
      studentId,
      consultantId: data.consultantId,
      date: data.date,
      time: data.time,
      topic: data.topic,
      message: data.message ?? null,
      meetingType: data.meetingType ?? "online",
      status: "pending",
    },
    include: { consultant: { select: { id: true, name: true, email: true } } },
  });
  return { booking };
}

// ── Student: get their own bookings ──────────────────────────────────────────
export async function GetStudentBookings(studentId: number) {
  const bookings = await prisma.booking.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: { consultant: { select: { id: true, name: true, email: true } } },
  });
  return { bookings };
}

// ── Consultant: get bookings assigned to them ─────────────────────────────────
export async function GetConsultantBookings(consultantId: number) {
  const bookings = await prisma.booking.findMany({
    where: { consultantId },
    orderBy: { createdAt: "desc" },
    include: { student: { select: { id: true, name: true, email: true } } },
  });
  return { bookings };
}

// ── Consultant: send a note to student after accepting ───────────────────────
export async function UpdateConsultantNote(
  bookingId: string,
  consultantId: number,
  consultantNote: string
) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, consultantId, status: "accepted" },
  });
  if (!booking) return { error: "Booking not found or not accepted" };

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { consultantNote },
    include: { student: { select: { id: true, name: true, email: true } } },
  });
  return { booking: updated };
}

// ── Consultant: accept or reject a booking ────────────────────────────────────
export async function UpdateBookingStatus(
  bookingId: string,
  consultantId: number,
  status: "accepted" | "rejected"
) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, consultantId },
  });
  if (!booking) return { error: "Booking not found" };
  if (booking.status !== "pending")
    return { error: "Only pending bookings can be updated" };

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { student: { select: { id: true, name: true, email: true } } },
  });
  return { booking: updated };
}

// ── List all consultants (for student booking form) ───────────────────────────
export async function GetConsultants() {
  const consultants = await prisma.user.findMany({
    where: { role: "consultant", isDeleted: false },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return { consultants };
}
