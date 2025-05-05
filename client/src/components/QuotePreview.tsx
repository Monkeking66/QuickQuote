import React from 'react';
import { Card } from './ui/card';

interface QuotePreviewProps {
  text: string;
}

export function QuotePreview({ text }: QuotePreviewProps) {
  return (
    <Card className="p-6 bg-white">
      <div className="prose prose-sm max-w-none" dir="rtl">
        {text.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </Card>
  );
} 