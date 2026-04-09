export type BmcData = {
  customerSegments: string;
  valueProposition: string;
  channels: string;
  customerRelationships: string;
  revenueStreams: string;
  keyResources: string;
  keyActivities: string;
  keyPartnerships: string;
  costStructure: string;
};

export type BmcStepId = keyof BmcData;

export type BmcStep = {
  id: BmcStepId;
  title: string;
  shortName: string;
  question: string;
  placeholder: string;
  hint: string;
};

export const bmcSteps: Record<'en' | 'id', BmcStep[]> = {
  en: [
    { 
      id: 'customerSegments', 
      title: 'Customer Segments', 
      shortName: 'CS',
      question: 'Who are your main target customers? Who needs this solution most?',
      placeholder: 'Example: Students struggling to find internships, SMEs that haven\'t gone digital...',
      hint: 'Focus on one specific niche first. Don\'t try to serve everyone at the start.'
    },
    { 
      id: 'valueProposition', 
      title: 'Value Propositions', 
      shortName: 'VP',
      question: 'What urgent problem are you solving for customers, and why is your solution the best answer?',
      placeholder: 'Example: Office workers struggle to get healthy lunch quickly. Our solution is nutrition-precision catering with delivery under 20 mins.',
      hint: 'Don\'t just write the product. Write the biggest "Pain" people feel, and how you heal it.'
    },
    { 
      id: 'channels', 
      title: 'Channels', 
      shortName: 'CH',
      question: 'How will you reach those target markets?',
      placeholder: 'Example: Instagram Ads, Discord community, B2B Direct Sales...',
      hint: 'Choose channels where your target market spends most of their time.'
    },
    { 
      id: 'customerRelationships', 
      title: 'Customer Relationships', 
      shortName: 'CR',
      question: 'How do you interact and maintain relationships with customers?',
      placeholder: 'Example: 24/7 Customer service, Self-service via app, Exclusive community...',
      hint: 'Think about how to make customers loyal and prevent them from switching to competitors.'
    },
    { 
      id: 'revenueStreams', 
      title: 'Revenue Streams', 
      shortName: 'REV',
      question: 'Where does your business get money from? What is the pricing model?',
      placeholder: 'Example: Monthly subscription $5, 5% Commission per transaction...',
      hint: 'Make sure your revenue model makes sense and customers are willing to pay.'
    },
    { 
      id: 'keyResources', 
      title: 'Key Resources', 
      shortName: 'KR',
      question: 'What are the main assets needed to make this business run?',
      placeholder: 'Example: Talented developer team, Tech patents, Cloud servers...',
      hint: 'Assets can be physical, financial, intellectual, or human.'
    },
    { 
      id: 'keyActivities', 
      title: 'Key Activities', 
      shortName: 'KA',
      question: 'What main activities must be performed for this business model to succeed?',
      placeholder: 'Example: App development, Digital marketing, Market research...',
      hint: 'Focus on activities that directly create the Value Proposition.'
    },
    { 
      id: 'keyPartnerships', 
      title: 'Key Partnerships', 
      shortName: 'KP',
      question: 'Who are the main partners or suppliers you need?',
      placeholder: 'Example: Payment gateway (Midtrans), Local influencers, Universities...',
      hint: 'Good partners can help reduce risk or acquire resources.'
    },
    { 
      id: 'costStructure', 
      title: 'Cost Structure', 
      shortName: 'COST',
      question: 'What are the main expenses in running this business?',
      placeholder: 'Example: Employee salaries, AWS server costs, Marketing ads...',
      hint: 'Distinguish between fixed costs and variable costs.'
    },
  ],
  id: [
    { 
      id: 'customerSegments', 
      title: 'Customer Segments', 
      shortName: 'CS',
      question: 'Siapa target pasar utama Anda? Siapa yang paling membutuhkan solusi ini?',
      placeholder: 'Contoh: Mahasiswa yang kesulitan mencari tempat magang, UMKM yang belum go-digital...',
      hint: 'Fokus pada satu niche spesifik terlebih dahulu. Jangan mencoba melayani semua orang di awal.'
    },
    { 
      id: 'valueProposition', 
      title: 'Value Propositions', 
      shortName: 'VP',
      question: 'Masalah mendesak apa yang ingin Anda selesaikan bagi pelanggan, dan mengapa solusi Anda adalah jawaban terbaiknya?',
      placeholder: 'Contoh: Pekerja kantoran kesulitan mendapatkan makan siang sehat yang cepat. Solusi kami adalah langganan katering nutrisi presisi dengan pengantaran di bawah 20 menit.',
      hint: 'Jangan hanya tulis produk. Tulis \'Rasa Sakit\' yang paling besar yang dirasakan orang, dan bagaimana Anda menyembuhkannya.'
    },
    { 
      id: 'channels', 
      title: 'Channels', 
      shortName: 'CH',
      question: 'Bagaimana cara Anda menjangkau target pasar tersebut?',
      placeholder: 'Contoh: Iklan Instagram, Komunitas Discord, B2B Direct Sales...',
      hint: 'Pilih channel di mana target pasar Anda paling sering menghabiskan waktu.'
    },
    { 
      id: 'customerRelationships', 
      title: 'Customer Relationships', 
      shortName: 'CR',
      question: 'Bagaimana Anda berinteraksi dan menjaga hubungan dengan pelanggan?',
      placeholder: 'Contoh: Customer service 24/7, Self-service via aplikasi, Komunitas eksklusif...',
      hint: 'Pikirkan bagaimana cara membuat pelanggan loyal dan tidak pindah ke kompetitor.'
    },
    { 
      id: 'revenueStreams', 
      title: 'Revenue Streams', 
      shortName: 'REV',
      question: 'Dari mana bisnis Anda mendapatkan uang? Bagaimana model harganya?',
      placeholder: 'Contoh: Biaya langganan bulanan Rp 50.000, Komisi 5% per transaksi...',
      hint: 'Pastikan model pendapatan Anda masuk akal dan pelanggan bersedia membayarnya.'
    },
    { 
      id: 'keyResources', 
      title: 'Key Resources', 
      shortName: 'KR',
      question: 'Apa aset utama yang dibutuhkan agar bisnis ini bisa berjalan?',
      placeholder: 'Contoh: Tim developer handal, Hak paten teknologi, Server cloud...',
      hint: 'Aset bisa berupa fisik, finansial, intelektual, atau manusia.'
    },
    { 
      id: 'keyActivities', 
      title: 'Key Activities', 
      shortName: 'KA',
      question: 'Apa kegiatan utama yang harus dilakukan agar model bisnis ini berhasil?',
      placeholder: 'Contoh: Pengembangan aplikasi, Pemasaran digital, Riset pasar...',
      hint: 'Fokus pada aktivitas yang secara langsung menciptakan Value Proposition.'
    },
    { 
      id: 'keyPartnerships', 
      title: 'Key Partnerships', 
      shortName: 'KP',
      question: 'Siapa mitra utama atau supplier yang Anda butuhkan?',
      placeholder: 'Contoh: Payment gateway (Midtrans), Influencer lokal, Universitas...',
      hint: 'Mitra yang baik dapat membantu mengurangi risiko atau mendapatkan sumber daya.'
    },
    { 
      id: 'costStructure', 
      title: 'Cost Structure', 
      shortName: 'COST',
      question: 'Apa saja pengeluaran utama dalam menjalankan bisnis ini?',
      placeholder: 'Contoh: Gaji karyawan, Biaya server AWS, Biaya marketing ads...',
      hint: 'Bedakan antara biaya tetap (fixed cost) dan biaya variabel (variable cost).'
    },
  ]
};

