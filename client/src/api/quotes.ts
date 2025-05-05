import { apiRequest } from '@/lib/queryClient';
import { InsertQuote, Quote, UpdateQuote } from '@/shared/schema';

export async function createQuote(data: InsertQuote): Promise<Quote> {
  const res = await apiRequest('POST', '/api/quotes', data);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create quote');
  }
  return res.json();
}

export async function updateQuote(id: number, data: UpdateQuote): Promise<Quote> {
  const res = await apiRequest('PATCH', `/api/quotes/${id}`, data);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update quote');
  }
  return res.json();
}

export async function deleteQuote(id: number): Promise<void> {
  const res = await apiRequest('DELETE', `/api/quotes/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete quote');
  }
}

export async function getQuotes(): Promise<Quote[]> {
  const res = await apiRequest('GET', '/api/quotes');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch quotes');
  }
  return res.json();
}

export async function getQuote(id: number): Promise<Quote> {
  const res = await apiRequest('GET', `/api/quotes/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch quote');
  }
  return res.json();
} 