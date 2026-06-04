export function analyzeSentiment(message) {
  const lower = message.toLowerCase();

  const positiveWords = ['great', 'interested', 'yes', 'love', 'perfect', "let's", 'amazing', 'awesome',
    'excellent', 'fantastic', 'wonderful', 'absolutely', 'definitely', 'excited', 'impressive',
    'thank', 'thanks', 'appreciate', 'helpful', 'good', 'nice', 'cool', 'agree', 'sounds good',
    'sign up', 'ready', 'want', 'need', 'please', 'sure', 'right'];

  const negativeWords = ['no', 'too expensive', 'not', "don't", 'cancel', 'issue', 'problem',
    'disappointed', 'unhappy', 'frustrated', 'terrible', 'horrible', 'worst', 'awful',
    'competitor', 'alternative', 'leaving', 'going with', 'unsubscribe', 'refund',
    'waste', 'bad', 'poor', 'lacking', "can't", "won't", 'never', 'hate', 'dislike'];

  const urgentWords = ['urgent', 'asap', 'immediately', 'today', 'now', 'deadline', 'critical',
    'emergency', 'right away', 'hurry', 'time-sensitive', 'expiring', 'last chance',
    'as soon as possible', 'rush'];

  const urgentScore = urgentWords.filter(w => lower.includes(w)).length;
  const positiveScore = positiveWords.filter(w => lower.includes(w)).length;
  const negativeScore = negativeWords.filter(w => lower.includes(w)).length;

  if (urgentScore > 0) return 'urgent';
  if (negativeScore > positiveScore && negativeScore > 0) return 'negative';
  if (positiveScore > negativeScore && positiveScore > 0) return 'positive';
  return 'neutral';
}

export const sentimentConfig = {
  positive: { label: 'Positive', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  neutral:  { label: 'Neutral',  color: '#6ba1ff', bg: 'rgba(61,127,255,0.15)' },
  negative: { label: 'Negative', color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
  urgent:   { label: 'Urgent',   color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
};

