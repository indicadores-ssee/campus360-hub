import { timingSafeEqual } from 'node:crypto';

export function verifyRefreshSecret(request: Request): boolean {
  const secret = process.env.REFRESH_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;

  const token = auth.slice('Bearer '.length).trim();

  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(secret);
  if (tokenBuffer.length !== secretBuffer.length) return false;

  return timingSafeEqual(tokenBuffer, secretBuffer);
}
