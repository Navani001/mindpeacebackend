import { FastifyInstance } from "fastify";
import {
  CreateBookingController,
  GetStudentBookingsController,
  GetConsultantBookingsController,
  UpdateBookingStatusController,
  UpdateConsultantNoteController,
  GetConsultantsController,
} from "../controllers/booking";

export async function BookingRoute(fastify: FastifyInstance) {
  // Public: list all consultants (for student booking form)
  fastify.get("/consultants", GetConsultantsController);

  // Student: create a booking request
  fastify.post("/", { preHandler: [fastify.authenticate] }, CreateBookingController);

  // Student: get their own bookings
  fastify.get("/my", { preHandler: [fastify.authenticate] }, GetStudentBookingsController);

  // Consultant: get bookings for their account
  fastify.get("/consultant", { preHandler: [fastify.authenticate] }, GetConsultantBookingsController);

  // Consultant: accept or reject a booking
  fastify.patch("/:bookingId/status", { preHandler: [fastify.authenticate] }, UpdateBookingStatusController);

  // Consultant: send a note to the student
  fastify.patch("/:bookingId/note", { preHandler: [fastify.authenticate] }, UpdateConsultantNoteController);
}
