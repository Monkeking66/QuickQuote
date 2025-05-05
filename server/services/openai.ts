// OpenAI temporarily removed
// import OpenAI from 'openai';
// import { RateLimiter } from 'limiter';

// Stub rate limiter removed for now


interface GenerateQuoteTextParams {
  clientName: string;
  hours: number;
  price: number;
  description: string;
  templateStyle: string;
}

export async function generateQuoteText(params: GenerateQuoteTextParams): Promise<string> {
  // Stub implementation: just return a static string
  return `הצעת מחיר ללקוח ${params.clientName} עבור פרויקט "${params.description}" בסך ${params.price} ש"ח (${params.hours} שעות, סגנון: ${params.templateStyle})`;
}