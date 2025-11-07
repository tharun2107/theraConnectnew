/**
 * Utility functions for date formatting
 * Handles timezone issues when displaying dates from the database
 */

/**
 * Extracts the date part (YYYY-MM-DD) from a date string or ISO string
 * This prevents timezone issues by treating dates as date-only values
 */
function extractDatePart(dateString: string | Date): string {
  if (!dateString) return '';
  
  if (typeof dateString === 'string') {
    // If it's already in YYYY-MM-DD format, return it
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // If it's an ISO string (e.g., "2025-11-08T00:00:00.000Z"), extract the date part
    if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      return dateString.split('T')[0];
    }
  } else {
    // If it's a Date object, format it as YYYY-MM-DD
    const year = dateString.getFullYear();
    const month = String(dateString.getMonth() + 1).padStart(2, '0');
    const day = String(dateString.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return '';
}

/**
 * Formats a date string (YYYY-MM-DD) as a local date
 * Adds 1 day to the date to fix timezone display issues
 * 
 * @param dateString - Date string in YYYY-MM-DD format or ISO string
 * @returns Formatted date string
 */
export function formatDateString(dateString: string | Date): string {
  if (!dateString) return '';
  
  // Extract the date part (YYYY-MM-DD) to avoid timezone issues
  const datePart = extractDatePart(dateString);
  if (!datePart) return '';
  
  // Parse as local date to avoid timezone issues
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  // Add 1 day to fix timezone display issue
  date.setDate(date.getDate() + 1);
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats a date string to a simple date format (MM/DD/YYYY)
 * Adds 1 day to the date to fix timezone display issues
 * 
 * @param dateString - Date string in YYYY-MM-DD format or ISO string
 * @returns Formatted date string
 */
export function formatDateSimple(dateString: string | Date): string {
  if (!dateString) return '';
  
  // Extract the date part (YYYY-MM-DD) to avoid timezone issues
  const datePart = extractDatePart(dateString);
  if (!datePart) return '';
  
  // Parse as local date to avoid timezone issues
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  // Add 1 day to fix timezone display issue
  date.setDate(date.getDate() + 1);
  
  return date.toLocaleDateString('en-US');
}

