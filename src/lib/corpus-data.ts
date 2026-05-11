export type VerificationStatus = "Verified" | "Needs Manual Check" | "Pending" | "In Progress";

export type EvidenceItem = {
  sourceUrl: string;
  sourceType: string;
  excerpt: string;
  reason: string;
  confidence: "High" | "Medium" | "Low";
  accessDate: string;
  notes: string;
  nextAction: string;
};

export type CoverFile = {
  imageUrl?: string;
  sourceType: string;
  sourceUrl: string;
  directImageUrl: string;
  resolutionQuality: string;
  awardLabelVisible: "Ya" | "Tidak" | "Tidak jelas";
  visualNotes: string;
  verificationStatus: VerificationStatus;
};

export type ParatextBlock = {
  sinopsisPenerbit: string;
  sinopsisToko: string;
  sinopsisGoogleBooks: string;
  sinopsisGoodreads: string;
  sinopsisMarketplace: string;
  teksSampulBelakang: string;
  blurb1: string;
  pemberiBlurb1: string;
  blurb2: string;
  pemberiBlurb2: string;
  barcodeVisible: "Ya" | "Tidak";
  hargaVisible: "Ya" | "Tidak";
  logoPenerbitVisible: "Ya" | "Tidak";
  labelGenre: string;
  teksPromosi: string;
};

export type ResearchCoding = {
  kataPromosiDominan: string;
  labelGenre: string;
  klaimEstetika: string;
  keywordTrauma: "Ya" | "Tidak" | "Tidak jelas";
  keywordDistopia: "Ya" | "Tidak" | "Tidak jelas";
  keywordMuram: "Ya" | "Tidak" | "Tidak jelas";
  keywordMaterialitas: "Ya" | "Tidak" | "Tidak jelas";
  warnaDominan: string;
  objekDominan: string;
  nuansaVisual: string;
  catatanPeneliti: string;
};

export type PublishedMeta = {
  judulBuku: string;
  penerbit: string;
  imprint: string;
  tahunTerbit: string;
  isbn: string;
  harga: string;
  jumlahHalaman: string;
  cetakan: string;
  editor: string;
  penyunting: string;
  proofreader: string;
  desainerSampul: string;
  ilustrator: string;
  layoutDesigner: string;
};

type Base = {
  id: string;
  pengarang: string;
  verificationStatus: VerificationStatus;
  nextAction: string;
  isSample: boolean;
  frontCover: CoverFile;
  backCover: CoverFile;
  paratext: ParatextBlock;
  research: ResearchCoding;
  evidence: EvidenceItem[];
  published: PublishedMeta;
  halamanKreditNotes: string;
};

export type DKJRow = Base & {
  corpus: "DKJ";
  jenisSayembara: "Novel" | "Manuskrip Puisi";
  tahunMenang: string;
  posisi: string;
  judulNaskah: string;
  judulBukuSetelahTerbit: string;
  judulBerubah: "Ya" | "Tidak";
  statusTerbit: string;
  penerbit: string;
  tahunTerbit: string;
  jarakMenangTerbit: string;
  isbn: string;
  harga: string;
  jumlahHalaman: string;
  editor: string;
  desainerSampul: string;
  juri: string;
  pertanggungjawabanJuri: string;
  kutipanJuri: string;
  linkPengumuman: string;
};

export type KSKRow = Base & {
  corpus: "KSK";
  tahunKSK: string;
  kategori: string;
  statusKSK: "Winner" | "Shortlist" | "Longlist" | "Nominee" | "Needs Manual Check";
  judulBuku: string;
  penerbit: string;
  tahunTerbit: string;
  isbn: string;
  harga: string;
  jumlahHalaman: string;
  editor: string;
  desainerSampul: string;
  juriCatatan: string;
  linkPengumuman: string;
};

export type TempoRow = Base & {
  corpus: "Tempo";
  tahunTempo: string;
  kategori: string;
  statusTempo:
    | "Winner"
    | "Top 3"
    | "Top 5"
    | "Top 10"
    | "Longlist"
    | "Reviewed Only"
    | "Retracted / Metadata Issue"
    | "Needs Manual Check";
  judulBuku: string;
  penerbit: string;
  tahunTerbit: string;
  isbn: string;
  harga: string;
  jumlahHalaman: string;
  editor: string;
  desainerSampul: string;
  artikelTempo: string;
  kutipanTempo: string;
  linkArtikel: string;
};

