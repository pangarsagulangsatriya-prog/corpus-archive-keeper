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
    { key: "judulNaskah", label: "Judul", render: (r: DKJRow) => r.judulNaskah },
    { key: "tahunMenang", label: "Tahun", render: (r: DKJRow) => r.tahunMenang },
    { key: "posisi", label: "Posisi", render: (r: DKJRow) => r.posisi },
    { key: "pengarang", label: "Pengarang", render: (r: DKJRow) => r.pengarang },
  ];

  const kskCols = [
    { key: "id", label: "ID", render: (r: KSKRow) => <span className="font-mono">{r.id}{r.isSample && <SampleBadge />}</span> },
    { key: "judul", label: "Judul", render: (r: KSKRow) => r.judulBuku },
    { key: "tahun", label: "Tahun", render: (r: KSKRow) => r.tahunKSK },
    { key: "status", label: "Posisi", render: (r: KSKRow) => r.statusKSK },
    { key: "pengarang", label: "Pengarang", render: (r: KSKRow) => r.pengarang },
  ];

  const tempoCols = [
    { key: "id", label: "ID", render: (r: TempoRow) => <span className="font-mono">{r.id}{r.isSample && <SampleBadge />}</span> },
    { key: "judul", label: "Judul", render: (r: TempoRow) => r.judulBuku },
    { key: "tahun", label: "Tahun", render: (r: TempoRow) => r.tahunTempo },
    { key: "status", label: "Posisi", render: (r: TempoRow) => r.statusTempo },
    { key: "pengarang", label: "Pengarang", render: (r: TempoRow) => r.pengarang },
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
