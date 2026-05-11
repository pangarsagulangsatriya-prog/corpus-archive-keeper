import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { AnyRow, CoverFile } from "@/lib/corpus-data";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <h2 className="border-b border-border bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wider">
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-border/60 py-1.5 last:border-b-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || "—"}</dd>
    </div>
  );
}

function CoverCard({ title, cover }: { title: string; cover: CoverFile }) {
  return (
    <div className="border border-border">
      <div className="border-b border-border bg-secondary px-3 py-2 text-sm font-semibold">{title}</div>
      <div className="p-3 space-y-3">
        <div className="flex aspect-[3/4] w-full items-center justify-center border border-dashed border-border bg-muted text-sm text-muted-foreground">
          {cover.imageUrl ? (
            <img src={cover.imageUrl} alt={title} className="h-full w-full object-contain" />
          ) : (
            "No image attached"
          )}
        </div>
        <dl>
          <Field label="Source type" value={cover.sourceType} />
          <Field label="Source URL" value={cover.sourceUrl} />
          <Field label="Direct image URL" value={cover.directImageUrl} />
          <Field label="Resolution" value={cover.resolutionQuality} />
          <Field label="Award label visible" value={cover.awardLabelVisible} />
          <Field label="Visual notes" value={cover.visualNotes} />
          <Field label="Verification status" value={cover.verificationStatus} />
        </dl>
      </div>
    </div>
  );
}