const sampleCover = (label: string): CoverFile => ({
  sourceType: "Penerbit (web)",
  sourceUrl: "https://example.com/cover-source",
  directImageUrl: "https://example.com/cover.jpg",
  resolutionQuality: "Medium (800x1200)",
  awardLabelVisible: "Tidak jelas",
  visualNotes: `Sampel catatan untuk ${label}.`,
  verificationStatus: "Pending",
});

const sampleParatext = (): ParatextBlock => ({
  sinopsisPenerbit:
    "Sebuah novel yang menelusuri lorong-lorong ingatan keluarga dan kota yang perlahan berubah. Sinopsis ini adalah contoh placeholder.",
  sinopsisToko: "Sinopsis dari toko buku daring (sampel).",
  sinopsisGoogleBooks: "Sinopsis Google Books (sampel).",
  sinopsisGoodreads: "Sinopsis Goodreads (sampel).",
  sinopsisMarketplace: "Sinopsis marketplace (sampel).",
  teksSampulBelakang:
    "Teks sampul belakang berisi penggalan kalimat puitis dan sebaris label penghargaan. (sampel)",
  blurb1: "Sebuah suara yang jernih dan tak ragu. (blurb sampel)",
  pemberiBlurb1: "Kritikus A",
  blurb2: "Karya yang menolak kompromi. (blurb sampel)",
  pemberiBlurb2: "Penulis B",
  barcodeVisible: "Ya",
  hargaVisible: "Tidak",
  logoPenerbitVisible: "Ya",
  labelGenre: "Fiksi / Novel",
  teksPromosi: "Pemenang sayembara — edisi cetak pertama.",
});

const sampleResearch = (): ResearchCoding => ({
  kataPromosiDominan: "puitis, muram, jujur",
  labelGenre: "Fiksi sastra",
  klaimEstetika: "Realisme liris",
  keywordTrauma: "Ya",
  keywordDistopia: "Tidak",
  keywordMuram: "Ya",
  keywordMaterialitas: "Tidak jelas",
  warnaDominan: "Hijau gelap, krem",
  objekDominan: "Pohon, jendela",
  nuansaVisual: "Tenang, sedikit melankolis",
  catatanPeneliti: "Perlu cek edisi cetak ulang.",
});

const sampleEvidence = (): EvidenceItem[] => [
  {
    sourceUrl: "https://example.com/pengumuman",
    sourceType: "Situs resmi",
    excerpt: "“…ditetapkan sebagai pemenang…”",
    reason: "Konfirmasi status pemenang.",
    confidence: "High",
    accessDate: "2025-03-12",
    notes: "Sampel evidensi.",
    nextAction: "Verifikasi tahun terbit.",
  },
];

const samplePublished = (over: Partial<PublishedMeta>): PublishedMeta => ({
  judulBuku: "Judul Buku Setelah Terbit",
  penerbit: "Penerbit Contoh",
  imprint: "—",
  tahunTerbit: "2020",
  isbn: "978-602-0000-00-0",
  harga: "Rp 95.000",
  jumlahHalaman: "240",
  cetakan: "Cetakan pertama",
  editor: "Editor Contoh",
  penyunting: "—",
  proofreader: "—",
  desainerSampul: "Desainer Contoh",
  ilustrator: "—",
  layoutDesigner: "—",
  ...over,
});

