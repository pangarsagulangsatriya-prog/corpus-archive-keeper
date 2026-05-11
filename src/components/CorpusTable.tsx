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

type Col<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Modal =
  | { kind: "cover"; title: string; cover: CoverFile }
  | { kind: "text"; title: string; text: string }
  | { kind: "evidence"; title: string; row: AnyRow }
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
  const [verif, setVerif] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const hay = JSON.stringify(r).toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (year && !hay.includes(year)) return false;
      if (verif && r.verificationStatus !== verif) return false;
      return true;
    });
  }, [rows, search, year, verif]);

  const openCover = (title: string, cover: CoverFile) =>
    setModal({ kind: "cover", title, cover });
  const openText = (title: string, text: string) =>
    setModal({ kind: "text", title, text });
  const openEvidence = (row: AnyRow) =>
    setModal({ kind: "evidence", title: `Evidence — ${row.id}`, row });

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
          <Link to={to} params={{ id: r.id }}>
            <Button variant="default" size="sm">
              Open Detail
            </Button>
          </Link>
        );
      },
    },
  ];

  const allCols = [...extraColumns, ...buttonCols, ...trailingCols];

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
          value={verif}
          onChange={(e) => setVerif(e.target.value)}
          className="h-9 rounded-sm border border-border bg-background px-2 text-sm"
        >
          <option value="">All verification</option>
          <option>Verified</option>
          <option>Needs Manual Check</option>
          <option>Pending</option>
          <option>In Progress</option>
        </select>
        {filtersExtra}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm">
            Import XLSX / CSV
          </Button>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border bg-card p-10 text-center text-muted-foreground">
          Upload XLSX / CSV to start building this corpus table.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                {allCols.map((c) => (
                  <TableHead key={c.key} className="whitespace-nowrap text-xs uppercase tracking-wide">
                    {c.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  {allCols.map((c) => (
                    <TableCell key={c.key} className={`align-top text-sm ${c.className ?? ""}`}>
                      {c.render(r)}
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
