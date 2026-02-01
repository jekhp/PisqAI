// Summarizes conversation history to provide users with a quick recap of past interactions.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeConversationHistoryInputSchema = z.object({
  conversationHistory: z.string().describe('The complete history of the conversation to be summarized.'),
});

export type SummarizeConversationHistoryInput = z.infer<typeof SummarizeConversationHistoryInputSchema>;

const SummarizeConversationHistoryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the conversation history.'),
});

export type SummarizeConversationHistoryOutput = z.infer<typeof SummarizeConversationHistoryOutputSchema>;

export async function summarizeConversationHistory(
  input: SummarizeConversationHistoryInput
): Promise<SummarizeConversationHistoryOutput> {
  return summarizeConversationHistoryFlow(input);
}

const summarizeConversationHistoryPrompt = ai.definePrompt({
  name: 'summarizeConversationHistoryPrompt',
  input: {schema: SummarizeConversationHistoryInputSchema},
  output: {schema: SummarizeConversationHistoryOutputSchema},
  prompt: `Summarize the following conversation history, providing a concise recap of the main points and topics discussed:\n\n{{conversationHistory}}`,
});

const summarizeConversationHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeConversationHistoryFlow',
    inputSchema: SummarizeConversationHistoryInputSchema,
    outputSchema: SummarizeConversationHistoryOutputSchema,
  },
  async input => {
    const {output} = await summarizeConversationHistoryPrompt(input);
    return output!;
  }
);
