import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateBooking,
  GetStudentBookings,
  GetConsultantBookings,
  UpdateBookingStatus,
  UpdateConsultantNote,
  GetConsultants,
} from "../services/booking";

// ── Student: book a meeting ───────────────────────────────────────────────────
export async function CreateBookingController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const body = req.body as {
    consultantId: number;
    date: string;
    time: string;
    topic: string;
    message?: string;
    meetingType?: "online" | "offline";
  };
  try {
    const result = await CreateBooking(userId, body);
    if (result.error) return reply.status(400).send({ success: false, message: result.error });
    return reply.status(201).send({ success: true, data: result });
  } catch (err) {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

// ── Student: list own bookings ────────────────────────────────────────────────
export async function GetStudentBookingsController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  try {
    const result = await GetStudentBookings(userId);
    return reply.status(200).send({ success: true, data: result });
  } catch {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

// ── Consultant: list bookings for themselves ──────────────────────────────────
export async function GetConsultantBookingsController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  try {
    const result = await GetConsultantBookings(userId);
    return reply.status(200).send({ success: true, data: result });
  } catch {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

// ── Consultant: send a note ───────────────────────────────────────────────────
export async function UpdateConsultantNoteController(req: FastifyRequest, reply: FastifyReply) {
  const consultantId = (req.user as { id: number }).id;
  const { bookingId } = req.params as { bookingId: string };
  const { consultantNote } = req.body as { consultantNote: string };
  if (!consultantNote?.trim()) {
    return reply.status(400).send({ success: false, message: "Note cannot be empty" });
  }
  try {
    const result = await UpdateConsultantNote(bookingId, consultantId, consultantNote.trim());
    if (result.error) return reply.status(400).send({ success: false, message: result.error });
    return reply.status(200).send({ success: true, data: result });
  } catch {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

// ── Consultant: accept / reject a booking ─────────────────────────────────────
export async function UpdateBookingStatusController(req: FastifyRequest, reply: FastifyReply) {
  const consultantId = (req.user as { id: number }).id;
  const { bookingId } = req.params as { bookingId: string };
  const { status } = req.body as { status: "accepted" | "rejected" };
  if (!["accepted", "rejected"].includes(status)) {
    return reply.status(400).send({ success: false, message: "Invalid status" });
  }
  try {
    const result = await UpdateBookingStatus(bookingId, consultantId, status);
    if (result.error) return reply.status(400).send({ success: false, message: result.error });
    return reply.status(200).send({ success: true, data: result });
  } catch {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

// ── Public: list consultants ──────────────────────────────────────────────────
export async function GetConsultantsController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await GetConsultants();
    return reply.status(200).send({ success: true, data: result });
  } catch {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}
