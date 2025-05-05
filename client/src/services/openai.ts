import { apiRequest } from '@/lib/queryClient';

interface GenerateQuoteTextParams {
  clientName: string;
  hours: number;
  price: number;
  description: string;
  templateStyle: string;
}

export async function generateQuoteText(params: GenerateQuoteTextParams): Promise<string> {
  const res = await apiRequest('POST', '/api/openai/generate-quote', params);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to generate quote text');
  }
  return res.json();
} 