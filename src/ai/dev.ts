import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-conversation-history.ts';
import '@/ai/flows/generate-conversation-starter.ts';
import '@/ai/flows/analyze-sentiment-of-conversation.ts';