export const sampleDKJ: DKJRow[] = [
  {
    corpus: "DKJ",
    id: "DKJ-001",
    jenisSayembara: "Novel",
    tahunMenang: "2014",
    posisi: "Pemenang I",
    judulNaskah: "Lampuki",
    judulBukuSetelahTerbit: "Lampuki",
    judulBerubah: "Tidak",
    pengarang: "Arafat Nur",
    statusTerbit: "Terbit",
    penerbit: "Serambi",
    tahunTerbit: "2015",
    jarakMenangTerbit: "1 tahun",
    isbn: "978-979-024-000-0",
    harga: "Rp 75.000",
    jumlahHalaman: "320",
    editor: "Tim Serambi",
    desainerSampul: "—",
    juri: "Juri DKJ 2014",
    pertanggungjawabanJuri: "Dokumen pertanggungjawaban juri (sampel).",
    kutipanJuri: "“Naskah ini menampilkan suara baru dari Aceh…”",
    linkPengumuman: "https://example.com/dkj-2014",
    verificationStatus: "Pending",
    nextAction: "Verifikasi ISBN dan cover belakang.",
    isSample: true,
    halamanKreditNotes: "Halaman kredit belum dipindai.",
    frontCover: sampleCover("DKJ Front"),
    backCover: sampleCover("DKJ Back"),
    paratext: sampleParatext(),
    research: sampleResearch(),
    evidence: sampleEvidence(),
    published: samplePublished({ judulBuku: "Lampuki", penerbit: "Serambi", tahunTerbit: "2015" }),
  },
  {
    corpus: "DKJ",
    id: "DKJ-002",
    jenisSayembara: "Manuskrip Puisi",
    tahunMenang: "2017",
    posisi: "Pemenang Utama",
    judulNaskah: "Manuskrip Puisi A",
    judulBukuSetelahTerbit: "Buku Puisi A",
    judulBerubah: "Ya",
    pengarang: "Nama Penyair",
    statusTerbit: "Terbit",
    penerbit: "Gramedia",
    tahunTerbit: "2019",
    jarakMenangTerbit: "2 tahun",
    isbn: "978-602-1111-11-1",
    harga: "Rp 85.000",
    jumlahHalaman: "120",
    editor: "—",
    desainerSampul: "—",
    juri: "Juri DKJ 2017",
    pertanggungjawabanJuri: "—",
    kutipanJuri: "“Bahasa puisi yang padat dan hening.”",
    linkPengumuman: "https://example.com/dkj-2017",
    verificationStatus: "Needs Manual Check",
    nextAction: "Cari sampul belakang.",
    isSample: true,
    halamanKreditNotes: "—",
    frontCover: sampleCover("DKJ Front"),
    backCover: sampleCover("DKJ Back"),
    paratext: sampleParatext(),
    research: sampleResearch(),
    evidence: sampleEvidence(),
    published: samplePublished({ judulBuku: "Buku Puisi A", penerbit: "Gramedia", tahunTerbit: "2019" }),
  },
];

export const sampleKSK: KSKRow[] = [
  {
    corpus: "KSK",
    id: "KSK-001",
    tahunKSK: "2010",
    kategori: "Prosa",
    statusKSK: "Winner",
    judulBuku: "Judul Prosa A",
    pengarang: "Pengarang A",
    penerbit: "Penerbit A",
    tahunTerbit: "2009",
    isbn: "978-602-2222-22-2",
    harga: "Rp 110.000",
    jumlahHalaman: "280",
    editor: "Editor A",
    desainerSampul: "Desainer A",
    juriCatatan: "Catatan kurasi (sampel).",
    linkPengumuman: "https://example.com/ksk-2010",
    verificationStatus: "Verified",
    nextAction: "—",
    isSample: true,
    halamanKreditNotes: "—",
    frontCover: sampleCover("KSK Front"),
    backCover: sampleCover("KSK Back"),
    paratext: sampleParatext(),
    research: sampleResearch(),
    evidence: sampleEvidence(),
    published: samplePublished({ judulBuku: "Judul Prosa A", penerbit: "Penerbit A", tahunTerbit: "2009" }),
  },
  {
    corpus: "KSK",
    id: "KSK-002",
    tahunKSK: "2012",
    kategori: "Puisi",
    statusKSK: "Shortlist",
    judulBuku: "Judul Puisi B",
    pengarang: "Pengarang B",
    penerbit: "Penerbit B",
    tahunTerbit: "2011",
    isbn: "—",
    harga: "—",
    jumlahHalaman: "—",
    editor: "—",
    desainerSampul: "—",
    juriCatatan: "—",
    linkPengumuman: "https://example.com/ksk-2012",
    verificationStatus: "Pending",
    nextAction: "Verifikasi ISBN.",
    isSample: true,
    halamanKreditNotes: "—",
    frontCover: sampleCover("KSK Front"),
    backCover: sampleCover("KSK Back"),
    paratext: sampleParatext(),
    research: sampleResearch(),
    evidence: sampleEvidence(),
    published: samplePublished({ judulBuku: "Judul Puisi B", penerbit: "Penerbit B", tahunTerbit: "2011" }),
  },
];

