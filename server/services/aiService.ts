import { GoogleGenAI } from '@google/genai';

class AiService {
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key === 'your-ai-key') {
      return null;
    }

    if (!this.client) {
      try {
        this.client = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.warn('[AiService] Could not initialize GoogleGenAI client:', err);
        return null;
      }
    }
    return this.client;
  }

  public isAvailable(): boolean {
    const key = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key !== 'your-ai-key');
  }

  public async generateBusinessAdvisory(params: {
    enterpriseName: string;
    capital: number;
    district: string;
    state: string;
    promoterCategory: string;
  }): Promise<{ advice: string; nextSteps: string[]; isAiGenerated: boolean }> {
    const client = this.getClient();

    if (!client) {
      // Structured, high-value deterministic advisory if AI key is pending
      return {
        isAiGenerated: false,
        advice: `For establishing a ${params.enterpriseName} in ${params.district}, ${params.state} with an available capital of ₹${params.capital.toLocaleString('en-IN')}, the project profile is financially viable under central and state MSME promotion schemes. Prioritize procuring raw materials from local farmer clusters to minimize logistics costs, secure Udyam Aadhaar registration, and submit a formal PMEGP / PMFME application through your local District Industries Center (DIC).`,
        nextSteps: [
          `Register your enterprise on the Udyam portal (udyamregistration.gov.in) with Aadhaar and PAN.`,
          `Obtain commercial electricity connection sanctions for the designated site in ${params.district}.`,
          `Prepare a bankable Detailed Project Report (DPR) adhering to DIC and lead bank guidelines.`,
          `Apply for credit-linked subsidy on the PMEGP or PMFME online national portal.`,
          `Approach the Lead District Bank for formal in-principle term loan sanction.`
        ]
      };
    }

    try {
      const prompt = `You are a senior rural enterprise consultant for GramUdyam in India.
Generate a concise, highly practical business advisory and 5 chronological next steps for an entrepreneur:
- Proposed Enterprise: ${params.enterpriseName}
- Available Capital: ₹${params.capital.toLocaleString('en-IN')}
- Location: ${params.district}, ${params.state}
- Category: ${params.promoterCategory}

Focus strictly on realistic ground realities in India: local raw materials, DIC formalities, PMEGP/PMFME schemes, and bank sanction steps. Return plain text advice with clear actionable points.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const text = response.text || '';
      return {
        isAiGenerated: true,
        advice: text,
        nextSteps: [
          `Finalize site lease / land agreement in ${params.district}.`,
          `Complete online Udyam Registration.`,
          `Submit Project Profile to DIC for subsidy approval under PMEGP/PMFME.`,
          `Apply for formal bank sanction with Lead District Bank.`,
          `Initiate machinery procurement from certified manufacturers.`
        ]
      };
    } catch (error) {
      console.error('[AiService] Error generating advisory:', error);
      return {
        isAiGenerated: false,
        advice: `Enterprise analysis for ${params.enterpriseName} in ${params.district} indicates strong local demand. Work closely with your local District Industries Center to leverage institutional credit schemes.`,
        nextSteps: [
          'Obtain Udyam registration certificate.',
          'Secure machinery quotations from verified suppliers.',
          'Submit scheme application to DIC.'
        ]
      };
    }
  }
}

export const aiService = new AiService();
