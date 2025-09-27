/**
 * Utility functions for consistent date formatting across the application
 * Prevents hydration errors by ensuring consistent formatting on server and client
 */

/**
 * Formats a date consistently as DD/MM/YYYY
 * @param date - Date object, date string, or timestamp
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDate = (date: Date | string | number): string => {
  const eventDate = date instanceof Date ? date : new Date(date);
  
  // Validate date
  if (isNaN(eventDate.getTime())) {
    return 'Invalid Date';
  }
  
  const day = eventDate.getDate().toString().padStart(2, '0');
  const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
  const year = eventDate.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date with full month name and year
 * @param date - Date object, date string, or timestamp
 * @returns Formatted date string like "January 15, 2025"
 */
export const formatDateFull = (date: Date | string | number): string => {
  const eventDate = date instanceof Date ? date : new Date(date);
  
  // Validate date
  if (isNaN(eventDate.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  // Use a consistent locale to prevent hydration issues
  return eventDate.toLocaleDateString('en-US', options);
};

/**
 * Formats a date with abbreviated month
 * @param date - Date object, date string, or timestamp
 * @returns Formatted date string like "Jan 15, 2025"
 */
export const formatDateShort = (date: Date | string | number): string => {
  const eventDate = date instanceof Date ? date : new Date(date);
  
  // Validate date
  if (isNaN(eventDate.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  // Use a consistent locale to prevent hydration issues
  return eventDate.toLocaleDateString('en-US', options);
};

/**
 * Formats date and time together
 * @param date - Date object, date string, or timestamp
 * @param time - Time string (optional)
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string | number, time?: string): string => {
  const formattedDate = formatDate(date);
  if (time) {
    return `${formattedDate} at ${time}`;
  }
  return formattedDate;
};