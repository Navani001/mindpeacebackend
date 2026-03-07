import prisma from "../lib/prisma";

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function GetProfile(userId: number) {
  if (!userId) return { message: "no userId provided", data: null };
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phoneNumber: true, createdAt: true },
    });
    if (!user) return { message: "User not found", data: null };
    return { message: "Profile fetched", data: { user } };
  } catch (err) {
    console.error("GetProfile error:", err);
    return { message: "Failed to fetch profile", data: null };
  }
}

export async function UpdateProfile(userId: number, data: { name?: string; email?: string; phoneNumber?: string }) {
  if (!userId) return { message: "no userId provided", data: null };
  try {
    if (data.email) {
      const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: userId } } });
      if (existing) return { message: "Email already in use", data: null };
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { ...(data.name && { name: data.name }), ...(data.email && { email: data.email }), phoneNumber: data.phoneNumber ?? undefined },
      select: { id: true, name: true, email: true, phoneNumber: true },
    });
    return { message: "Profile updated", data: { user } };
  } catch (err) {
    console.error("UpdateProfile error:", err);
    return { message: "Failed to update profile", data: null };
  }
}

export async function ChangePassword(userId: number, data: { currentPassword: string; newPassword: string }) {
  if (!userId) return { message: "no userId provided", data: null };
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { message: "User not found", data: null };

    if (user.password !== data.currentPassword) {
      return { message: "Current password is incorrect", data: null };
    }

    await prisma.user.update({ where: { id: userId }, data: { password: data.newPassword } });
    return { message: "Password changed successfully", data: {} };
  } catch (err) {
    console.error("ChangePassword error:", err);
    return { message: "Failed to change password", data: null };
  }
}

// ─── Trust / Emergency Numbers ─────────────────────────────────────────────────

export async function GetTrustNumbers(userId: number) {
  if (!userId) return { message: "no userId provided", data: null };
  try {
    const numbers = await prisma.trustNumber.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return { message: "Trust numbers fetched", data: { numbers } };
  } catch (err) {
    console.error("GetTrustNumbers error:", err);
    return { message: "Failed to fetch trust numbers", data: null };
  }
}

export async function AddTrustNumber(userId: number, number: string) {
  if (!userId) return { message: "no userId provided", data: null };
  try {
    const entry = await prisma.trustNumber.create({ data: { userId, number } });
    return { message: "Trust number added", data: { entry } };
  } catch (err) {
    console.error("AddTrustNumber error:", err);
    return { message: "Failed to add trust number", data: null };
  }
}

export async function DeleteTrustNumber(userId: number, numberId: string) {
  if (!userId) return { message: "no userId provided", data: null };
  try {
    const existing = await prisma.trustNumber.findFirst({ where: { id: numberId, userId } });
    if (!existing) return { message: "Not found", data: null };
    await prisma.trustNumber.delete({ where: { id: numberId } });
    return { message: "Trust number deleted", data: {} };
  } catch (err) {
    console.error("DeleteTrustNumber error:", err);
    return { message: "Failed to delete trust number", data: null };
  }
}
