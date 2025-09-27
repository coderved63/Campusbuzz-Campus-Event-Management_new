import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ICategory } from '@/types';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  className = '',
  placeholder = 'Select a category',
  required = false
}) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data || []);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    onCategoryChange(categoryName);
    setIsOpen(false);
  };

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
          <div className="h-5 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 text-left border rounded-md shadow-sm 
          bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
          focus:ring-indigo-500 focus:border-indigo-500
          ${selectedCategory ? 'border-gray-300' : 'border-gray-300'}
          ${required && !selectedCategory ? 'border-red-300' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedCategoryData ? (
              <>
                <span className="text-lg">{selectedCategoryData.icon}</span>
                <span className="text-gray-900">{selectedCategoryData.name}</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {categories.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No categories available
            </div>
          ) : (
            <>
              {!required && (
                <button
                  type="button"
                  onClick={() => handleCategorySelect('')}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-500 text-sm border-b border-gray-100"
                >
                  Clear selection
                </button>
              )}
              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => handleCategorySelect(category.name)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2
                    ${selectedCategory === category.name ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'}
                  `}
                >
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {category.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CategorySelector;