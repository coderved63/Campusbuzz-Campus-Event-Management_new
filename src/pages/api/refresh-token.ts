import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyRefreshToken, generateTokens, setTokenCookies } from '@/lib/auth';
import { ApiResponse, IUser } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IUser>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Refresh token not found' 
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid refresh token' 
      });
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    });

    const userResponse: IUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: '',
      isAdmin: user.isAdmin,
    };

    // Set new cookies
    setTokenCookies(res, accessToken, newRefreshToken);
    
    res.status(200).json({ 
      success: true, 
      data: userResponse,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}