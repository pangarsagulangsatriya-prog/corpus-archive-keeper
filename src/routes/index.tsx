import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CorpusTable, SampleBadge } from "@/components/CorpusTable";
import { sampleDKJ, sampleKSK, sampleTempo } from "@/lib/corpus-data";
import type { DKJRow, KSKRow, TempoRow } from "@/lib/corpus-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pabrik Keindahan — Corpus Tables" },
      {
        name: "description",
        content:
          "Research database for DKJ, KSK, and Tempo literary corpora — award status, publication metadata, paratext, covers, and verification notes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const dkjCols = [
    { key: "id", label: "ID", render: (r: DKJRow) => <span className="font-mono">{r.id}{r.isSample && <SampleBadge />}</span> },
    { key: "jenis", label: "Jenis Sayembara", render: (r: DKJRow) => r.jenisSayembara },
    { key: "tahunMenang", label: "Tahun Menang", render: (r: DKJRow) => r.tahunMenang },
    { key: "posisi", label: "Posisi", render: (r: DKJRow) => r.posisi },
    { key: "judulNaskah", label: "Judul Naskah", render: (r: DKJRow) => r.judulNaskah },
    { key: "judulTerbit", label: "Judul Setelah Terbit", render: (r: DKJRow) => r.judulBukuSetelahTerbit },
    { key: "berubah", label: "Judul Berubah?", render: (r: DKJRow) => r.judulBerubah },
    { key: "pengarang", label: "Pengarang", render: (r: DKJRow) => r.pengarang },
    { key: "statusTerbit", label: "Status Terbit", render: (r: DKJRow) => r.statusTerbit },
    { key: "penerbit", label: "Penerbit", render: (r: DKJRow) => r.penerbit },
    { key: "tahunTerbit", label: "Tahun Terbit", render: (r: DKJRow) => r.tahunTerbit },
    { key: "jarak", label: "Jarak Menang→Terbit", render: (r: DKJRow) => r.jarakMenangTerbit },
    { key: "isbn", label: "ISBN", render: (r: DKJRow) => r.isbn },
    { key: "harga", label: "Harga", render: (r: DKJRow) => r.harga },
    { key: "halaman", label: "Halaman", render: (r: DKJRow) => r.jumlahHalaman },
    { key: "editor", label: "Editor", render: (r: DKJRow) => r.editor },
    { key: "desainer", label: "Desainer Sampul", render: (r: DKJRow) => r.desainerSampul },
    {
      key: "credit",
      label: "Halaman Kredit",
      render: (r: DKJRow) => (
        <button
          className="rounded-sm border border-border bg-background px-2 py-1 text-xs hover:bg-secondary"
          onClick={() => alert(r.halamanKreditNotes || "—")}
        >
          View Credit
        </button>
      ),
    },
    { key: "juri", label: "Juri", render: (r: DKJRow) => r.juri },
  ];

  const kskCols = [
    { key: "id", label: "ID", render: (r: KSKRow) => <span className="font-mono">{r.id}{r.isSample && <SampleBadge />}</span> },
    { key: "tahun", label: "Tahun KSK", render: (r: KSKRow) => r.tahunKSK },
    { key: "kategori", label: "Kategori", render: (r: KSKRow) => r.kategori },
    { key: "status", label: "Status KSK", render: (r: KSKRow) => r.statusKSK },
    { key: "judul", label: "Judul Buku", render: (r: KSKRow) => r.judulBuku },
    { key: "pengarang", label: "Pengarang", render: (r: KSKRow) => r.pengarang },
    { key: "penerbit", label: "Penerbit", render: (r: KSKRow) => r.penerbit },
    { key: "tahunTerbit", label: "Tahun Terbit", render: (r: KSKRow) => r.tahunTerbit },
    { key: "isbn", label: "ISBN", render: (r: KSKRow) => r.isbn },
    { key: "harga", label: "Harga", render: (r: KSKRow) => r.harga },
    { key: "halaman", label: "Halaman", render: (r: KSKRow) => r.jumlahHalaman },
    { key: "editor", label: "Editor", render: (r: KSKRow) => r.editor },
    { key: "desainer", label: "Desainer Sampul", render: (r: KSKRow) => r.desainerSampul },
    {
      key: "credit",
      label: "Halaman Kredit",
      render: (r: KSKRow) => (
        <button
          className="rounded-sm border border-border bg-background px-2 py-1 text-xs hover:bg-secondary"
          onClick={() => alert(r.halamanKreditNotes || "—")}
        >
          View Credit
        </button>
      ),
    },
    { key: "juri", label: "Juri / Catatan Kurasi", render: (r: KSKRow) => r.juriCatatan },
  ];

  const tempoCols = [
    { key: "id", label: "ID", render: (r: TempoRow) => <span className="font-mono">{r.id}{r.isSample && <SampleBadge />}</span> },
    { key: "tahun", label: "Tahun Tempo", render: (r: TempoRow) => r.tahunTempo },
    { key: "kategori", label: "Kategori", render: (r: TempoRow) => r.kategori },
    { key: "status", label: "Status Tempo", render: (r: TempoRow) => r.statusTempo },
    { key: "judul", label: "Judul Buku", render: (r: TempoRow) => r.judulBuku },
    { key: "pengarang", label: "Pengarang", render: (r: TempoRow) => r.pengarang },
    { key: "penerbit", label: "Penerbit", render: (r: TempoRow) => r.penerbit },
    { key: "tahunTerbit", label: "Tahun Terbit", render: (r: TempoRow) => r.tahunTerbit },
    { key: "isbn", label: "ISBN", render: (r: TempoRow) => r.isbn },
    { key: "harga", label: "Harga", render: (r: TempoRow) => r.harga },
    { key: "halaman", label: "Halaman", render: (r: TempoRow) => r.jumlahHalaman },
    { key: "editor", label: "Editor", render: (r: TempoRow) => r.editor },
    { key: "desainer", label: "Desainer Sampul", render: (r: TempoRow) => r.desainerSampul },
    {
      key: "artikel",
      label: "Artikel Tempo",
      render: (r: TempoRow) => (
        <a
          className="rounded-sm border border-border bg-background px-2 py-1 text-xs hover:bg-secondary"
          href={r.linkArtikel}
          target="_blank"
          rel="noreferrer"
        >
          View Article
        </a>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Research Database</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Pabrik Keindahan <span className="text-muted-foreground">— Corpus Tables</span>
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Research database for DKJ, KSK, and Tempo literary corpora, focused on award status,
            publication metadata, paratext evidence, cover files, and verification notes.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        <Tabs defaultValue="dkj" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="dkj">Korpus DKJ</TabsTrigger>
            <TabsTrigger value="ksk">Korpus KSK</TabsTrigger>
            <TabsTrigger value="tempo">Korpus Tempo</TabsTrigger>
          </TabsList>
          <TabsContent value="dkj">
            <CorpusTable<DKJRow> rows={sampleDKJ} corpusPath="dkj" extraColumns={dkjCols} />
          </TabsContent>
          <TabsContent value="ksk">
            <CorpusTable<KSKRow> rows={sampleKSK} corpusPath="ksk" extraColumns={kskCols} />
          </TabsContent>
          <TabsContent value="tempo">
            <CorpusTable<TempoRow> rows={sampleTempo} corpusPath="tempo" extraColumns={tempoCols} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
