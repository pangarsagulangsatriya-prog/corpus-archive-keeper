import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnyRow, CoverFile } from "@/lib/corpus-data";
import { CreateManualDialog } from "@/components/CreateManualDialog";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from "lucide-react";



type Col<T> = {
  key: string;
  label: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
};

type Modal =
  | { kind: "cover"; title: string; cover: CoverFile }
  | { kind: "text"; title: string; text: string }
  | { kind: "evidence"; title: string; row: AnyRow }
  | { kind: "delete"; title: string; row: AnyRow }
  | null;

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Verified"
      ? "bg-[oklch(0.92_0.05_155)] text-[oklch(0.3_0.06_155)] border-[oklch(0.6_0.05_155)]"
      : status === "Needs Manual Check"
        ? "bg-[oklch(0.95_0.06_55)] text-[oklch(0.4_0.12_55)] border-[oklch(0.65_0.1_55)]"
        : "bg-secondary text-foreground border-border";
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {status}
    </span>
  );
}

export function CorpusTable<T extends AnyRow>({
  rows,
  corpusPath,
  extraColumns,
  filtersExtra,
}: {
  rows: T[];
  corpusPath: "dkj" | "ksk" | "tempo";
  extraColumns: Col<T>[];
  filtersExtra?: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [year, setYear] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [missingFilter, setMissingFilter] = useState("");
  const [posisiFilter, setPosisiFilter] = useState("");
  const queryClient = useQueryClient();

  const uniquePositions = useMemo(() => {
    const options = new Set<string>();
    rows.forEach((r: any) => {
      const p = r.posisi || r.statusKSK || r.statusTempo || r.statusksk || r.statustempo;
      if (p) options.add(p);
    });
    return Array.from(options).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const result = rows.filter((r) => {
      const q = search.toLowerCase();
      const hay = `${r.judulBuku || r.judulNaskah || ""} ${r.pengarang || ""} ${r.published?.penerbit || ""}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      
      const rYear = r.tahunMenang || r.tahunKSK || r.tahunTempo || r.tahunmenang || r.tahunksk || r.tahuntempo || "";
      if (year && !rYear.toString().includes(year)) return false;

      const rPosisi = r.posisi || r.statusKSK || r.statusTempo || r.statusksk || r.statustempo || "";
      if (posisiFilter && rPosisi !== posisiFilter) return false;
      
      const hasFC = !!(r.frontCover?.imageUrl || r.frontCover?.edition2?.imageUrl);
      const hasBC = !!(r.backCover?.imageUrl || r.backCover?.edition2?.imageUrl);
      const hasPT = !!(r.paratext?.sinopsisPenerbit || r.paratext?.blurb1 || (r.paratext?.rawSynopsisSources && r.paratext.rawSynopsisSources.length > 0));
      
      if (missingFilter === "no_fc" && hasFC) return false;
      if (missingFilter === "has_fc" && !hasFC) return false;
      if (missingFilter === "no_bc" && hasBC) return false;
      if (missingFilter === "has_bc" && !hasBC) return false;
      if (missingFilter === "no_pt" && hasPT) return false;
      if (missingFilter === "has_pt" && !hasPT) return false;
      
      return true;
    });

    const getYear = (r: any) => {
      const y = r.tahunMenang || r.tahunKSK || r.tahunTempo || r.tahunmenang || r.tahunksk || r.tahuntempo;
      return parseInt(y, 10) || 0;
    };

    return result.sort((a, b) => {
      const ya = getYear(a);
      const yb = getYear(b);
      return sortOrder === "desc" ? yb - ya : ya - yb;
    });
  }, [rows, search, year, sortOrder, missingFilter, posisiFilter]);

  const progress = useMemo(() => {
    if (rows.length === 0) return { fc: 0, bc: 0, pt: 0, overall: 0 };
    
    const fc = rows.filter(r => r.frontCover?.imageUrl).length;
    const bc = rows.filter(r => r.backCover?.imageUrl).length;
    const pt = rows.filter(r => r.paratext?.sinopsisPenerbit || r.paratext?.blurb1 || (r.paratext?.rawSynopsisSources && r.paratext.rawSynopsisSources.length > 0)).length;
    
    const fcPct = Math.round((fc / rows.length) * 100);
    const bcPct = Math.round((bc / rows.length) * 100);
    const ptPct = Math.round((pt / rows.length) * 100);
    const overallPct = Math.round(((fcPct + bcPct + ptPct) / 300) * 100);
    
    return { fc: fcPct, bc: bcPct, pt: ptPct, overall: overallPct };
  }, [rows]);

  const openCover = (title: string, cover: CoverFile) =>
    setModal({ kind: "cover", title, cover });
  const openText = (title: string, text: string) =>
    setModal({ kind: "text", title, text });
  const openEvidence = (row: AnyRow) =>
    setModal({ kind: "evidence", title: `Evidence — ${row.id}`, row });
  const openDelete = (row: AnyRow) =>
    setModal({ kind: "delete", title: `Hapus Data — ${row.id}`, row });

  const executeDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
      setModal(null);
      queryClient.invalidateQueries({ queryKey: ['corpus'] });
    } catch (err) {
      console.error("Gagal menghapus:", err);
      alert("Gagal menghapus data.");
    }
  };

  const buttonCols: Col<T>[] = [
    {
      key: "front",
      label: "Front Cover",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openCover(`Front Cover — ${r.id}`, r.frontCover)}
        >
          View Front
        </Button>
      ),
    },
    {
      key: "back",
      label: "Back Cover",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openCover(`Back Cover — ${r.id}`, r.backCover)}
        >
          View Back
        </Button>
      ),
    },
    {
      key: "syn",
      label: "Sinopsis",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openText(`Sinopsis — ${r.id}`, r.paratext.sinopsisPenerbit)}
        >
          View Synopsis
        </Button>
      ),
    },
    {
      key: "blurb",
      label: "Blurb",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            openText(
              `Blurb — ${r.id}`,
              `${r.paratext.blurb1}\n— ${r.paratext.pemberiBlurb1}\n\n${r.paratext.blurb2}\n— ${r.paratext.pemberiBlurb2}`,
            )
          }
        >
          View Blurb
        </Button>
      ),
    },
  ];

  const trailingCols: Col<T>[] = [
    {
      key: "evidence",
      label: "Evidence",
      render: (r) => (
        <Button variant="outline" size="sm" onClick={() => openEvidence(r)}>
          View Evidence
        </Button>
      ),
    },
    {
      key: "verif",
      label: "Verification Status",
      render: (r) => <StatusBadge status={r.verificationStatus} />,
    },
    { key: "next", label: "Next Action", render: (r) => <span className="text-sm">{r.nextAction}</span> },
    {
      key: "detail",
      label: "Detail",
      render: (r) => {
        const to =
          corpusPath === "dkj"
            ? "/dkj/$id"
            : corpusPath === "ksk"
              ? "/ksk/$id"
              : "/tempo/$id";
        return (
          <div className="flex gap-2">
            <Link to={to} params={{ id: r.id }}>
              <Button variant="default" size="sm">
                Open Detail
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => openDelete(r)}>
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const allCols: Col<T>[] = [
    {
      key: "no",
      label: "No",
      render: (_, index: number) => <span className="text-muted-foreground">{index + 1}</span>,
      className: "w-[40px] text-center",
    },
    ...extraColumns,
    ...trailingCols.filter((c) => c.key === "detail"),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border border-border bg-card p-3">
        <Input
          placeholder="Search title / author / publisher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="max-w-[120px]"
        />
        <select
          value={posisiFilter}
          onChange={(e) => setPosisiFilter(e.target.value)}
          className="h-9 rounded-sm border border-border bg-background px-2 text-sm"
        >
          <option value="">All Positions</option>
          {uniquePositions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={missingFilter}
          onChange={(e) => setMissingFilter(e.target.value)}
          className="h-9 rounded-sm border border-border bg-background px-2 text-sm"
        >
          <option value="">All Data</option>
          <option value="no_fc">No Front Cover</option>
          <option value="has_fc">Has Front Cover</option>
          <option value="no_bc">No Back Cover</option>
          <option value="has_bc">Has Back Cover</option>
          <option value="no_pt">No Paratext</option>
          <option value="has_pt">Has Paratext</option>
        </select>
        {filtersExtra}
        <div className="ml-auto flex gap-2">
          <CreateManualDialog />
          <Button variant="outline" size="sm">
            Import XLSX / CSV
          </Button>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-4 border border-border bg-card p-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span>Front Cover</span>
            <span>{progress.fc}%</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: `${progress.fc}%` }} />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span>Back Cover</span>
            <span>{progress.bc}%</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: `${progress.bc}%` }} />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span>Paratext</span>
            <span>{progress.pt}%</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: `${progress.pt}%` }} />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span>Overall</span>
            <span>{progress.overall}%</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div className="bg-green-600 h-full" style={{ width: `${progress.overall}%` }} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border bg-card p-10 text-center text-muted-foreground">
          Upload XLSX / CSV to start building this corpus table.
        </div>
      ) : (
        <div className="overflow-auto border border-border bg-card max-h-[calc(100vh-450px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow className="bg-secondary">
                {allCols.map((c) => (
                  <TableHead 
                    key={c.key} 
                    className={`whitespace-nowrap text-xs uppercase tracking-wide ${c.label === "Tahun" ? "cursor-pointer select-none hover:text-primary" : ""}`}
                    onClick={() => {
                      if (c.label === "Tahun") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {c.label}
                      {c.label === "Tahun" && (
                        sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, index) => (
                <TableRow key={r.id}>
                  {allCols.map((c) => (
                    <TableCell key={c.key} className={`align-top text-sm ${c.className ?? ""}`}>
                      {c.render(r, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modal?.title}</DialogTitle>
            <DialogDescription>Detail tampil di sini.</DialogDescription>
          </DialogHeader>
          {modal?.kind === "cover" && (
            <div className="space-y-3 text-sm">
              <div className="flex aspect-[3/4] w-full items-center justify-center border border-dashed border-border bg-muted text-muted-foreground">
                {modal.cover.imageUrl ? (
                  <img src={modal.cover.imageUrl} alt="" className="h-full w-full object-contain" />
                ) : (
                  "No image attached"
                )}
              </div>
              <dl className="grid grid-cols-[160px_1fr] gap-y-1">
                <dt className="text-muted-foreground">Source type</dt>
                <dd>{modal.cover.sourceType}</dd>
                <dt className="text-muted-foreground">Source URL</dt>
                <dd className="break-all">{modal.cover.sourceUrl}</dd>
                <dt className="text-muted-foreground">Direct image URL</dt>
                <dd className="break-all">{modal.cover.directImageUrl}</dd>
                <dt className="text-muted-foreground">Resolution</dt>
                <dd>{modal.cover.resolutionQuality}</dd>
                <dt className="text-muted-foreground">Award label visible</dt>
                <dd>{modal.cover.awardLabelVisible}</dd>
                <dt className="text-muted-foreground">Visual notes</dt>
                <dd>{modal.cover.visualNotes}</dd>
                <dt className="text-muted-foreground">Verification</dt>
                <dd>
                  <StatusBadge status={modal.cover.verificationStatus} />
                </dd>
              </dl>
            </div>
          )}
          {modal?.kind === "text" && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{modal.text}</div>
          )}
          {modal?.kind === "evidence" && (
            <div className="space-y-3">
              {modal.row.evidence.map((e, i) => (
                <div key={i} className="space-y-1 border border-border bg-secondary/40 p-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Source: </span>
                    <a className="underline" href={e.sourceUrl} target="_blank" rel="noreferrer">
                      {e.sourceType}
                    </a>
                  </div>
                  <div className="italic">{e.excerpt}</div>
                  <div>
                    <span className="text-muted-foreground">Reason: </span>
                    {e.reason}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence: </span>
                    {e.confidence}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accessed: </span>
                    {e.accessDate}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next action: </span>
                    {e.nextAction}
                  </div>
                </div>
              ))}
            </div>
          )}
          {modal?.kind === "delete" && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
              </div>
              <div className="border p-3 rounded-md bg-muted/50 text-sm">
                <div className="font-semibold">{(modal.row as any).judulBuku || (modal.row as any).judulNaskah}</div>
                <div className="text-muted-foreground">{modal.row.pengarang}</div>
                <div className="text-xs text-muted-foreground mt-1">ID: {modal.row.id}</div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
                <Button variant="destructive" onClick={() => executeDelete(modal.row.id)}>Hapus</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SampleBadge() {
  return (
    <Badge variant="outline" className="ml-2 text-[10px] uppercase tracking-wider">
      Sample
    </Badge>
  );
}
