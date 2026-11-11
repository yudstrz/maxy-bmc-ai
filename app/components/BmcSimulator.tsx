'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BmcData, bmcSteps, BmcStep } from '../types';
import { 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Download, 
  Loader2, 
  Target, 
  Lightbulb, 
  Share2, 
  HeartHandshake, 
  Coins, 
  Wrench, 
  Activity, 
  Users, 
  Receipt, 
  Save, 
  FolderOpen, 
  Handshake, 
  Database, 
  Megaphone, 
  Heart, 
  Settings, 
  DollarSign, 
  CheckCircle2,
  Gem,
  Sun,
  Moon,
  Upload,
  Clock,
  X,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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

const getTutorialSteps = (lang: Language) => [
  {
    title: lang === 'en' ? 'Welcome to BMC Simulator!' : 'Selamat Datang di BMC Simulator!',
    content: lang === 'en'
      ? "Let's start a quick tour to understand how to use this tool and fill out your Business Model Canvas."
      : 'Mari kita mulai tur singkat untuk memahami cara menggunakan alat ini dan mengisi Business Model Canvas Anda.',
    target: 'center'
  },
  ...bmcSteps[lang].map((step) => ({
    title: step.title,
    content: `${step.question} ${step.hint}`,
    target: step.id
  })),
  {
    title: 'AI Mentor',
    content: lang === 'en'
      ? 'Once you specify all blocks, click "Analyze Now" to get deep analysis, business health scores, and strategic advice from our AI Mentor.'
      : 'Setelah Anda mengisi semua blok, klik tombol "Analisa Sekarang" untuk mendapatkan analisis mendalam, skor kesehatan bisnis, dan saran strategis dari AI Mentor kami.',
    target: 'ai-mentor-btn'
  }
];

const downloadWordDoc = (filename: string, title: string, bodyHtml: string) => {
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${title}</title></head><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>`;
  const footer = '</body></html>';
  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + bodyHtml + footer);
  const link = document.createElement('a');
  document.body.appendChild(link);
  link.href = source;
  link.download = filename;
  link.click();
  document.body.removeChild(link);
};

export default function BmcSimulator() {
  const [language, setLanguage] = useState<Language>('id');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const activeLanguage: Language = language === 'en' ? 'en' : 'id';
  const t = translations[activeLanguage];
  const steps = bmcSteps[activeLanguage];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bmcData, setBmcData] = useState<BmcData>(initialBmcData);
  const [view, setView] = useState<'wizard' | 'analysis' | 'pitch'>('wizard');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pitchResult, setPitchResult] = useState('');
  const [pitchError, setPitchError] = useState('');

  const [lastAutosave, setLastAutosave] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedDraftInfo, setSavedDraftInfo] = useState<{ timestamp: string; data: BmcData } | null>(null);
  const [loadNotice, setLoadNotice] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  const currentTutorialSteps = useMemo(() => getTutorialSteps(activeLanguage), [activeLanguage]);
  const isAllFilled = useMemo(() => (Object.values(bmcData) as string[]).every((val: string) => val.trim() !== ''), [bmcData]);

  // Theme setup: default light
  useEffect(() => {
    const savedTheme = localStorage.getItem('bmcTheme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('bmcTheme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Check existing draft on mount & setup autosave
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bmcDraft');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) {
          setSavedDraftInfo({ timestamp: parsed.timestamp || '', data: parsed.data });
        }
      }
    } catch {
      // Ignore parse failure
    }
  }, []);

  // Autosave draft when bmcData changes
  useEffect(() => {
    const isNotEmpty = Object.values(bmcData).some(v => v.trim() !== '');
    if (!isNotEmpty) return;

    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const payload = { timestamp: `${now.toLocaleDateString()} ${timeStr}`, data: bmcData };
        localStorage.setItem('bmcDraft', JSON.stringify(payload));
        setSavedDraftInfo(payload);
        setLastAutosave(timeStr);
      } catch {
        // quota limit guard
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [bmcData]);

  // Modal Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTutorialActive) {
          setIsTutorialActive(false);
          setTutorialStepIndex(0);
        }
        if (showSaveModal) setShowSaveModal(false);
        if (showLoadModal) setShowLoadModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialActive, showSaveModal, showLoadModal]);

  const handleInputChange = (value: string) => {
    const currentStepId = steps[currentStepIndex].id;
    setBmcData((prev: BmcData) => ({ ...prev, [currentStepId]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev: number) => prev + 1);
    } else {
      generateAnalysis();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev: number) => prev - 1);
    }
  };

  // Export JSON backup file
  const downloadJsonBackup = () => {
    const blob = new Blob([JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), bmcData }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bmc-model-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowSaveModal(false);
  };

  // Load from local draft
  const restoreDraft = () => {
    if (savedDraftInfo?.data) {
      setBmcData(savedDraftInfo.data);
      setLoadNotice(t.loaded);
      setTimeout(() => {
        setLoadNotice('');
        setShowLoadModal(false);
      }, 1000);
    }
  };

  // Upload & import JSON backup file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const dataToLoad = parsed.bmcData || parsed;
        if (typeof dataToLoad === 'object' && dataToLoad !== null) {
          setBmcData({
            customerSegments: dataToLoad.customerSegments || '',
            valueProposition: dataToLoad.valueProposition || '',
            channels: dataToLoad.channels || '',
            customerRelationships: dataToLoad.customerRelationships || '',
            revenueStreams: dataToLoad.revenueStreams || '',
            keyResources: dataToLoad.keyResources || '',
            keyActivities: dataToLoad.keyActivities || '',
            keyPartnerships: dataToLoad.keyPartnerships || '',
            costStructure: dataToLoad.costStructure || '',
          });
          setLoadNotice(t.loaded);
          setTimeout(() => {
            setLoadNotice('');
            setShowLoadModal(false);
          }, 1000);
        }
      } catch {
        alert(activeLanguage === 'en' ? 'Invalid JSON file format.' : 'Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    setView('analysis');
    setAnalysisError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bmcData, language: activeLanguage })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (activeLanguage === 'en' ? 'Failed to generate analysis.' : 'Gagal menghasilkan analisa.'));
      }
      setAnalysisResult(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : (activeLanguage === 'en' ? 'An error occurred while contacting AI Mentor.' : 'Terjadi kesalahan saat menghubungi AI Mentor.');
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePitch = async () => {
    setIsGeneratingPitch(true);
    setView('pitch');
    setPitchError('');
    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bmcData, language: activeLanguage })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (activeLanguage === 'en' ? 'Failed to generate pitch.' : 'Gagal menghasilkan elevator pitch.'));
      }
      setPitchResult(data.pitch);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : (activeLanguage === 'en' ? 'An error occurred while contacting AI Mentor.' : 'Terjadi kesalahan saat menghubungi AI Mentor.');
      setPitchError(message);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const exportPitchToDoc = () => {
    const htmlContent = pitchResult
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/\n/gim, '<br>');

    downloadWordDoc('Elevator_Pitch.doc', 'Elevator Pitch', htmlContent);
  };

  const exportAnalysisToDoc = () => {
    if (!analysisResult) return;

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
      <ul>${analysisResult.strengths.map((s: string) => `<li>${s}</li>`).join('')}</ul>
      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.weaknesses}</h2>
      <ul>${analysisResult.weaknesses.map((s: string) => `<li>${s}</li>`).join('')}</ul>
      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.opportunities}</h2>
      <ul>${analysisResult.opportunities.map((s: string) => `<li>${s}</li>`).join('')}</ul>
      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.threats}</h2>
      <ul>${analysisResult.threats.map((s: string) => `<li>${s}</li>`).join('')}</ul>
      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.feedback}</h2>
      <div>${analysisResult.feedback.replace(/\n/g, '<br>')}</div>
      <h2 style="color: #203260; border-bottom: 2px solid #FFB03A; padding-bottom: 5px;">${t.conclusion}</h2>
      <div>${analysisResult.conclusion.replace(/\n/g, '<br>')}</div>
    `;

    downloadWordDoc('AI_Business_Analysis.doc', 'AI Business Analysis', htmlContent);
  };

  const exportBmcToDoc = () => {
    const htmlContent = `
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

    downloadWordDoc('Business_Model_Canvas.doc', 'Business Model Canvas', htmlContent);
  };

  const currentStep = steps[currentStepIndex];
  const Icon = stepIcons[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const renderCanvasBlock = (
    id: string, 
    shortName: string, 
    colSpan: string, 
    rowSpan: string, 
    IconComponent: React.ElementType, 
    colStart?: string, 
    rowStart?: string, 
    tooltipPos: 'top' | 'bottom' = 'bottom', 
    tooltipAlign: 'center' | 'left' | 'right' = 'center'
  ) => {
    const isActive = currentStep.id === id;
    const isFilled = bmcData[id as keyof BmcData] !== '';
    const stepInfo = steps.find((s: BmcStep) => s.id === id);
    const isHighlighted = isTutorialActive && currentTutorialSteps[tutorialStepIndex].target === id;
    
    return (
      <button
        type="button"
        role="button"
        tabIndex={0}
        aria-label={stepInfo?.title || shortName}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const index = steps.findIndex((s: BmcStep) => s.id === id);
            if (index !== -1) setCurrentStepIndex(index);
          }
        }}
        onClick={() => {
          const index = steps.findIndex((s: BmcStep) => s.id === id);
          if (index !== -1) setCurrentStepIndex(index);
        }}
        className={`
          group relative rounded-xl flex flex-col items-center justify-center transition duration-200 cursor-pointer gap-2 p-3 text-left min-h-[72px] sm:min-h-[90px]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260] dark:focus-visible:ring-amber-400 focus-visible:ring-offset-2
          ${colSpan} ${rowSpan} ${colStart || ''} ${rowStart || ''}
          ${isHighlighted 
            ? 'bg-white dark:bg-slate-900 ring-4 ring-[#FFB03A] shadow-2xl scale-105 z-30 animate-pulse'
            : isActive 
              ? 'bg-amber-50/50 dark:bg-amber-950/30 ring-4 ring-[#FFB03A] shadow-lg scale-[1.02] z-20 border-2 border-[#FFB03A]' 
              : isFilled 
                ? 'bg-white dark:bg-slate-900 border-2 border-[#203260] dark:border-slate-700 shadow-sm hover:shadow-md z-10' 
                : 'bg-white/80 dark:bg-slate-900/60 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500 z-10'}
        `}
      >
        {isFilled && !isActive && (
          <div className="absolute top-2 right-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-[#FFB03A]' : isFilled ? 'text-[#203260] dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`} />
        <span className={`font-bold text-xs sm:text-sm ${isActive || isFilled ? 'text-[#203260] dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
          {shortName}
        </span>

        {stepInfo && (
          <div className={`
            hidden md:block absolute w-64 p-4 bg-[#203260] dark:bg-slate-800 text-white rounded-xl shadow-2xl border border-white/10
            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none
            ${tooltipPos === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}
            ${tooltipAlign === 'center' ? 'left-1/2 -translate-x-1/2' : tooltipAlign === 'left' ? 'left-0' : 'right-0'}
          `}>
            <div className={`absolute w-3 h-3 bg-[#203260] dark:bg-slate-800 rotate-45 
              ${tooltipPos === 'bottom' ? '-top-1.5 border-t border-l border-white/10' : '-bottom-1.5 border-b border-r border-white/10'}
              ${tooltipAlign === 'center' ? 'left-1/2 -translate-x-1/2' : tooltipAlign === 'left' ? 'left-6' : 'right-6'}
            `}></div>
            <h4 className="font-bold text-[#FFB03A] mb-1 text-sm">{stepInfo.title}</h4>
            <p className="text-xs text-slate-200 mb-2 leading-relaxed">&quot;{stepInfo.question}&quot;</p>
            <div className="h-px w-full bg-white/10 mb-2"></div>
            <p className="text-xs text-slate-300 leading-relaxed"><span className="font-bold text-white">Hint:</span> {stepInfo.hint}</p>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-100 selection:text-slate-900 transition-colors duration-200 flex flex-col">
      {/* Hidden File Input for JSON restore */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".json" 
        className="hidden" 
        aria-hidden="true" 
      />

      {/* Header (Desktop, Mobile, iFrame responsive) */}
      <header className="pt-4 sm:pt-6 pb-3 px-3 sm:px-6 lg:px-8 border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0">
              <rect width="48" height="48" rx="12" fill="#FFB03A"/>
              <path d="M12 28L16 16L24 28L30 16L33 23" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M36 27C36 28.6569 34.6569 30 33 30C31.3431 30 30 28.6569 30 27C30 24.5 33 21 33 21C33 21 36 24.5 36 27Z" fill="white"/>
            </svg>
            <div className="flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-black leading-none text-[#203260] dark:text-amber-400 tracking-wide">MAXY</span>
              <span className="text-[10px] sm:text-xs font-bold leading-none text-[#203260] dark:text-slate-300 tracking-widest mt-1">ACADEMY</span>
            </div>
            {lastAutosave && (
              <span className="hidden sm:inline-flex items-center gap-1 ml-3 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3 h-3" /> {t.autosaved} {lastAutosave}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Language Switch */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
              <button 
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${language === 'id' ? 'bg-white dark:bg-slate-900 text-[#203260] dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                aria-label="Bahasa Indonesia"
              >
                ID
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${language === 'en' ? 'bg-white dark:bg-slate-900 text-[#203260] dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                aria-label="English"
              >
                EN
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260] dark:focus-visible:ring-amber-400"
              aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
              title={theme === 'dark' ? t.themeLight : t.themeDark}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Tutorial */}
            <button 
              onClick={() => { setIsTutorialActive(true); setTutorialStepIndex(0); setView('wizard'); }} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#203260] dark:text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {t.tutorial}
            </button>

            {/* Load Button */}
            <button 
              onClick={() => setShowLoadModal(true)} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#203260] dark:text-slate-100 bg-white dark:bg-slate-900 border-2 border-[#203260] dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
            >
              <FolderOpen className="w-3.5 h-3.5" /> {t.load}
            </button>

            {/* Save Button */}
            <button 
              onClick={() => setShowSaveModal(true)} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-white bg-[#203260] dark:bg-amber-500 dark:text-slate-950 hover:bg-[#1a284c] dark:hover:bg-amber-400 rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
            >
              <Save className="w-3.5 h-3.5" /> {t.save}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
        <AnimatePresence mode="wait">
          {view === 'wizard' && (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-stretch w-full"
            >
              {/* Form Input Section */}
              <div className="w-full xl:w-[42%] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 lg:p-8 flex flex-col min-h-[480px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-[#203260]/10 dark:bg-amber-400/10 text-[#203260] dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                    {t.mission} {currentStepIndex + 1}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t.completeAll}
                  </div>
                </div>
                
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#FFB03A]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="w-12 h-12 bg-amber-100 dark:bg-slate-800 text-[#203260] dark:text-amber-400 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6" />
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#203260] dark:text-slate-100 mb-2">{currentStep.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-4 leading-relaxed">
                  &quot;{currentStep.question}&quot;
                </p>

                <textarea
                  value={bmcData[currentStep.id]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={currentStep.placeholder}
                  className="w-full flex-1 min-h-[160px] p-3 sm:p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#203260] dark:focus:ring-amber-400 focus:border-transparent transition-all resize-none text-slate-800 dark:text-slate-100 text-sm sm:text-base placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleBack}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-[#203260] dark:hover:text-slate-100 disabled:opacity-0 transition-colors font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {t.back}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStepIndex === steps.length - 1 && !isAllFilled}
                    className={`flex items-center gap-2 px-6 py-2.5 bg-[#203260] text-white rounded-xl hover:bg-[#1a284c] dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 transition-colors font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260] ${isTutorialActive && currentTutorialSteps[tutorialStepIndex].target === 'ai-mentor-btn' ? 'ring-4 ring-[#FFB03A] ring-offset-4 ring-offset-white shadow-2xl scale-105 z-30 animate-pulse' : ''}`}
                  >
                    {currentStepIndex === steps.length - 1 ? t.analyzeNow : t.next}
                    {currentStepIndex !== steps.length - 1 && <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Canvas Interactive Section */}
              <div className="w-full xl:w-[58%] flex flex-col gap-4 sm:gap-6">
                <div className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-slate-200 dark:border-slate-800 relative w-full">
                  <div className="grid grid-cols-2 lg:grid-cols-10 lg:grid-rows-3 gap-2 sm:gap-3 lg:gap-3.5 h-full relative z-10 min-h-[460px] lg:min-h-0">
                    <div className="hidden lg:flex col-start-1 col-end-5 row-start-1 row-end-3 rounded-2xl border-2 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 relative z-0 -m-1 overflow-hidden items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-4 rotate-[-15deg] opacity-20">
                        <Settings className="w-12 h-12 text-rose-500" />
                        <span className="text-3xl font-black text-rose-500 uppercase tracking-widest">{t.zones.feasibility}</span>
                      </div>
                    </div>

                    <div className="hidden lg:flex col-start-5 col-end-11 row-start-1 row-end-3 rounded-2xl border-2 border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 relative z-0 -m-1 overflow-hidden items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-4 rotate-[-15deg] opacity-20">
                        <Heart className="w-12 h-12 text-blue-500" />
                        <span className="text-3xl font-black text-blue-500 uppercase tracking-widest">{t.zones.desirability}</span>
                      </div>
                    </div>

                    <div className="hidden lg:flex col-start-1 col-end-11 row-start-3 row-end-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700/50 bg-slate-200/50 dark:bg-slate-800/20 relative z-0 -m-1 overflow-hidden items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-4 opacity-20">
                        <DollarSign className="w-12 h-12 text-slate-600 dark:text-slate-400" />
                        <span className="text-3xl font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{t.zones.viability}</span>
                      </div>
                    </div>
                    
                    {renderCanvasBlock('keyPartnerships', 'KP', 'col-span-2 lg:col-span-2', 'row-span-1 lg:row-span-2', Handshake, 'lg:col-start-1', 'lg:row-start-1', 'bottom', 'left')}
                    {renderCanvasBlock('keyActivities', 'KA', 'col-span-1 lg:col-span-2', 'row-span-1 lg:row-span-1', Activity, 'lg:col-start-3', 'lg:row-start-1', 'bottom')}
                    {renderCanvasBlock('valueProposition', 'VP', 'col-span-2 lg:col-span-2', 'row-span-1 lg:row-span-2', Gem, 'lg:col-start-5', 'lg:row-start-1', 'bottom')}
                    {renderCanvasBlock('customerRelationships', 'CR', 'col-span-1 lg:col-span-2', 'row-span-1 lg:row-span-1', HeartHandshake, 'lg:col-start-7', 'lg:row-start-1', 'bottom')}
                    {renderCanvasBlock('customerSegments', 'CS', 'col-span-2 lg:col-span-2', 'row-span-1 lg:row-span-2', Users, 'lg:col-start-9', 'lg:row-start-1', 'bottom', 'right')}
                    
                    {renderCanvasBlock('keyResources', 'KR', 'col-span-1 lg:col-span-2', 'row-span-1 lg:row-span-1', Database, 'lg:col-start-3', 'lg:row-start-2', 'bottom')}
                    {renderCanvasBlock('channels', 'CH', 'col-span-1 lg:col-span-2', 'row-span-1 lg:row-span-1', Megaphone, 'lg:col-start-7', 'lg:row-start-2', 'bottom')}
                    
                    {renderCanvasBlock('costStructure', 'COST', 'col-span-2 lg:col-span-5', 'row-span-1 lg:row-span-1', Receipt, 'lg:col-start-1', 'lg:row-start-3', 'top', 'left')}
                    {renderCanvasBlock('revenueStreams', 'REV', 'col-span-2 lg:col-span-5', 'row-span-1 lg:row-span-1', Coins, 'lg:col-start-6', 'lg:row-start-3', 'top', 'right')}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex gap-4 items-start">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#203260] dark:text-slate-100 text-sm sm:text-base mb-1">{t.keyMission}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto w-full"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-[#203260] dark:bg-slate-800 p-6 sm:p-10 text-white relative">
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                      <Target className="w-5 h-5 text-[#FFB03A]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black">{t.aiMentorAnalysis}</h2>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base relative z-10">{t.analysisDescription}</p>
                </div>
                
                <div className="p-4 sm:p-8 lg:p-10">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#FFB03A]" />
                      <p className="font-bold text-base">{t.analyzing}</p>
                    </div>
                  ) : analysisError ? (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-6 text-rose-700 dark:text-rose-300 text-center font-bold">
                      {analysisError}
                    </div>
                  ) : analysisResult ? (
                    <div className="flex flex-col gap-8 sm:gap-10">
                      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-5 sm:p-8 text-white relative overflow-hidden shadow-sm border border-slate-800">
                        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                          <Activity className="w-64 h-64 -mt-12 -mr-12" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black mb-6 relative z-10">{t.vitalSigns}</h3>
                        
                        <div className="space-y-4 sm:space-y-5 relative z-10">
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">Problem-Solution Fit</span>
                              <span className="text-xl font-black">{analysisResult.vitalSigns.problemSolutionFit}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.problemSolutionFit}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="h-full bg-blue-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">Scalability</span>
                              <span className="text-xl font-black">{analysisResult.vitalSigns.scalability}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.scalability}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">Defensibility</span>
                              <span className="text-xl font-black">{analysisResult.vitalSigns.defensibility}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.defensibility}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="h-full bg-purple-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">Operational Fitness</span>
                              <span className="text-xl font-black">{analysisResult.vitalSigns.operationalFitness}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.operationalFitness}%` }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="h-full bg-amber-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">External Resilience</span>
                              <span className="text-xl font-black">{analysisResult.vitalSigns.externalResilience}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult.vitalSigns.externalResilience}%` }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="h-full bg-rose-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                            <h3 className="text-base sm:text-lg font-black text-[#203260] dark:text-slate-100">{t.strengths}</h3>
                          </div>
                          <ul className="space-y-2.5">
                            {analysisResult.strengths.map((str: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                                <span className="leading-relaxed">{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                            <h3 className="text-base sm:text-lg font-black text-[#203260] dark:text-slate-100">{t.weaknesses}</h3>
                          </div>
                          <ul className="space-y-2.5">
                            {analysisResult.weaknesses.map((wk: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></div>
                                <span className="leading-relaxed">{wk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                            <h3 className="text-base sm:text-lg font-black text-[#203260] dark:text-slate-100">{t.opportunities}</h3>
                          </div>
                          <ul className="space-y-2.5">
                            {analysisResult.opportunities.map((opp: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>
                                <span className="leading-relaxed">{opp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
                            <h3 className="text-base sm:text-lg font-black text-[#203260] dark:text-slate-100">{t.threats}</h3>
                          </div>
                          <ul className="space-y-2.5">
                            {analysisResult.threats.map((thr: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></div>
                                <span className="leading-relaxed">{thr}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-base sm:text-lg font-black text-[#203260] dark:text-slate-100 mb-3">{t.feedback}</h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                          <ReactMarkdown>{analysisResult.feedback}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-5 sm:p-8 border border-amber-200 dark:border-amber-900/50">
                        <h3 className="text-base sm:text-lg font-black text-[#203260] dark:text-amber-400 mb-3">{t.conclusion}</h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                          <ReactMarkdown>{analysisResult.conclusion}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="p-4 sm:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <button
                    onClick={() => setView('wizard')}
                    className="w-full sm:w-auto px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-[#203260] dark:hover:text-slate-100 font-bold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {t.back}
                  </button>
                  <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={exportAnalysisToDoc}
                      disabled={!analysisResult}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-[#203260] dark:border-slate-700 text-[#203260] dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold shadow-sm disabled:opacity-50 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                    >
                      <Download className="w-4 h-4" />
                      {t.exportDoc} (.doc)
                    </button>
                    <button
                      onClick={exportBmcToDoc}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-[#203260] dark:border-slate-700 text-[#203260] dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold shadow-sm text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                    >
                      <Download className="w-4 h-4" />
                      Export BMC (.doc)
                    </button>
                    <button
                      onClick={generatePitch}
                      disabled={isGeneratingPitch || isAnalyzing}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FFB03A] text-slate-950 rounded-xl hover:bg-amber-400 transition-colors font-bold shadow-sm disabled:opacity-50 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                    >
                      {isGeneratingPitch ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto w-full"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-[#203260] dark:bg-slate-800 p-6 sm:p-10 text-white relative">
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                      <FileText className="w-5 h-5 text-[#FFB03A]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black">{t.elevatorPitch}</h2>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base relative z-10">{t.pitchDescription}</p>
                </div>
                
                <div className="p-4 sm:p-8 lg:p-10 min-h-[260px]">
                  {isGeneratingPitch ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#FFB03A]" />
                      <p className="font-bold text-base">{t.generatingPitch}</p>
                    </div>
                  ) : pitchError ? (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-6 text-rose-700 dark:text-rose-300 text-center font-bold">
                      {pitchError}
                    </div>
                  ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                      <ReactMarkdown>{pitchResult}</ReactMarkdown>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => setView('analysis')}
                    className="w-full sm:w-auto px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-[#203260] dark:hover:text-slate-100 font-bold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {t.back}
                  </button>
                  <button
                    onClick={exportPitchToDoc}
                    disabled={!pitchResult || isGeneratingPitch}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FFB03A] text-slate-950 rounded-xl hover:bg-amber-400 transition-colors font-bold shadow-sm disabled:opacity-50 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                  >
                    <Download className="w-4 h-4" />
                    {t.exportDoc} (.doc)
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Save & Export */}
        {showSaveModal && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div 
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowSaveModal(false)}
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-[110] border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setShowSaveModal(false)} 
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Save className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-[#203260] dark:text-slate-100">{t.saveModalTitle}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {t.saveModalDesc}
              </p>

              {lastAutosave && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-6">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{t.autosaved}: {lastAutosave}</span>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={downloadJsonBackup}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#203260] dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl hover:bg-[#1a284c] dark:hover:bg-amber-400 transition-colors shadow-sm text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t.downloadJson}
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="w-full py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Load & Restore */}
        {showLoadModal && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div 
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowLoadModal(false)}
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-[110] border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setShowLoadModal(false)} 
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-[#203260] dark:text-slate-100">{t.loadModalTitle}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                {t.loadModalDesc}
              </p>

              {loadNotice && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 text-center">
                  {loadNotice}
                </div>
              )}

              {/* Option 1: Browser Draft */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-4">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {t.savedDraftFound}
                </div>
                {savedDraftInfo ? (
                  <>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      {savedDraftInfo.timestamp || 'Draft'}
                    </div>
                    {savedDraftInfo.data?.valueProposition && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic mb-3">
                        &quot;{savedDraftInfo.data.valueProposition}&quot;
                      </p>
                    )}
                    <button
                      onClick={restoreDraft}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#203260] dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl hover:bg-[#1a284c] dark:hover:bg-amber-400 transition-colors text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t.loadThisDraft}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.noSavedDraft}</p>
                )}
              </div>

              {/* Option 2: Upload JSON */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-[#203260] dark:hover:border-amber-400 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors text-sm"
              >
                <Upload className="w-4 h-4 text-amber-500" />
                {t.uploadJson}
              </button>
            </div>
          </div>
        )}

        {/* Tutorial Overlay */}
        {isTutorialActive && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
          >
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => { setIsTutorialActive(false); setTutorialStepIndex(0); }}
            ></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl relative z-[110] border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/40 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 id="tutorial-title" className="text-xl sm:text-2xl font-black text-[#203260] dark:text-slate-100">{currentTutorialSteps[tutorialStepIndex].title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-sm sm:text-base">{currentTutorialSteps[tutorialStepIndex].content}</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                  {currentTutorialSteps.map((_: unknown, i: number) => (
                    <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === tutorialStepIndex ? 'bg-[#FFB03A] w-6' : 'bg-slate-200 dark:bg-slate-700 w-2'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  {tutorialStepIndex > 0 && (
                    <button 
                      onClick={() => setTutorialStepIndex((prev: number) => prev - 1)} 
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                    >
                      {t.back}
                    </button>
                  )}
                  {tutorialStepIndex < currentTutorialSteps.length - 1 ? (
                    <button 
                      onClick={() => setTutorialStepIndex((prev: number) => prev + 1)} 
                      className="px-5 py-2 bg-[#203260] dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl hover:bg-[#1a284c] dark:hover:bg-amber-400 transition-colors text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                    >
                      {t.next}
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setIsTutorialActive(false); setTutorialStepIndex(0); }} 
                      className="px-5 py-2 bg-[#FFB03A] text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                    >
                      {activeLanguage === 'en' ? 'Finish' : 'Selesai'}
                    </button>
                  )}
                </div>
              </div>
              <button 
                onClick={() => { setIsTutorialActive(false); setTutorialStepIndex(0); }} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203260]"
                aria-label="Close tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
