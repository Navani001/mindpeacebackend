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
  fastify.get("/consultants", {
    schema: {
      tags: ["Bookings"],
      summary: "List consultants",
      description: "Return consultants available for booking.",
    },
  }, GetConsultantsController);

  // Student: create a booking request
  fastify.post("/", { 
    preHandler: [fastify.authenticate],
    schema: {
      tags: ["Bookings"],
      summary: "Create booking request",
      description: "Create a new booking request for the authenticated student.",
      security: [{ bearerAuth: [] }],
    },
  }, CreateBookingController);

  // Student: get their own bookings
  fastify.get("/my", { 
    preHandler: [fastify.authenticate],
    schema: {
      tags: ["Bookings"],
      summary: "Get student bookings",
      description: "Return bookings for the authenticated student.",
      security: [{ bearerAuth: [] }],
    },
  }, GetStudentBookingsController);

  // Consultant: get bookings for their account
  fastify.get("/consultant", { 
    preHandler: [fastify.authenticate],
    schema: {
      tags: ["Bookings"],
      summary: "Get consultant bookings",
      description: "Return bookings assigned to the authenticated consultant.",
      security: [{ bearerAuth: [] }],
    },
  }, GetConsultantBookingsController);

  // Consultant: accept or reject a booking
  fastify.patch("/:bookingId/status", { 
    preHandler: [fastify.authenticate],
    schema: {
      tags: ["Bookings"],
      summary: "Update booking status",
      description: "Accept or reject a booking request.",
      security: [{ bearerAuth: [] }],
    },
  }, UpdateBookingStatusController);

  // Consultant: send a note to the student
  fastify.patch("/:bookingId/note", { 
    preHandler: [fastify.authenticate],
    schema: {
      tags: ["Bookings"],
      summary: "Update consultant note",
      description: "Add or update a consultant note on a booking.",
      security: [{ bearerAuth: [] }],
    },
  }, UpdateConsultantNoteController);
}