function CollapsibleText({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 140;
  return (
    <div className="border-b border-border/60 py-2 last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <button
          className="text-xs underline hover:no-underline"
          onClick={() => navigator.clipboard.writeText(text)}
        >
          Copy Text
        </button>
      </div>
      <p className="text-sm whitespace-pre-wrap">
        {long && !open ? text.slice(0, 140) + "…" : text || "—"}
      </p>
      {long && (
        <button
          className="mt-1 text-xs text-primary underline"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Collapse" : "Expand"}
        </button>
      )}
    </div>
  );
}

export function DetailView({ row, backTo }: { row: AnyRow; backTo: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1200px] px-6 py-6">
          <Link to="/" className="text-xs uppercase tracking-wider text-primary hover:underline">
            ← Back to {backTo}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-border bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
              {row.corpus}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              {"judulBuku" in row ? row.judulBuku : row.judulBukuSetelahTerbit}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {row.pengarang} ·{" "}
            {row.corpus === "DKJ"
              ? `${row.tahunMenang} · ${row.posisi}`
              : row.corpus === "KSK"
                ? `${row.tahunKSK} · ${row.statusKSK}`
                : `${row.tahunTempo} · ${row.statusTempo}`}{" "}
            · {row.published.penerbit} · {row.published.tahunTerbit}
          </p>
          <div className="mt-2">
            <span className="rounded-sm border border-border bg-secondary px-2 py-0.5 text-xs">
              Verification: {row.verificationStatus}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] space-y-6 px-6 py-6">
        <Section title="Section 1 — Award / Corpus Identity">
          <dl className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            {row.corpus === "DKJ" && (
              <>
                <Field label="Jenis Sayembara" value={row.jenisSayembara} />
                <Field label="Tahun Menang" value={row.tahunMenang} />
                <Field label="Posisi" value={row.posisi} />
                <Field label="Judul Naskah Saat Menang" value={row.judulNaskah} />
                <Field label="Judul Buku Setelah Terbit" value={row.judulBukuSetelahTerbit} />
                <Field label="Judul Berubah?" value={row.judulBerubah} />
                <Field label="Pengarang" value={row.pengarang} />
                <Field label="Nama Juri" value={row.juri} />
                <Field label="Pertanggungjawaban Juri" value={row.pertanggungjawabanJuri} />
                <Field label="Kutipan Penilaian Juri" value={row.kutipanJuri} />
                <Field label="Link Pengumuman Resmi" value={row.linkPengumuman} />
              </>
            )}
            {row.corpus === "KSK" && (
              <>
                <Field label="Tahun KSK" value={row.tahunKSK} />
                <Field label="Kategori" value={row.kategori} />
                <Field label="Status KSK" value={row.statusKSK} />
                <Field label="Judul Buku" value={row.judulBuku} />
                <Field label="Pengarang" value={row.pengarang} />
                <Field label="Juri / Catatan Kurasi" value={row.juriCatatan} />
                <Field label="Link Pengumuman / Source" value={row.linkPengumuman} />
              </>
            )}
            {row.corpus === "Tempo" && (
              <>
                <Field label="Tahun Tempo" value={row.tahunTempo} />
                <Field label="Kategori" value={row.kategori} />
                <Field label="Status Tempo" value={row.statusTempo} />
                <Field label="Judul Buku" value={row.judulBuku} />
                <Field label="Pengarang" value={row.pengarang} />
                <Field label="Artikel Tempo" value={row.artikelTempo} />
                <Field label="Kutipan Penilaian Tempo" value={row.kutipanTempo} />
                <Field label="Link Artikel / Source" value={row.linkArtikel} />
              </>
            )}
          </dl>
        </Section>

        <Section title="Section 2 — Published Book Metadata">
          <dl className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <Field label="Judul Buku Setelah Terbit" value={row.published.judulBuku} />
            <Field label="Penerbit" value={row.published.penerbit} />
            <Field label="Imprint" value={row.published.imprint} />
            <Field label="Tahun Terbit" value={row.published.tahunTerbit} />
            <Field label="ISBN" value={row.published.isbn} />
            <Field label="Harga" value={row.published.harga} />
            <Field label="Jumlah Halaman" value={row.published.jumlahHalaman} />
            <Field label="Cetakan Pertama / Cetak Ulang" value={row.published.cetakan} />
            <Field label="Editor" value={row.published.editor} />
            <Field label="Penyunting" value={row.published.penyunting} />
            <Field label="Proofreader" value={row.published.proofreader} />
            <Field label="Desainer Sampul" value={row.published.desainerSampul} />
            <Field label="Ilustrator" value={row.published.ilustrator} />
            <Field label="Layout Designer" value={row.published.layoutDesigner} />
          </dl>
        </Section>

        <Section title="Section 3 — Cover Files">
          <div className="grid gap-4 md:grid-cols-2">
            <CoverCard title="Front Cover" cover={row.frontCover} />
            <CoverCard title="Back Cover" cover={row.backCover} />
          </div>
        </Section>

        <Section title="Section 4 — Paratext">
          <dl>
            <CollapsibleText label="Sinopsis penerbit" text={row.paratext.sinopsisPenerbit} />
            <CollapsibleText label="Sinopsis toko" text={row.paratext.sinopsisToko} />
            <CollapsibleText label="Sinopsis Google Books" text={row.paratext.sinopsisGoogleBooks} />
            <CollapsibleText label="Sinopsis Goodreads" text={row.paratext.sinopsisGoodreads} />
            <CollapsibleText label="Sinopsis marketplace" text={row.paratext.sinopsisMarketplace} />
            <CollapsibleText label="Teks sampul belakang" text={row.paratext.teksSampulBelakang} />
            <Field label="Blurb 1" value={row.paratext.blurb1} />
            <Field label="Pemberi blurb 1" value={row.paratext.pemberiBlurb1} />
            <Field label="Blurb 2" value={row.paratext.blurb2} />
            <Field label="Pemberi blurb 2" value={row.paratext.pemberiBlurb2} />
            <Field label="Barcode / ISBN visible" value={row.paratext.barcodeVisible} />
            <Field label="Harga visible" value={row.paratext.hargaVisible} />
            <Field label="Logo penerbit visible" value={row.paratext.logoPenerbitVisible} />
            <Field label="Label genre" value={row.paratext.labelGenre} />
            <Field label="Teks promosi" value={row.paratext.teksPromosi} />
          </dl>
        </Section>

        <Section title="Section 5 — Research Coding">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input defaultValue={row.research.kataPromosiDominan} placeholder="Kata promosi dominan" />
            <Input defaultValue={row.research.labelGenre} placeholder="Label genre" />
            <Input defaultValue={row.research.klaimEstetika} placeholder="Klaim estetika" />
            <Input defaultValue={row.research.warnaDominan} placeholder="Warna dominan" />
            <Input defaultValue={row.research.objekDominan} placeholder="Objek dominan" />
            <Input defaultValue={row.research.nuansaVisual} placeholder="Nuansa visual" />
            {(["keywordTrauma", "keywordDistopia", "keywordMuram", "keywordMaterialitas"] as const).map(
              (k) => (
                <div key={k} className="flex items-center gap-2">
                  <label className="w-44 text-sm capitalize text-muted-foreground">
                    {k.replace("keyword", "Keyword ")}
                  </label>
                  <select
                    defaultValue={row.research[k]}
                    className="h-9 flex-1 rounded-sm border border-border bg-background px-2 text-sm"
                  >
                    <option>Ya</option>
                    <option>Tidak</option>
                    <option>Tidak jelas</option>
                  </select>
                </div>
              ),
            )}
            <Textarea
              className="md:col-span-2"
              defaultValue={row.research.catatanPeneliti}
              placeholder="Catatan peneliti"
            />
          </div>
        </Section>

        <Section title="Section 6 — Evidence Log">
          <div className="space-y-3">
            {row.evidence.map((e, i) => (
              <div key={i} className="space-y-2 border border-border bg-secondary/40 p-3 text-sm">
                <div className="flex flex-wrap gap-3">
                  <span><span className="text-muted-foreground">Source type:</span> {e.sourceType}</span>
                  <span><span className="text-muted-foreground">Confidence:</span> {e.confidence}</span>
                  <span><span className="text-muted-foreground">Accessed:</span> {e.accessDate}</span>
                </div>
                <div className="italic">{e.excerpt}</div>
                <div><span className="text-muted-foreground">Reason:</span> {e.reason}</div>
                <div><span className="text-muted-foreground">Notes:</span> {e.notes}</div>
                <div><span className="text-muted-foreground">Next action:</span> {e.nextAction}</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(e.excerpt)}>
                    Copy Evidence
                  </Button>
                  <a href={e.sourceUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">Open Source</Button>
                  </a>
                  <Button size="sm" variant="default">Mark as Verified</Button>
                  <Button size="sm" variant="outline">Mark as Needs Manual Check</Button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}
