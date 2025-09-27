import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'bsbsfbrnsftentwnnwnwn';
const BCRYPT_SALT = 10;

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, BCRYPT_SALT);
};

export const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getUserFromToken = (req: NextApiRequest): any => {
  try {
    const token = req.cookies.token;
    if (!token) return null;
    
    return verifyToken(token);
  } catch (error) {
    return null;
  }
};