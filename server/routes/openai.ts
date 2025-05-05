import { Router } from 'express';
import { generateQuoteText } from '../services/openai';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const generateQuoteSchema = z.object({
  clientName: z.string().min(1, 'נא להזין שם לקוח'),
  hours: z.number().min(1, 'נא להזין מספר שעות'),
  price: z.number().min(0, 'נא להזין מחיר'),
  description: z.string().min(1, 'נא להזין תיאור'),
  templateStyle: z.string().default('professional')
});

router.post('/generate-quote', requireAuth, async (req, res) => {
  try {
    const validatedData = generateQuoteSchema.parse(req.body);
    const generatedText = await generateQuoteText(validatedData);
    res.json(generatedText);
  } catch (error) {
    console.error('Error generating quote text:', error);
    res.status(error instanceof z.ZodError ? 400 : 500).json({
      message: error instanceof Error ? error.message : 'Failed to generate quote text'
    });
  }
});

export default router; 