export const sampleTempo: TempoRow[] = [
  {
    corpus: "Tempo",
    id: "TMP-001",
    tahunTempo: "2018",
    kategori: "Prosa",
    statusTempo: "Winner",
    judulBuku: "Buku Tempo A",
    pengarang: "Pengarang T",
    penerbit: "Penerbit T",
    tahunTerbit: "2018",
    isbn: "978-602-3333-33-3",
    harga: "Rp 95.000",
    jumlahHalaman: "210",
    editor: "Editor T",
    desainerSampul: "Desainer T",
    artikelTempo: "Artikel Tempo edisi akhir tahun (sampel).",
    kutipanTempo: "“Buku ini menyusun ulang cara kita membaca…”",
    linkArtikel: "https://example.com/tempo-2018",
    verificationStatus: "Verified",
    nextAction: "—",
    isSample: true,
    halamanKreditNotes: "—",
    frontCover: sampleCover("Tempo Front"),
    backCover: sampleCover("Tempo Back"),
    paratext: sampleParatext(),
    research: sampleResearch(),
    evidence: sampleEvidence(),
    published: samplePublished({ judulBuku: "Buku Tempo A", penerbit: "Penerbit T", tahunTerbit: "2018" }),
  },
  {
    corpus: "Tempo",
    id: "TMP-002",
    tahunTempo: "2020",
    kategori: "Puisi",
    statusTempo: "Top 5",
    judulBuku: "Buku Tempo B",
    pengarang: "Pengarang U",
    penerbit: "Penerbit U",
    tahunTerbit: "2020",
    isbn: "—",
    harga: "—",
    jumlahHalaman: "—",
    editor: "—",
    desainerSampul: "—",
    artikelTempo: "—",
    kutipanTempo: "—",
    linkArtikel: "https://example.com/tempo-2020",
    verificationStatus: "Needs Manual Check",
    nextAction: "Konfirmasi posisi di artikel.",
    isSample: true,
    halamanKreditNotes: "—",
    frontCover: sampleCover("Tempo Front"),
    backCover: sampleCover("Tempo Back"),
    paratext: sampleParatext(),
    research: sampleResearch(),
    evidence: sampleEvidence(),
    published: samplePublished({ judulBuku: "Buku Tempo B", penerbit: "Penerbit U", tahunTerbit: "2020" }),
  },
];

export type AnyRow = DKJRow | KSKRow | TempoRow;

import { supabase } from './supabase';

export const fetchCorpusData = async (corpus: "DKJ" | "KSK" | "Tempo"): Promise<AnyRow[]> => {
  try {
    // Attempt to fetch from Supabase table 'books'
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('corpus', corpus);

    if (error) {
      console.warn(`Supabase fetch failed for ${corpus}, falling back to static data. Error:`, error.message);
      throw error;
    }

    if (data && data.length > 0) {
      return data as AnyRow[];
    }
    
    // If no data, fallback to static
    console.log(`No data in Supabase for ${corpus}, using static fallback.`);
  } catch (e) {
    // Fallback on error
  }

  const list: AnyRow[] =
    corpus === "DKJ" ? sampleDKJ : corpus === "KSK" ? sampleKSK : sampleTempo;
  return list;
};

export const fetchRow = async (corpus: "DKJ" | "KSK" | "Tempo", id: string): Promise<AnyRow | undefined> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('corpus', corpus)
      .eq('id', id)
      .single();

    if (!error && data) {
      return data as AnyRow;
    }
  } catch (e) {
    // Fallback on error
  }

  const list: AnyRow[] =
    corpus === "DKJ" ? sampleDKJ : corpus === "KSK" ? sampleKSK : sampleTempo;
  return list.find((r) => r.id === id);
};

export const findRow = (corpus: "DKJ" | "KSK" | "Tempo", id: string): AnyRow | undefined => {
  // Legacy sync version for existing code that hasn't been migrated
  const list: AnyRow[] =
    corpus === "DKJ" ? sampleDKJ : corpus === "KSK" ? sampleKSK : sampleTempo;
  return list.find((r) => r.id === id);
};
