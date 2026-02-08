/**
 * Generates a random 6-character invite code.
 * Uses uppercase letters and numbers (no ambiguous chars like 0/O, 1/I/L).
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
