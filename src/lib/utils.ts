import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function validateNumber(value: string): {
  isValid: boolean;
  error?: string;
} {
  if (!value.trim()) {
    return { isValid: false, error: "La valeur ne peut pas être vide" };
  }

  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return { isValid: false, error: "Veuillez entrer un nombre valide" };
  }

  if (!isFinite(numericValue)) {
    return { isValid: false, error: "Le nombre doit être fini" };
  }

  // Add reasonable bounds to prevent extreme values
  if (numericValue > 1000000) {
    return {
      isValid: false,
      error: "La valeur ne peut pas dépasser 1,000,000",
    };
  }

  if (numericValue < -1000000) {
    return {
      isValid: false,
      error: "La valeur ne peut pas être inférieure à -1,000,000",
    };
  }

  // Check for too many decimal places
  const decimalPlaces = value.split(".")[1]?.length || 0;
  if (decimalPlaces > 6) {
    return { isValid: false, error: "Maximum 6 décimales autorisées" };
  }

  return { isValid: true };
}

// Add rate limiting utility
export function createRateLimiter(maxAttempts: number, timeWindow: number) {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + timeWindow });
      return false;
    }

    if (attempt.count >= maxAttempts) {
      return true;
    }

    attempt.count++;
    return false;
  };
}
