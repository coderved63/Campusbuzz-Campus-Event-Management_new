import type { NextApiRequest, NextApiResponse } from 'next';
import { clearTokenCookies } from '@/lib/auth';
import { ApiResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<null>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Clear authentication cookies
    clearTokenCookies(res);
    
    res.status(200).json({ 
      success: true, 
      data: null,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}