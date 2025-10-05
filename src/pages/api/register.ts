import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateTokens, setTokenCookies } from '@/lib/auth';
import { RegisterRequest, ApiResponse, IUser } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IUser>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { name, email, password }: RegisterRequest = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }

    const hashedPassword = hashPassword(password);

    const userDoc = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const user: IUser = {
      _id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      password: '', // Don't send password back
      isAdmin: userDoc.isAdmin,
    };

    // Generate tokens and set cookies for automatic login after registration
    const { accessToken, refreshToken } = generateTokens({
      id: userDoc._id.toString(),
      email: userDoc.email,
      isAdmin: userDoc.isAdmin
    });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({ 
      success: true, 
      data: user,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}