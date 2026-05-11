-- 1. Buat tabel utama `books`
CREATE TABLE public.books (
  -- IDENTITAS DASAR
  id TEXT PRIMARY KEY,
  corpus TEXT NOT NULL, -- Nilai: 'DKJ', 'KSK', atau 'Tempo'
  isSample BOOLEAN DEFAULT false,
  verificationStatus TEXT,
  nextAction TEXT,
  halamanKreditNotes TEXT,
  pengarang TEXT,
  
  -- KOLOM UMUM (Sering muncul di berbagai korpus)
  judulBuku TEXT,
  penerbit TEXT,
  tahunTerbit TEXT,
  isbn TEXT,
  harga TEXT,
  jumlahHalaman TEXT,
  editor TEXT,
  desainerSampul TEXT,
  kategori TEXT,
  linkPengumuman TEXT,
  
  -- KHUSUS KORPUS DKJ
  jenisSayembara TEXT,
  tahunMenang TEXT,
  posisi TEXT,
  judulNaskah TEXT,
  judulBukuSetelahTerbit TEXT,
  judulBerubah TEXT,
  statusTerbit TEXT,
  jarakMenangTerbit TEXT,
  juri TEXT,
  pertanggungjawabanJuri TEXT,
  kutipanJuri TEXT,
  
  -- KHUSUS KORPUS KSK
  tahunKSK TEXT,
  statusKSK TEXT,
  juriCatatan TEXT,
  
  -- KHUSUS KORPUS TEMPO
  tahunTempo TEXT,
  statusTempo TEXT,
  artikelTempo TEXT,
  kutipanTempo TEXT,
  linkArtikel TEXT,

  -- DATA OBJEK BERSARANG (JSONB)
  -- Menyimpan data yang strukturnya kompleks seperti array atau nested object
  frontCover JSONB DEFAULT '{}'::jsonb,
  backCover JSONB DEFAULT '{}'::jsonb,
  paratext JSONB DEFAULT '{}'::jsonb,
  research JSONB DEFAULT '{}'::jsonb,
  published JSONB DEFAULT '{}'::jsonb,
  evidence JSONB DEFAULT '[]'::jsonb, -- Array of objects
  
  -- METADATA SISTEM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Keamanan Baris (Row Level Security / RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 3. Buat Kebijakan Akses (Policy)
-- Mengizinkan siapa saja (anonim) untuk membaca, menambah, mengubah, dan menghapus data
CREATE POLICY "Allow public read access" 
  ON public.books 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access" 
  ON public.books 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access" 
  ON public.books 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow public delete access" 
  ON public.books 
  FOR DELETE 
  USING (true);

-- ==========================================
-- CONTOH INSERT DATA (OPSIONAL)
-- Jalankan ini jika ingin langsung melihat hasilnya di tabel Vercel Anda
-- ==========================================

INSERT INTO public.books (
  id, corpus, pengarang, judulNaskah, judulBuku, tahunMenang, posisi, jenisSayembara, statusTerbit, penerbit, tahunTerbit, verificationStatus, frontCover, backCover, paratext, research, evidence, published
) VALUES (
  'DKJ-001', 
  'DKJ', 
  'Arafat Nur', 
  'Lampuki', 
  'Lampuki',
  '2014', 
  'Pemenang I', 
  'Novel',
  'Terbit',
  'Serambi',
  '2015',
  'Pending',
  '{"sourceType": "Penerbit (web)", "sourceUrl": "https://example.com", "imageUrl": ""}',
  '{"sourceType": "Penerbit (web)", "sourceUrl": "https://example.com", "imageUrl": ""}',
  '{"sinopsisPenerbit": "Sebuah novel yang menelusuri lorong ingatan...", "labelGenre": "Fiksi / Novel"}',
  '{"kataPromosiDominan": "puitis, muram, jujur", "labelGenre": "Fiksi sastra"}',
  '[{"sourceType": "Situs resmi", "confidence": "High", "excerpt": "ditetapkan sebagai pemenang"}]',
  '{"judulBuku": "Lampuki", "penerbit": "Serambi", "tahunTerbit": "2015", "isbn": "978-979-024-000-0"}'
);
