import { FastifyRequest, FastifyReply } from "fastify";
import {
  GetProfile,
  UpdateProfile,
  ChangePassword,
  GetTrustNumbers,
  AddTrustNumber,
  DeleteTrustNumber,
} from "../services/settings";

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function GetProfileController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  try {
    const result = await GetProfile(userId);
    if (result.data) return reply.status(200).send({ success: true, ...result });
    return reply.status(404).send({ success: false, message: result.message });
  } catch (err) {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

export async function UpdateProfileController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const body = req.body as { name?: string; email?: string; phoneNumber?: string };
  try {
    const result = await UpdateProfile(userId, body);
    if (result.data) return reply.status(200).send({ success: true, ...result });
    return reply.status(400).send({ success: false, message: result.message });
  } catch (err) {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

export async function ChangePasswordController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const body = req.body as { currentPassword: string; newPassword: string };
  try {
    const result = await ChangePassword(userId, body);
    if (result.data) return reply.status(200).send({ success: true, ...result });
    return reply.status(400).send({ success: false, message: result.message });
  } catch (err) {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

// ─── Trust Numbers ─────────────────────────────────────────────────────────────

export async function GetTrustNumbersController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  try {
    const result = await GetTrustNumbers(userId);
    return reply.status(200).send({ success: true, ...result });
  } catch (err) {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

export async function AddTrustNumberController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const { number } = req.body as { number: string };
  if (!number) return reply.status(400).send({ success: false, message: "number is required" });
  try {
    const result = await AddTrustNumber(userId, number);
    if (result.data) return reply.status(201).send({ success: true, ...result });
    return reply.status(400).send({ success: false, message: result.message });
  } catch (err) {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}

export async function DeleteTrustNumberController(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const { numberId } = req.params as { numberId: string };
  try {
    const result = await DeleteTrustNumber(userId, numberId);
    if (result.data) return reply.status(200).send({ success: true, ...result });
    return reply.status(404).send({ success: false, message: result.message });
  } catch (err) {
    return reply.status(500).send({ success: false, message: "Server error" });
  }
}
