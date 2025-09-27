import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse, IUser } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IUser | null>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const userData = getUserFromToken(req);
    
    if (!userData) {
      return res.status(200).json({ success: true, data: null });
    }

    const user = await User.findById(userData.id).select('-password');
    
    if (!user) {
      return res.status(200).json({ success: true, data: null });
    }

    const userResponse: IUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: '',
      isAdmin: user.isAdmin,
    };

    res.status(200).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}