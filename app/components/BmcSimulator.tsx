'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BmcData, bmcSteps, BmcStep } from '../types';
import { ChevronRight, ChevronLeft, Sparkles, FileText, Download, Loader2, Target, Lightbulb, Share2, HeartHandshake, Coins, Wrench, Activity, Users, Receipt, Rocket, Save, FolderOpen, Handshake, Database, Megaphone, Heart, Settings, DollarSign, CheckCircle2, Languages } from 'lucide-react';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { translations, Language } from '../translations';

const initialBmcData: BmcData = {
  customerSegments: '',
  valueProposition: '',
  channels: '',
  customerRelationships: '',
  revenueStreams: '',
  keyResources: '',
  keyActivities: '',
  keyPartnerships: '',
  costStructure: '',
};

const stepIcons = [
  Users, Target, Share2, HeartHandshake, Coins, Wrench, Activity, Users, Receipt
];

export interface AnalysisData {
  vitalSigns: {
    problemSolutionFit: number;
    scalability: number;
    defensibility: number;
    operationalFitness: number;
    externalResilience: number;
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  feedback: string;
  conclusion: string;
}

export default function BmcSimulator() {
  const [language, setLanguage] = useState<Language>('id');
  const t = translations[language];
  const steps = bmcSteps[language];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bmcData, setBmcData] = useState<BmcData>(initialBmcData);
  const [view, setView] = useState<'wizard' | 'analysis' | 'pitch'>('wizard');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pitchResult, setPitchResult] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  const tutorialSteps = {
    en: [
      {
        title: 'Welcome to BMC Simulator!',
        content: 'Let\'s start a quick tour to understand how to use this tool and fill out your Business Model Canvas.',
        target: 'center'
      },
      {
        title: 'Customer Segments',
        content: 'Who are your main customers? Here you define the groups of people or organizations you want to reach and serve.',
        target: 'customerSegments'
      },
      {
        title: 'Value Propositions',
        content: 'What value do you provide to customers? Why should they choose your product or service over competitors?',
        target: 'valueProposition'
      },
      {
        title: 'Channels',
        content: 'How do you reach your Customer Segments to deliver your Value Proposition? This includes communication, distribution, and sales channels.',
        target: 'channels'
      },
      {
        title: 'Customer Relationships',
        content: 'What type of relationship do you build with your customers? Is it personal, automated, or community-based?',
        target: 'customerRelationships'
      },
      {
        title: 'Revenue Streams',
        content: 'How does your business generate money from each Customer Segment? This is the lifeblood of your business.',
        target: 'revenueStreams'
      },
      {
        title: 'Key Resources',
        content: 'What are the most important assets required to make your business model work? Can be physical, financial, intellectual, or human.',
        target: 'keyResources'
      },
      {
        title: 'Key Activities',
        content: 'What main activities must the company perform for its business model to function well?',
        target: 'keyActivities'
      },
      {
        title: 'Key Partnerships',
        content: 'Who are your key partners and suppliers? Partnerships help optimize business models, reduce risk, or acquire resources.',
        target: 'keyPartnerships'
      },
      {
        title: 'Cost Structure',
        content: 'What are the most important costs incurred while operating this business model?',
        target: 'costStructure'
      },
      {
        title: 'AI Mentor',
        content: 'Once you specify all blocks, click "Analyze Now" to get deep analysis, business health scores, and strategic advice from our AI Mentor.',
        target: 'ai-mentor-btn'
      }
    ],
    id: [
      {
        title: 'Selamat Datang di BMC Simulator!',
        content: 'Mari kita mulai tur singkat untuk memahami cara menggunakan alat ini dan mengisi Business Model Canvas Anda.',
        target: 'center'
      },
      {
        title: 'Customer Segments',
        content: 'Siapa pelanggan utama Anda? Di sini Anda mendefinisikan kelompok orang atau organisasi yang ingin Anda jangkau dan layani.',
        target: 'customerSegments'
      },
      {
        title: 'Value Propositions',
        content: 'Nilai apa yang Anda berikan kepada pelanggan? Mengapa mereka harus memilih produk atau layanan Anda dibandingkan pesaing?',
        target: 'valueProposition'
      },
      {
        title: 'Channels',
        content: 'Bagaimana Anda menjangkau Customer Segments Anda untuk menyampaikan Value Proposition? Ini mencakup saluran komunikasi, distribusi, dan penjualan.',
        target: 'channels'
      },
      {
        title: 'Customer Relationships',
        content: 'Jenis hubungan apa yang Anda bangun dengan pelanggan Anda? Apakah personal, otomatis, atau berbasis komunitas?',
        target: 'customerRelationships'
      },
      {
        title: 'Revenue Streams',
        content: 'Bagaimana bisnis Anda menghasilkan uang dari setiap Customer Segment? Ini adalah urat nadi bisnis Anda.',
        target: 'revenueStreams'
      },
      {
        title: 'Key Resources',
        content: 'Aset terpenting apa yang diperlukan agar model bisnis Anda dapat berfungsi? Bisa berupa fisik, finansial, intelektual, atau manusia.',
        target: 'keyResources'
      },
      {
        title: 'Key Activities',
        content: 'Aktivitas utama apa yang harus dilakukan perusahaan agar model bisnisnya berfungsi dengan baik?',
        target: 'keyActivities'
      },
      {
        title: 'Key Partnerships',
        content: 'Siapa mitra utama dan pemasok Anda? Kemitraan membantu mengoptimalkan model bisnis, mengurangi risiko, atau memperoleh sumber daya.',
        target: 'keyPartnerships'
      },
      {
        title: 'Cost Structure',
        content: 'Apa saja biaya terpenting yang muncul saat mengoperasikan model bisnis ini?',
        target: 'costStructure'
      },
      {
        title: 'AI Mentor',
        content: 'Setelah Anda mengisi semua blok, klik tombol "Analyze Now" untuk mendapatkan analisis mendalam, skor kesehatan bisnis, dan saran strategis dari AI Mentor kami.',
        target: 'ai-mentor-btn'
      }
    ]
  };

  const currentTutorialSteps = tutorialSteps[language];

  const isAllFilled = Object.values(bmcData).every(val => val.trim() !== '');

  const saveDraft = () => {
    localStorage.setItem('bmcDraft', JSON.stringify(bmcData));
    setSaveMessage(t.saved);
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const loadDraft = () => {
    const saved = localStorage.getItem('bmcDraft');
    if (saved) {
      setBmcData(JSON.parse(saved));
      setSaveMessage(t.loaded);
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  const handleInputChange = (value: string) => {
    const currentStepId = steps[currentStepIndex].id;
    setBmcData((prev) => ({ ...prev, [currentStepId]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      generateAnalysis();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    setView('analysis');
    setAnalysisError('');
    try {
      const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
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
          type: "json_schema",
          json_schema: {
            name: "analysisData",
            schema: {
              type: "object",
              properties: {
                vitalSigns: {
                  type: "object",
                  properties: {
                    problemSolutionFit: { type: "integer", description: "Score 0-100" },
                    scalability: { type: "integer", description: "Score 0-100" },
                    defensibility: { type: "integer", description: "Score 0-100" },
                    operationalFitness: { type: "integer", description: "Score 0-100" },
                    externalResilience: { type: "integer", description: "Score 0-100" }
                  },
                  required: ["problemSolutionFit", "scalability", "defensibility", "operationalFitness", "externalResilience"],
                  additionalProperties: false
                },
                strengths: {
                  type: "array",
                  items: { type: "string" },
                  description: "Kekuatan utama dari model bisnis ini"
                },
                weaknesses: {
                  type: "array",
                  items: { type: "string" },
                  description: "Kritik dan risiko utama"
                },
                opportunities: {
                  type: "array",
                  items: { type: "string" },
                  description: "Peluang yang bisa dimanfaatkan"
                },
                threats: {
                  type: "array",
                  items: { type: "string" },
                  description: "Ancaman dari luar"
                },
                feedback: {
                  type: "string",
                  description: "Feedback konstruktif dan actionable (Markdown)"
                },
                conclusion: {
                  type: "string",
                  description: "Kesimpulan apakah ide ini layak dijalankan (Go/No-Go) dengan alasan (Markdown)"
                }
              },
              required: ["vitalSigns", "strengths", "weaknesses", "opportunities", "threats", "feedback", "conclusion"],
              additionalProperties: false
            },
            strict: true
          }
        }
      });
      
      const responseText = response.choices[0]?.message?.content;
      if (responseText) {
        setAnalysisResult(JSON.parse(responseText));
      } else {
        setAnalysisError(language === 'en' ? 'Failed to generate analysis.' : 'Gagal menghasilkan analisa.');
      }
    } catch (error) {
      console.error(error);
      setAnalysisError(language === 'en' ? 'An error occurred while contacting AI Mentor.' : 'Terjadi kesalahan saat menghubungi AI Mentor.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePitch = async () => {
    setIsGeneratingPitch(true);
    setView('pitch');
    try {
      const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
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
      setPitchResult(response.choices[0]?.message?.content || (language === 'en' ? 'Failed to generate pitch.' : 'Gagal menghasilkan elevator pitch.'));
    } catch (error) {
      console.error(error);
      setPitchResult(language === 'en' ? 'An error occurred while contacting AI Mentor.' : 'Terjadi kesalahan saat menghubungi AI Mentor.');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const exportPitchToDoc = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Elevator Pitch</title></head><body>";
    const footer = "</body></html>";
    
    let htmlContent = pitchResult
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/\n/gim, '<br>');

    const sourceHTML = header + htmlContent + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'Elevator_Pitch.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const exportAnalysisToDoc = () => {
    if (!analysisResult) return;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>AI Business Analysis</title></head><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>";
    const footer = "</body></html>";
    
    const htmlContent = `
      <h1 style="color: #203260; text-align: center;">${t.aiMentorAnalysis} Report</h1>
      
      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.vitalSigns}</h2>
      <ul>
        <li><strong>Problem-Solution Fit:</strong> ${analysisResult.vitalSigns.problemSolutionFit}/100</li>
        <li><strong>Scalability:</strong> ${analysisResult.vitalSigns.scalability}/100</li>
        <li><strong>Defensibility:</strong> ${analysisResult.vitalSigns.defensibility}/100</li>
        <li><strong>Operational Fitness:</strong> ${analysisResult.vitalSigns.operationalFitness}/100</li>
        <li><strong>External Resilience:</strong> ${analysisResult.vitalSigns.externalResilience}/100</li>
      </ul>

      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.strengths}</h2>
      <ul>${analysisResult.strengths.map(s => `<li>${s}</li>`).join('')}</ul>

      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.weaknesses}</h2>
      <ul>${analysisResult.weaknesses.map(s => `<li>${s}</li>`).join('')}</ul>

      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.opportunities}</h2>
      <ul>${analysisResult.opportunities.map(s => `<li>${s}</li>`).join('')}</ul>

      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.threats}</h2>
      <ul>${analysisResult.threats.map(s => `<li>${s}</li>`).join('')}</ul>

      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.feedback}</h2>
      <div>${analysisResult.feedback.replace(/\n/g, '<br>')}</div>

      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.conclusion}</h2>
      <div>${analysisResult.conclusion.replace(/\n/g, '<br>')}</div>
    `;

    const sourceHTML = header + htmlContent + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'AI_Business_Analysis.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const exportBmcToDoc = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Business Model Canvas</title></head><body>";
    const footer = "</body></html>";
    
    let htmlContent = `
      <h1>Business Model Canvas</h1>
      <table border="1" cellpadding="10" cellspacing="0" width="100%">
        <tr>
          <td colspan="2" rowspan="2" width="20%" valign="top">
            <b>${t.canvasLabels.kp}</b><br><br>${bmcData.keyPartnerships.replace(/\n/g, '<br>')}
          </td>
          <td colspan="2" width="20%" valign="top">
            <b>${t.canvasLabels.ka}</b><br><br>${bmcData.keyActivities.replace(/\n/g, '<br>')}
          </td>
          <td colspan="2" rowspan="2" width="20%" valign="top">
            <b>${t.canvasLabels.vp}</b><br><br>${bmcData.valueProposition.replace(/\n/g, '<br>')}
          </td>
          <td colspan="2" width="20%" valign="top">
            <b>${t.canvasLabels.cr}</b><br><br>${bmcData.customerRelationships.replace(/\n/g, '<br>')}
          </td>
          <td colspan="2" rowspan="2" width="20%" valign="top">
            <b>${t.canvasLabels.cs}</b><br><br>${bmcData.customerSegments.replace(/\n/g, '<br>')}
          </td>
        </tr>
        <tr>
          <td colspan="2" width="20%" valign="top">
            <b>${t.canvasLabels.kr}</b><br><br>${bmcData.keyResources.replace(/\n/g, '<br>')}
          </td>
          <td colspan="2" width="20%" valign="top">
            <b>${t.canvasLabels.ch}</b><br><br>${bmcData.channels.replace(/\n/g, '<br>')}
          </td>
        </tr>
        <tr>
          <td colspan="5" width="50%" valign="top">
            <b>${t.canvasLabels.cost}</b><br><br>${bmcData.costStructure.replace(/\n/g, '<br>')}
          </td>
          <td colspan="5" width="50%" valign="top">
            <b>${t.canvasLabels.rev}</b><br><br>${bmcData.revenueStreams.replace(/\n/g, '<br>')}
          </td>
        </tr>
      </table>
    `;

    const sourceHTML = header + htmlContent + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'Business_Model_Canvas.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const currentStep = steps[currentStepIndex];
  const Icon = stepIcons[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const renderCanvasBlock = (id: string, shortName: string, colSpan: string, rowSpan: string, IconComponent: React.ElementType, colStart?: string, rowStart?: string, tooltipPos: 'top' | 'bottom' = 'bottom', tooltipAlign: 'center' | 'left' | 'right' = 'center') => {
    const isActive = currentStep.id === id;
    const isFilled = bmcData[id as keyof BmcData] !== '';
    const stepInfo = steps.find(s => s.id === id);
    const isHighlighted = isTutorialActive && currentTutorialSteps[tutorialStepIndex].target === id;
    
    return (
      <div 
        className={`
          group relative rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer gap-2
          ${colSpan} ${rowSpan} ${colStart || ''} ${rowStart || ''}
          ${isHighlighted 
            ? 'bg-white ring-4 ring-[#FFB03A] ring-offset-4 ring-offset-slate-50 shadow-2xl scale-105 z-30 animate-pulse'
            : isActive 
              ? 'bg-white ring-4 ring-[#FFB03A] shadow-xl scale-105 z-20' 
              : isFilled 
                ? 'bg-white border-2 border-[#203260] shadow-sm hover:shadow-md z-10' 
                : 'bg-slate-50/50 border-2 border-dashed border-slate-300 hover:border-slate-400 opacity-80 hover:opacity-100 z-10'}
        `}
        onClick={() => {
          const index = steps.findIndex(s => s.id === id);
          if (index !== -1) setCurrentStepIndex(index);
        }}
      >
        {isFilled && !isActive && (
          <div className="absolute top-2 right-2 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        <IconComponent className={`w-6 h-6 ${isActive ? 'text-[#FFB03A]' : isFilled ? 'text-[#203260]' : 'text-slate-400'}`} />
        <span className={`font-bold text-sm ${isActive ? 'text-[#203260]' : isFilled ? 'text-[#203260]' : 'text-slate-400'}`}>
          {shortName}
        </span>

        {/* Tooltip */}
        {stepInfo && (
          <div className={`
            absolute w-64 p-4 bg-[#203260] text-white rounded-xl shadow-2xl 
            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none
            ${tooltipPos === 'bottom' ? 'top-full mt-3' : 'bottom-full mb-3'}
            ${tooltipAlign === 'center' ? 'left-1/2 -translate-x-1/2' : tooltipAlign === 'left' ? 'left-0' : 'right-0'}
          `}>
            <div className={`absolute w-3 h-3 bg-[#203260] rotate-45 
              ${tooltipPos === 'bottom' ? '-top-1.5' : '-bottom-1.5'}
              ${tooltipAlign === 'center' ? 'left-1/2 -translate-x-1/2' : tooltipAlign === 'left' ? 'left-6' : 'right-6'}
            `}></div>
            <h4 className="font-black text-[#FFB03A] mb-1 text-sm">{stepInfo.title}</h4>
            <p className="text-xs text-slate-200 mb-2 leading-relaxed">&quot;{stepInfo.question}&quot;</p>
            <div className="h-px w-full bg-white/10 mb-2"></div>
            <p className="text-[10px] text-slate-300 leading-relaxed"><span className="font-bold text-white">Hint:</span> {stepInfo.hint}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="pt-8 pb-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#FFB03A"/>
              <path d="M12 28L16 16L24 28L30 16L33 23" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M36 27C36 28.6569 34.6569 30 33 30C31.3431 30 30 28.6569 30 27C30 24.5 33 21 33 21C33 21 36 24.5 36 27Z" fill="white"/>
            </svg>
            <div className="flex flex-col justify-center ml-1">
              <span className="text-3xl font-black leading-none text-[#203260] tracking-wide">MAXY</span>
              <span className="text-sm font-bold leading-none text-[#203260] tracking-widest mt-1">ACADEMY</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            {saveMessage && <span className="text-sm font-bold text-emerald-500 mr-2">{saveMessage}</span>}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mr-2">
              <button 
                onClick={() => setLanguage('id')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${language === 'id' ? 'bg-white text-[#203260] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ID
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${language === 'en' ? 'bg-white text-[#203260] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
            </div>
            <button onClick={() => { setIsTutorialActive(true); setTutorialStepIndex(0); setView('wizard'); }} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#FFB03A] rounded-xl hover:bg-[#f0a02a] transition-colors shadow-md">
              <Lightbulb className="w-4 h-4" />
              {t.tutorial}
            </button>
            <button onClick={loadDraft} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#203260] bg-white border-2 border-[#203260] rounded-xl hover:bg-slate-50 transition-colors">
              <FolderOpen className="w-4 h-4" /> {t.load}
            </button>
            <button onClick={saveDraft} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#FFB03A] rounded-xl hover:bg-[#f0a02a] transition-colors">
              <Save className="w-4 h-4" /> {t.save}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        <AnimatePresence mode="wait">
          {view === 'wizard' && (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col xl:flex-row gap-8 items-stretch"
            >
              {/* Left Column: Form */}
              <div className="w-full xl:w-[40%] bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col min-h-[600px]">
                <div className="flex justify-between items-center mb-8">
                  <div className="bg-[#203260]/10 text-[#203260] text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                    {t.mission} {currentStepIndex + 1}
                  </div>
                  <div className="text-xs font-medium text-slate-400 italic">
                    {t.completeAll}
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-slate-100 rounded-full mb-8 overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#FFB03A]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="w-14 h-14 bg-[#FFB03A] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#FFB03A]/30">
                  <Icon className="w-7 h-7" />
                </div>

                <h2 className="text-3xl font-black text-[#203260] mb-4">{currentStep.title}</h2>
                <p className="text-slate-500 text-base mb-8 leading-relaxed">
                  &quot;{currentStep.question}&quot;
                </p>

                <textarea
                  value={bmcData[currentStep.id]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={currentStep.placeholder}
                  className="w-full flex-1 min-h-[200px] p-6 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-0 focus:border-[#203260] transition-all resize-none text-slate-700 text-lg placeholder:text-slate-300"
                />

                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={handleBack}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-[#203260] disabled:opacity-0 transition-colors font-bold"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {t.back}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStepIndex === steps.length - 1 && !isAllFilled}
                    className={`flex items-center gap-2 px-8 py-4 bg-[#203260] text-white rounded-xl hover:bg-[#1a284c] transition-colors font-bold shadow-lg shadow-[#203260]/20 disabled:opacity-50 disabled:cursor-not-allowed ${isTutorialActive && currentTutorialSteps[tutorialStepIndex].target === 'ai-mentor-btn' ? 'ring-4 ring-[#FFB03A] ring-offset-4 ring-offset-white shadow-2xl scale-105 z-30 animate-pulse' : ''}`}
                  >
                    {currentStepIndex === steps.length - 1 ? t.analyzeNow : t.next}
                    {currentStepIndex !== steps.length - 1 && <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Right Column: Canvas & Hint */}
              <div className="w-full xl:w-[60%] flex flex-col gap-6 min-h-[600px]">
                {/* Light Canvas */}
                <div className="bg-slate-50 rounded-[2.5rem] p-8 flex-1 min-h-[400px] shadow-inner border-2 border-slate-100 relative">
                  <div className="absolute inset-0 opacity-[0.03] rounded-[2.5rem] overflow-hidden" style={{ backgroundImage: 'radial-gradient(#203260 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                  <div className="grid grid-cols-2 lg:grid-cols-10 lg:grid-rows-3 gap-2 lg:gap-4 h-full relative z-10 min-h-[500px] lg:min-h-0">
                    {/* Feasibility Zone */}
                    <div className="hidden lg:flex col-start-1 col-end-5 row-start-1 row-end-3 rounded-3xl border-2 border-rose-200 bg-rose-100/40 relative z-0 -m-2 overflow-hidden items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-4 rotate-[-15deg] opacity-20">
                        <Settings className="w-12 h-12 text-rose-500" />
                        <span className="text-4xl font-black text-rose-500 uppercase tracking-widest">{t.zones.feasibility}</span>
                      </div>
                    </div>

                    {/* Desirability Zone */}
                    <div className="hidden lg:flex col-start-5 col-end-11 row-start-1 row-end-3 rounded-3xl border-2 border-blue-200 bg-blue-100/40 relative z-0 -m-2 overflow-hidden items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-4 rotate-[-15deg] opacity-20">
                        <Heart className="w-12 h-12 text-blue-500" />
                        <span className="text-4xl font-black text-blue-500 uppercase tracking-widest">{t.zones.desirability}</span>
                      </div>
                    </div>

                    {/* Viability Zone */}
                    <div className="hidden lg:flex col-start-1 col-end-11 row-start-3 row-end-4 rounded-3xl border-2 border-slate-300 bg-slate-200/40 relative z-0 -m-2 overflow-hidden items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-4 opacity-20">
                        <DollarSign className="w-12 h-12 text-slate-500" />
                        <span className="text-4xl font-black text-slate-500 uppercase tracking-widest">{t.zones.viability}</span>
                      </div>
                    </div>

                    {/* Mobile Only Header labels could be added here if needed, but for now we focus on layout */}
                    
                    {renderCanvasBlock('keyPartnerships', 'KP', 'col-span-2 lg:col-span-2', 'row-span-1 lg:row-span-2', Handshake, 'lg:col-start-1', 'lg:row-start-1', 'bottom', 'left')}
                    {renderCanvasBlock('keyActivities', 'KA', 'col-span-1 lg:col-span-2', 'row-span-1 lg:row-span-1', Activity, 'lg:col-start-3', 'lg:row-start-1', 'bottom')}
                    {renderCanvasBlock('valueProposition', 'VP', 'col-span-2 lg:col-span-2', 'row-span-1 lg:row-span-2', Sparkles, 'lg:col-start-5', 'lg:row-start-1', 'bottom')}
                    {renderCanvasBlock('customerRelationships', 'CR', 'col-span-1 lg:col-span-2', 'row-span-1 lg:row-span-1', HeartHandshake, 'lg:col-start-7', 'lg:row-start-1', 'bottom')}
                    {renderCanvasBlock('customerSegments', 'CS', 'col-span-2 lg:col-span-2', 'row-span-1 lg:row-span-2', Users, 'lg:col-start-9', 'lg:row-start-1', 'bottom', 'right')}
                    
                    {renderCanvasBlock('keyResources', 'KR', 'col-span-1 lg:col-span-2', 'row-span-1 lg:row-span-1', Database, 'lg:col-start-3', 'lg:row-start-2', 'bottom')}
                    {renderCanvasBlock('channels', 'CH', 'col-span-1 lg:col-span-2', 'row-span-1 lg:row-span-1', Megaphone, 'lg:col-start-7', 'lg:row-start-2', 'bottom')}
                    
                    {renderCanvasBlock('costStructure', 'COST', 'col-span-2 lg:col-span-5', 'row-span-1 lg:row-span-1', Receipt, 'lg:col-start-1', 'lg:row-start-3', 'top', 'left')}
                    {renderCanvasBlock('revenueStreams', 'REV', 'col-span-2 lg:col-span-5', 'row-span-1 lg:row-span-1', Coins, 'lg:col-start-6', 'lg:row-start-3', 'top', 'right')}
                  </div>
                </div>

                {/* Hint Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex gap-6 items-start">
                  <div className="w-12 h-12 bg-[#FFB03A]/20 text-[#FFB03A] rounded-2xl flex items-center justify-center shrink-0">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#203260] text-lg mb-2">{t.keyMission}</h3>
                    <p className="text-slate-500 leading-relaxed">
                      {currentStep.hint}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-[#203260] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB03A] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                      <Sparkles className="w-6 h-6 text-[#FFB03A]" />
                    </div>
                    <h2 className="text-3xl font-black">{t.aiMentorAnalysis}</h2>
                  </div>
                  <p className="text-slate-300 text-lg relative z-10">{t.analysisDescription}</p>
                </div>
                
                <div className="p-10">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#FFB03A]" />
                      <p className="font-bold">{t.analyzing}</p>
                    </div>
                  ) : analysisError ? (
                    <div className="text-red-500 font-bold text-center py-12">{analysisError}</div>
                  ) : analysisResult ? (
                    <div className="flex flex-col gap-10">
                      {/* Business Vital Signs */}
                      <div className="bg-[#111827] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                          <Activity className="w-64 h-64 -mt-12 -mr-12" />
                        </div>
                        <h3 className="text-2xl font-black mb-8 relative z-10">{t.vitalSigns}</h3>
                        
                        <div className="space-y-6 relative z-10">
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Problem-Solution Fit</span>
                              <span className="text-2xl font-black">{analysisResult.vitalSigns.problemSolutionFit}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.problemSolutionFit}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-full bg-blue-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Scalability</span>
                              <span className="text-2xl font-black">{analysisResult.vitalSigns.scalability}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.scalability}%` }}
                                transition={{ duration: 1, delay: 0.4 }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Defensibility</span>
                              <span className="text-2xl font-black">{analysisResult.vitalSigns.defensibility}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.defensibility}%` }}
                                transition={{ duration: 1, delay: 0.6 }}
                                className="h-full bg-purple-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Operational Fitness</span>
                              <span className="text-2xl font-black">{analysisResult.vitalSigns.operationalFitness}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.operationalFitness}%` }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className="h-full bg-amber-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">External Resilience</span>
                              <span className="text-2xl font-black">{analysisResult.vitalSigns.externalResilience}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.externalResilience}%` }}
                                transition={{ duration: 1, delay: 1.0 }}
                                className="h-full bg-rose-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                            <h3 className="text-xl font-black text-[#203260]">{t.strengths}</h3>
                          </div>
                          <ul className="space-y-4">
                            {analysisResult.strengths.map((str, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-2 h-2 bg-emerald-500 rounded-full shrink-0"></div>
                                <span className="leading-relaxed">{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
                            <h3 className="text-xl font-black text-[#203260]">{t.weaknesses}</h3>
                          </div>
                          <ul className="space-y-4">
                            {analysisResult.weaknesses.map((wk, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-2 h-2 bg-rose-500 rounded-full shrink-0"></div>
                                <span className="leading-relaxed">{wk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Opportunities & Threats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                            <h3 className="text-xl font-black text-[#203260]">{t.opportunities}</h3>
                          </div>
                          <ul className="space-y-4">
                            {analysisResult.opportunities.map((opp, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                                <span className="leading-relaxed">{opp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                            <h3 className="text-xl font-black text-[#203260]">{t.threats}</h3>
                          </div>
                          <ul className="space-y-4">
                            {analysisResult.threats.map((thr, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-2 h-2 bg-amber-500 rounded-full shrink-0"></div>
                                <span className="leading-relaxed">{thr}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Feedback & Conclusion */}
                      <div className="bg-slate-50 rounded-3xl p-8 border-2 border-slate-100">
                        <h3 className="text-xl font-black text-[#203260] mb-4">{t.feedback}</h3>
                        <div className="prose prose-slate max-w-none prose-headings:font-black prose-h3:text-[#203260] prose-a:text-[#FFB03A]">
                          <ReactMarkdown>{analysisResult.feedback}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="bg-[#FFB03A]/10 rounded-3xl p-8 border-2 border-[#FFB03A]/20">
                        <h3 className="text-xl font-black text-[#203260] mb-4">{t.conclusion}</h3>
                        <div className="prose prose-slate max-w-none prose-headings:font-black prose-h3:text-[#203260] prose-a:text-[#FFB03A]">
                          <ReactMarkdown>{analysisResult.conclusion}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => setView('wizard')}
                    className="px-6 py-3 text-slate-500 hover:text-[#203260] font-bold transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {t.back}
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={exportAnalysisToDoc}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#203260] text-[#203260] rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm"
                    >
                      <Download className="w-5 h-5" />
                      {t.exportDoc} (.doc)
                    </button>
                    <button
                      onClick={exportBmcToDoc}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#203260] text-[#203260] rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm"
                    >
                      <Download className="w-5 h-5" />
                      Export BMC (.doc)
                    </button>
                    <button
                      onClick={generatePitch}
                      disabled={isGeneratingPitch || isAnalyzing}
                      className="flex items-center gap-2 px-8 py-3 bg-[#FFB03A] text-white rounded-xl hover:bg-[#f0a02a] transition-colors font-bold shadow-lg shadow-[#FFB03A]/30 disabled:opacity-70"
                    >
                      {isGeneratingPitch ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                      {isGeneratingPitch ? t.generatingPitch : t.goPitch}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'pitch' && (
            <motion.div
              key="pitch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-[#203260] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB03A] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                      <FileText className="w-6 h-6 text-[#FFB03A]" />
                    </div>
                    <h2 className="text-3xl font-black">{t.elevatorPitch}</h2>
                  </div>
                  <p className="text-slate-300 text-lg relative z-10">{t.pitchDescription}</p>
                </div>
                
                <div className="p-10 prose prose-slate max-w-none prose-headings:font-black prose-h3:text-[#203260]">
                  <ReactMarkdown>{pitchResult}</ReactMarkdown>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => setView('analysis')}
                    className="px-6 py-3 text-slate-500 hover:text-[#203260] font-bold transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={exportPitchToDoc}
                    className="flex items-center gap-2 px-8 py-3 bg-[#FFB03A] text-white rounded-xl hover:bg-[#f0a02a] transition-colors font-bold shadow-lg shadow-[#FFB03A]/30"
                  >
                    <Download className="w-5 h-5" />
                    {t.exportDoc} (.doc)
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutorial Overlay */}
        {isTutorialActive && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsTutorialActive(false)}></div>
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-[110] pointer-events-auto border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#FFB03A]/20 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-[#FFB03A]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#203260]">{currentTutorialSteps[tutorialStepIndex].title}</h3>
                </div>
                <p className="text-slate-600 mb-8 leading-relaxed text-lg">{currentTutorialSteps[tutorialStepIndex].content}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-1.5">
                    {currentTutorialSteps.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === tutorialStepIndex ? 'bg-[#FFB03A] w-6' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {tutorialStepIndex > 0 && (
                      <button onClick={() => setTutorialStepIndex(prev => prev - 1)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t.back}</button>
                    )}
                    {tutorialStepIndex < currentTutorialSteps.length - 1 ? (
                      <button onClick={() => setTutorialStepIndex(prev => prev + 1)} className="px-6 py-2 bg-[#203260] text-white font-bold rounded-xl hover:bg-1a284d transition-colors shadow-md">{t.next}</button>
                    ) : (
                      <button onClick={() => { setIsTutorialActive(false); setTutorialStepIndex(0); }} className="px-6 py-2 bg-[#FFB03A] text-white font-bold rounded-xl hover:bg-[#f0a02a] transition-colors shadow-md">{language === 'en' ? 'Finish' : 'Selesai'}</button>
                    )}
                  </div>
                </div>
              <button onClick={() => { setIsTutorialActive(false); setTutorialStepIndex(0); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
