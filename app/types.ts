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

export const bmcSteps: { id: BmcStepId; title: string; shortName: string; question: string; placeholder: string; hint: string }[] = [
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
];
