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
Berdasarkan Business Model Canvas berikut, buatkan Elevator Pitch yang sangat memukau, persuasif, dan profesional (durasi baca sekitar 30-60 detik).

Data BMC:
- Target Pasar: ${bmcData.customerSegments}
- Masalah & Unfair Advantage: ${bmcData.valueProposition}
- Cara Menjangkau: ${bmcData.channels}
- Hubungan Pelanggan: ${bmcData.customerRelationships}
- Sumber Pendapatan: ${bmcData.revenueStreams}
- Sumber Daya Utama: ${bmcData.keyResources}
- Aktivitas Utama: ${bmcData.keyActivities}
- Mitra Utama: ${bmcData.keyPartnerships}
- Struktur Biaya: ${bmcData.costStructure}

Structure: 1. Hook, 2. Problem, 3. Solution & Unfair Advantage, 4. Impact, 5. Market & Traction, 6. Call to Action.

Tone: Professional, persuasive, and dynamic founder. Use Markdown.
Language: MUST be in ${language === 'en' ? 'English' : 'Indonesian'}.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Gagal membuat elevator pitch.' }, { status: 500 });
    }

    return NextResponse.json({ pitch: content });
  } catch (error: unknown) {
    console.error('Pitch error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server saat membuat pitch.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

