import { useState, useCallback } from 'react';

const SALES_SYSTEM_PROMPT = `You are Nexus, an elite AI sales assistant for a B2B SaaS company called "VelocityHQ" that sells CRM + revenue intelligence software. Your personality: confident, warm, consultative, never pushy. You help prospects discover the right plan, schedule demos, answer product questions, and capture qualified leads.

RESPONSE RULES:
1. Keep responses concise and punchy (max 3 paragraphs or 5 bullets)
2. Do not use emojis in your responses.
3. Detect buying intent keywords: "pricing", "demo", "trial", "buy", "upgrade" → always respond with a relevant CTA
4. When user provides their email/company, acknowledge it warmly and say you've noted it in the system
5. Product info: VelocityHQ has 3 plans: Starter ($49/mo), Pro ($149/mo), Enterprise (custom). Main features: AI deal scoring, pipeline analytics, email automation, Slack integration, Salesforce sync
6. If asked something outside sales scope, gently redirect to your capabilities

You speak in a professional yet approachable tone. Never use excessive formatting or overly long responses.`;

const fallbackResponses = {
  pricing: "Great question! VelocityHQ offers three plans tailored to different team sizes:\n\n- **Starter** — $49/mo: Perfect for small teams (5 seats, 500 contacts, basic pipeline)\n- **Pro** — $149/mo: Our most popular! (25 seats, AI deal scoring, pipeline forecasting)\n- **Enterprise** — Custom pricing: Unlimited everything + dedicated CSM\n\nWould you like me to help you figure out which plan is the best fit? Or I can schedule a personalized demo for you!",
  demo: "I'd love to set up a demo for you!\n\nOur product demos typically run 30-60 minutes and cover:\n- Live pipeline management walkthrough\n- AI deal scoring in action\n- Custom reporting & analytics\n- Integration setup (Salesforce, Slack, etc.)\n\nYou can head over to the **Schedule** tab to pick a time that works, or just tell me your preferred date and I'll get it logged!",
  features: "VelocityHQ is built to supercharge your sales team! Here's what makes us different:\n\n● **AI Deal Scoring** — Automatically prioritize your hottest opportunities\n● **Pipeline Analytics** — Real-time forecasting and revenue intelligence\n● **Email Automation** — Smart sequences that convert\n● **Integrations** — Salesforce, Slack, HubSpot, and 50+ more\n● **Custom Reports** — Build exactly the dashboards you need\n\nWant to dive deeper into any of these? Or shall I set up a demo?",
  trial: "Absolutely! You can start a **14-day free trial** of our Pro plan — no credit card required.\n\nYou'll get access to:\n- AI deal scoring\n- Pipeline forecasting\n- Email sequences\n- All integrations\n\nJust head to the Products tab and click **Start Free Trial**, or I can help you get set up right here!",
  competitor: "I appreciate your honesty! While I can't speak to what competitors offer, I can share why 2,400+ revenue teams chose VelocityHQ:\n\n- **40% faster deal cycles** on average\n- **AI that actually works** — our deal scoring is 94% accurate\n- **White-glove onboarding** — we don't just sell, we partner\n\nWould it help if I connected you with a customer in your industry who can share their experience?",
  default: "Thanks for reaching out! I'm here to help with anything related to VelocityHQ. I can:\n\n- Walk you through our **product plans**\n- Help you find the right **pricing**\n- Schedule a **personalized demo**\n- Answer **technical questions**\n- Help you **get started** with a trial\n\nWhat would be most helpful for you right now?",
  negative: "I hear you, and I appreciate your candor. \n\nI want to make sure we're addressing your concerns properly. Would it help to:\n\n1. **Chat with a senior account executive** who can offer flexible solutions?\n2. **See a custom ROI analysis** based on your team's specific needs?\n3. **Explore a pilot program** with reduced commitment?\n\nYour satisfaction matters more than any sale. Let me know how I can help.",
  greeting: "Hey! Welcome back! How can I help you today?\n\nQuick options:\n- **View Products** — explore our plans\n- **Get Pricing** — find the right fit\n- **Book a Demo** — see VelocityHQ in action\n\nOr just ask me anything!",
};

