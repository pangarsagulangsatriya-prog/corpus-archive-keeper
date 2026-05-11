import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CorpusTable, SampleBadge } from "@/components/CorpusTable";
import { fetchCorpusData } from "@/lib/corpus-data";
import type { DKJRow, KSKRow, TempoRow } from "@/lib/corpus-data";

import { ImportMarkdownDialog } from "@/components/ImportMarkdownDialog";

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
    { key: "judulNaskah", label: "Judul", render: (r: DKJRow) => r.judulNaskah || (r as any).judulnaskah },
    { key: "tahunMenang", label: "Tahun", render: (r: DKJRow) => r.tahunMenang || (r as any).tahunmenang },
    { key: "posisi", label: "Posisi", render: (r: DKJRow) => r.posisi },
    { key: "pengarang", label: "Pengarang", render: (r: DKJRow) => r.pengarang },
    { key: "frontCover", label: "FC", render: (r: DKJRow) => r.frontCover?.edition2?.imageUrl ? <span className="text-blue-500 font-bold" title="Edisi 2">✓</span> : r.frontCover?.imageUrl ? <span className="text-green-500 font-bold" title="Edisi 1">✓</span> : <span className="text-muted-foreground">○</span> },
    { key: "backCover", label: "BC", render: (r: DKJRow) => r.backCover?.edition2?.imageUrl ? <span className="text-blue-500 font-bold" title="Edisi 2">✓</span> : r.backCover?.imageUrl ? <span className="text-green-500 font-bold" title="Edisi 1">✓</span> : <span className="text-muted-foreground">○</span> },
    { key: "creditPage", label: "CP", render: (r: DKJRow) => (r.published?.editor || r.published?.desainerSampul) ? <span className="text-green-500 font-bold">✓</span> : <span className="text-muted-foreground">○</span> },
  ];

  const kskCols = [
    { key: "id", label: "ID", render: (r: KSKRow) => <span className="font-mono">{r.id}{r.isSample && <SampleBadge />}</span> },
    { key: "judul", label: "Judul", render: (r: KSKRow) => r.judulBuku || (r as any).judulbuku },
    { key: "tahun", label: "Tahun", render: (r: KSKRow) => r.tahunKSK || (r as any).tahunksk },
    { key: "status", label: "Posisi", render: (r: KSKRow) => r.statusKSK || (r as any).statusksk },
    { key: "pengarang", label: "Pengarang", render: (r: KSKRow) => r.pengarang },
    { key: "frontCover", label: "FC", render: (r: KSKRow) => r.frontCover?.edition2?.imageUrl ? <span className="text-blue-500 font-bold" title="Edisi 2">✓</span> : r.frontCover?.imageUrl ? <span className="text-green-500 font-bold" title="Edisi 1">✓</span> : <span className="text-muted-foreground">○</span> },
    { key: "backCover", label: "BC", render: (r: KSKRow) => r.backCover?.edition2?.imageUrl ? <span className="text-blue-500 font-bold" title="Edisi 2">✓</span> : r.backCover?.imageUrl ? <span className="text-green-500 font-bold" title="Edisi 1">✓</span> : <span className="text-muted-foreground">○</span> },
    { key: "creditPage", label: "CP", render: (r: KSKRow) => (r.published?.editor || r.published?.desainerSampul) ? <span className="text-green-500 font-bold">✓</span> : <span className="text-muted-foreground">○</span> },
  ];

  const tempoCols = [
    { key: "id", label: "ID", render: (r: TempoRow) => <span className="font-mono">{r.id}{r.isSample && <SampleBadge />}</span> },
    { key: "judul", label: "Judul", render: (r: TempoRow) => r.judulBuku || (r as any).judulbuku },
    { key: "tahun", label: "Tahun", render: (r: TempoRow) => r.tahunTempo || (r as any).tahuntempo },
    { key: "status", label: "Posisi", render: (r: TempoRow) => r.statusTempo || (r as any).statustempo },
    { key: "pengarang", label: "Pengarang", render: (r: TempoRow) => r.pengarang },
    { key: "frontCover", label: "FC", render: (r: TempoRow) => r.frontCover?.edition2?.imageUrl ? <span className="text-blue-500 font-bold" title="Edisi 2">✓</span> : r.frontCover?.imageUrl ? <span className="text-green-500 font-bold" title="Edisi 1">✓</span> : <span className="text-muted-foreground">○</span> },
    { key: "backCover", label: "BC", render: (r: TempoRow) => r.backCover?.edition2?.imageUrl ? <span className="text-blue-500 font-bold" title="Edisi 2">✓</span> : r.backCover?.imageUrl ? <span className="text-green-500 font-bold" title="Edisi 1">✓</span> : <span className="text-muted-foreground">○</span> },
    { key: "creditPage", label: "CP", render: (r: TempoRow) => (r.published?.editor || r.published?.desainerSampul) ? <span className="text-green-500 font-bold">✓</span> : <span className="text-muted-foreground">○</span> },
  ];

  const { data: dkjData = [], isLoading: isDkjLoading } = useQuery({
    queryKey: ['corpus', 'DKJ'],
    queryFn: () => fetchCorpusData('DKJ')
  });

  const { data: kskData = [], isLoading: isKskLoading } = useQuery({
    queryKey: ['corpus', 'KSK'],
    queryFn: () => fetchCorpusData('KSK')
  });

  const { data: tempoData = [], isLoading: isTempoLoading } = useQuery({
    queryKey: ['corpus', 'Tempo'],
    queryFn: () => fetchCorpusData('Tempo')
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-6 py-8 relative">
          <div className="absolute top-8 right-6">
            <ImportMarkdownDialog />
          </div>
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
            {isDkjLoading ? <div className="p-4 text-sm text-muted-foreground">Loading...</div> : <CorpusTable<DKJRow> rows={dkjData as DKJRow[]} corpusPath="dkj" extraColumns={dkjCols} />}
          </TabsContent>
          <TabsContent value="ksk">
            {isKskLoading ? <div className="p-4 text-sm text-muted-foreground">Loading...</div> : <CorpusTable<KSKRow> rows={kskData as KSKRow[]} corpusPath="ksk" extraColumns={kskCols} />}
          </TabsContent>
          <TabsContent value="tempo">
            {isTempoLoading ? <div className="p-4 text-sm text-muted-foreground">Loading...</div> : <CorpusTable<TempoRow> rows={tempoData as TempoRow[]} corpusPath="tempo" extraColumns={tempoCols} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
