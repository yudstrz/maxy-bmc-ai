import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { BmcData } from '../../types';

export async function POST(req: Request) {
  try {
    const { bmcData, language }: { bmcData: BmcData; language: 'en' | 'id' } = await req.json();

    if (!bmcData) {
      return NextResponse.json({ error: 'Data BMC tidak valid.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: language === 'en' ? 'OpenAI API Key not configured on the server.' : 'OpenAI API Key belum dikonfigurasi di server.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `
Act as a world-class Business Strategy Consultant and Startup Mentor (e.g., a mix of Alexander Osterwalder, Eric Ries, and a top-tier VC).
Provide a deep, critical, and highly strategic analysis of the following Business Model Canvas:

1. Customer Segments: ${bmcData.customerSegments}
2. Value Proposition (Problem & Unfair Advantage): ${bmcData.valueProposition}
3. Channels: ${bmcData.channels}
4. Customer Relationships: ${bmcData.customerRelationships}
5. Revenue Streams: ${bmcData.revenueStreams}
6. Key Resources: ${bmcData.keyResources}
7. Key Activities: ${bmcData.keyActivities}
8. Key Partnerships: ${bmcData.keyPartnerships}
9. Cost Structure: ${bmcData.costStructure}

Rubric for Quantitative Performance Metrics (Scale 0-100):
- Problem-Solution Fit: [0-30] Hypothetical, [31-60] Early Traction, [61-85] Validated, [86-100] PMF.
- Scalability: [0-30] Linear, [31-60] Limited, [61-85] High, [86-100] Exponential.
- Defensibility (Moat): [0-30] Vulnerable, [31-60] Early Mover, [61-85] Core Competitive Advantage, [86-100] Monopoly/Network Effects.
- Operational Fitness: [0-30] Chaotic, [31-60] Fragile, [61-85] Systematic, [86-100] Automated & Agile.
- External Resilience: [0-30] Fragile, [31-60] Status Quo, [61-85] Adaptive, [86-100] Anti-Fragile.

Consider external forces: Market forces, Industry forces, Key trends (AI disruption, ESG, etc.), and Macroeconomic conditions.

IMPORTANT: Your response MUST be in ${language === 'en' ? 'English' : 'Indonesian'}. 
Analyze the content deeply, looking for logical inconsistencies between blocks (e.g., Value Proposition doesn't match Customer Segments, or Key Activities don't support the Value Proposition).
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'analysisData',
          schema: {
            type: 'object',
            properties: {
              vitalSigns: {
                type: 'object',
                properties: {
                  problemSolutionFit: { type: 'integer', description: 'Score 0-100' },
                  scalability: { type: 'integer', description: 'Score 0-100' },
                  defensibility: { type: 'integer', description: 'Score 0-100' },
                  operationalFitness: { type: 'integer', description: 'Score 0-100' },
                  externalResilience: { type: 'integer', description: 'Score 0-100' }
                },
                required: ['problemSolutionFit', 'scalability', 'defensibility', 'operationalFitness', 'externalResilience'],
                additionalProperties: false
              },
              strengths: {
                type: 'array',
                items: { type: 'string' },
                description: 'Kekuatan utama dari model bisnis ini'
              },
              weaknesses: {
                type: 'array',
                items: { type: 'string' },
                description: 'Kritik dan risiko utama'
              },
              opportunities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Peluang yang bisa dimanfaatkan'
              },
              threats: {
                type: 'array',
                items: { type: 'string' },
                description: 'Ancaman dari luar'
              },
              feedback: {
                type: 'string',
                description: 'Feedback konstruktif dan actionable (Markdown)'
              },
              conclusion: {
                type: 'string',
                description: 'Kesimpulan apakah ide ini layak dijalankan (Go/No-Go) dengan alasan (Markdown)'
              }
            },
            required: ['vitalSigns', 'strengths', 'weaknesses', 'opportunities', 'threats', 'feedback', 'conclusion'],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json({ error: 'Gagal mendapatkan hasil analisa.' }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error: unknown) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server saat menganalisa.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