function detectIntent(message) {
  const lower = message.toLowerCase();
  if (/pric|cost|how much|plans|subscription|billing/.test(lower)) return 'pricing';
  if (/demo|demonstration|show me|walkthrough|meeting/.test(lower)) return 'demo';
  if (/feature|capability|what can|what does|integrat/.test(lower)) return 'features';
  if (/trial|free|try|test|start/.test(lower)) return 'trial';
  if (/competitor|alternative|salesforce|hubspot|compare/.test(lower)) return 'competitor';
  if (/too expensive|not interested|cancel|don't|won't|competitor|going with/.test(lower)) return 'negative';
  if (/^(hi|hey|hello|howdy|good morning|good afternoon)/.test(lower)) return 'greeting';
  return 'default';
}

function detectStage(message, currentStage) {
  const lower = message.toLowerCase();
  const stages = ['Awareness', 'Discovery', 'Evaluation', 'Intent', 'Closing', 'Scheduled'];
  const currentIdx = stages.indexOf(currentStage);

  if (/pric|plans|cost|how much/.test(lower) && currentIdx < 2) return 'Evaluation';
  if (/demo|schedule|meeting|call/.test(lower) && currentIdx < 5) return 'Scheduled';
  if (/buy|purchase|sign up|trial|start|upgrade/.test(lower) && currentIdx < 4) return 'Intent';
  if (/feature|product|what|how|integrat/.test(lower) && currentIdx < 1) return 'Discovery';
  if (/contract|proposal|deal|agree|close/.test(lower) && currentIdx < 4) return 'Closing';

  return currentStage;
}

export function useGroqAPI() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (messages, apiKey, leadProfile = null, stage = 'Awareness', onChunk = null) => {
    setIsLoading(true);

    try {
      if (apiKey) {
        const systemPrompt = `${SALES_SYSTEM_PROMPT}\n\nCONTEXT:\n- Lead Profile: ${leadProfile ? JSON.stringify(leadProfile) : 'Unknown visitor'}\n- Conversation Stage: ${stage}`;

        const apiMessages = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role, content: m.content }));

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 1000,
            messages: [
              { role: 'system', content: systemPrompt },
              ...apiMessages
            ],
            stream: !!onChunk,
          }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        if (onChunk) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let done = false;
          let accumulatedText = "";
          let buffer = "";

          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              buffer += decoder.decode(value, { stream: !done });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (trimmed === "data: [DONE]") continue;
                if (trimmed.startsWith("data: ")) {
                  try {
                    const jsonStr = trimmed.slice(6);
                    const data = JSON.parse(jsonStr);
                    const content = data.choices?.[0]?.delta?.content || "";
                    if (content) {
                      accumulatedText += content;
                      onChunk(accumulatedText);
                    }
                  } catch (e) {
                    console.warn("Failed to parse SSE line:", trimmed, e);
                  }
                }
              }
            }
          }
          setIsLoading(false);
          return accumulatedText;
        } else {
          const data = await response.json();
          setIsLoading(false);
          return data.choices?.[0]?.message?.content || fallbackResponses.default;
        }
      }

      // Fallback: use keyword-based responses
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const intent = lastUserMsg ? detectIntent(lastUserMsg.content) : 'default';

      setIsLoading(false);
      return fallbackResponses[intent] || fallbackResponses.default;
    } catch (error) {
      setIsLoading(false);
      console.error('Groq API error:', error);

      // Fallback on error
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const intent = lastUserMsg ? detectIntent(lastUserMsg.content) : 'default';
      return fallbackResponses[intent] || fallbackResponses.default;
    }
  }, []);

  return { sendMessage, isLoading, detectStage };
}
