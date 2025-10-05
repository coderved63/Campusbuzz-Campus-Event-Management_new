import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'bsbsfbrnsftentwnnwnwn';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_campusbuzz';
const BCRYPT_SALT = 10;

// Token expiry times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
  id: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, BCRYPT_SALT);
};

export const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const generateTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Legacy function for backward compatibility
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

// Legacy function for backward compatibility
export const verifyToken = (token: string): any => {
  return verifyAccessToken(token);
};

export const getUserFromToken = (req: NextApiRequest): JWTPayload | null => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    
    return verifyAccessToken(token);
  } catch (error) {
    return null;
  }
};

export const setTokenCookies = (res: NextApiResponse, accessToken: string, refreshToken: string) => {
  // Set access token cookie (15 minutes)
  res.setHeader('Set-Cookie', [
    `token=${accessToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=900`, // 15 minutes
    `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800` // 7 days
  ]);
};

export const clearTokenCookies = (res: NextApiResponse) => {
  res.setHeader('Set-Cookie', [
    'token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0',
    'refreshToken=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
  ]);
};

// Middleware to protect API routes
export const requireAuth = (handler: (req: NextApiRequest, res: NextApiResponse, user: JWTPayload) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    return handler(req, res, user);
  };
};

// Middleware to protect admin-only API routes
export const requireAdmin = (handler: (req: NextApiRequest, res: NextApiResponse, user: JWTPayload) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }
    
    return handler(req, res, user);
  };
};