import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<boolean>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Clear the cookie
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');
  
  res.status(200).json({ success: true, data: true });
}