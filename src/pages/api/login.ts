import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateTokens, setTokenCookies } from '@/lib/auth';
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
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const passOk = comparePassword(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens({
      id: userDoc._id.toString(),
      email: userDoc.email,
      isAdmin: userDoc.isAdmin
    });

    const user: IUser = {
      _id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      password: '', // Don't send password back
      isAdmin: userDoc.isAdmin,
    };

    // Set secure cookies with both tokens
    setTokenCookies(res, accessToken, refreshToken);
    
    res.status(200).json({ 
      success: true, 
      data: user,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}