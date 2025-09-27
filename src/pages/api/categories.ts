import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { ICategory } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    
    res.status(200).json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // TODO: Add proper admin authentication check
    // For now, allow category creation (should be restricted to admin in production)

    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category name is required' 
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category already exists' 
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      icon: icon || '🎉',
      color: color || '#4F46E5'
    });

    await category.save();

    res.status(201).json({ 
      success: true, 
      data: category,
      message: 'Category created successfully' 
    });

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create category' 
    });
  }
}