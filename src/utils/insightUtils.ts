
import { Clock, Brain, BellRing, Calendar, Heart } from "lucide-react";

export interface Insight {
  id: number | string;
  date: Date | string;
  title: string;
  description: string;
  type: string;
  priority: string;
  genderSpecific?: boolean;
}

export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-blue-500';
  }
};

export const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'sleep':
      return Clock;
    case 'productivity':
      return Brain;
    case 'health':
      return BellRing;
    case 'balance':
      return Calendar;
    case 'cycle':
      return Heart;
    default:
      return Brain;
  }
};

export const formatDate = (date: Date | string) => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
};

// Regex patterns for schedule extraction
export const timePattern = /\b([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])\s*(am|pm|AM|PM)?\b|\b([0-9]|0[0-9]|1[0-9]|2[0-3])([0-5][0-9])\s*(am|pm|AM|PM)?\b/g;
export const datePattern = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g;
export const weekdayPattern = /\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)\b/g;
export const shiftPattern = /\b(?:shift|duty|work hours|schedule)\b/gi;

// Function to convert 12-hour time format to 24-hour format
export const convertTo24Hour = (timeStr: string): string => {
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  
  // Remove am/pm and any spaces
  const time = timeStr.replace(/\s*(am|pm)\s*/i, '').trim();
  
  if (time.includes(':')) {
    // Time is in format hh:mm
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);
    
    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  } else {
    // Time is in format hhmm
    let hour, minute;
    if (time.length === 4) {
      hour = parseInt(time.substring(0, 2), 10);
      minute = time.substring(2, 4);
    } else {
      hour = parseInt(time.substring(0, 1), 10);
      minute = time.substring(1, 3);
    }
    
    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
};

// Function to parse a date string into a Date object
export const parseDate = (dateStr: string): Date | null => {
  // Try to parse using Date.parse
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  
  // Try common date formats (MM/DD/YYYY, DD/MM/YYYY, etc.)
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    // Try MM/DD/YYYY
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10) < 100 
      ? 2000 + parseInt(parts[2], 10) 
      : parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try DD/MM/YYYY
    const month2 = parseInt(parts[1], 10) - 1;
    const day2 = parseInt(parts[0], 10);
    const date2 = new Date(year, month2, day2);
    if (!isNaN(date2.getTime())) {
      return date2;
    }
  }
  
  return null;
};
