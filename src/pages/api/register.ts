import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
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

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}