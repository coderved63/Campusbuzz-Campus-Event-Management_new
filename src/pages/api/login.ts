import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken } from '@/lib/auth';
import { LoginRequest, ApiResponse, IUser } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IUser>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const userDoc = await User.findOne({ email });

    if (!userDoc) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const passOk = comparePassword(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }

    const token = generateToken({
      email: userDoc.email,
      id: userDoc._id,
      isAdmin: userDoc.isAdmin
    });

    const user: IUser = {
      _id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      password: '', // Don't send password back
      isAdmin: userDoc.isAdmin,
    };

    // Set cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`);
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}