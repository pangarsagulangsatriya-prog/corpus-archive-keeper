import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

interface ParsedRow {
  id?: string;
  corpus?: string;
  [key: string]: any;
}

interface ImportSummary {
  total: number;
  books: number;
  editions: number;
  evidenceLogs: number;
  missingId: number;
  duplicateId: number;
  conflicts: number;
  lowConfidence: number;
  readyToImport: number;
  jsonbValid: boolean;
  errors: string[];
}

const dbColumnMap: Record<string, string> = {
  isSample: 'issample',
  verificationStatus: 'verificationstatus',
  nextAction: 'nextaction',
  halamanKreditNotes: 'halamankreditnotes',
  judulBuku: 'judulbuku',
  jumlahHalaman: 'jumlahhalaman',
  desainerSampul: 'desainersampul',
  linkPengumuman: 'linkpengumuman',
  jenisSayembara: 'jenissayembara',
  tahunMenang: 'tahunmenang',
  judulNaskah: 'judulnaskah',
  judulBukuSetelahTerbit: 'judulbukusetelahterbit',
  judulBerubah: 'judulberubah',
  statusTerbit: 'statusterbit',
  jarakMenangTerbit: 'jarakmenangterbit',
  pertanggungjawabanJuri: 'pertanggungjawabanjuri',
  kutipanJuri: 'kutipanjuri',
  tahunKSK: 'tahunksk',
  statusKSK: 'statusksk',
  juriCatatan: 'juricatatan',
  tahunTempo: 'tahuntempo',
  statusTempo: 'statustempo',
  artikelTempo: 'artikeltempo',
  kutipanTempo: 'kutipantempo',
  linkArtikel: 'linkartikel',
  frontCover: 'frontcover',
  backCover: 'backcover'
};

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '');
}

function parsePipeTable(tableText: string): any[] {
  const lines = tableText.trim().split(/\r?\n/);
  if (lines.length < 3) return [];

  const headers = lines[0].split('|').map(s => s.trim());
  if (headers[0] === '') headers.shift();
  if (headers[headers.length - 1] === '') headers.pop();
  
  const normalizedHeaders = headers.map(normalizeHeader);
  const dataLines = lines.slice(2);
  
  return dataLines.map(line => {
    const values = line.split('|').map(s => s.trim());
    if (values[0] === '') values.shift();
    if (values[values.length - 1] === '') values.pop();
    
    const obj: any = {};
    normalizedHeaders.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

function findTables(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const tables: string[] = [];
  let currentTable: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableLine = line.startsWith('|') && line.endsWith('|');
    
    if (isTableLine) {
      if (!inTable) {
        if (i + 1 < lines.length && lines[i + 1].trim().match(/^\|[-|\s:]+\|$/)) {
          inTable = true;
          currentTable = [line];
        }
      } else {
        currentTable.push(line);
      }
    } else {
      if (inTable) {
        tables.push(currentTable.join('\n'));
        currentTable = [];
        inTable = false;
      }
    }
  }
  if (inTable && currentTable.length > 0) {
    tables.push(currentTable.join('\n'));
  }
  return tables;
}

export function ImportMarkdownDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importError, setImportError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportStatus("idle");
    setImportError("");
    setParsedData([]);
    setSummary(null);

    try {
      const text = await selectedFile.text();
      parseMarkdown(text);
    } catch (err) {
      setImportError("Gagal membaca file.");
    }
  };

  const parseMarkdown = (text: string) => {
    const errors: string[] = [];
    const tables = findTables(text);
    console.log(`Found ${tables.length} tables.`);
    
    let books: any[] = [];
    let editions: any[] = [];
    let evidence: any[] = [];
    
    tables.forEach(tableText => {
      const data = parsePipeTable(tableText);
      if (data.length === 0) return;
      
      const headers = Object.keys(data[0]);
      
      // Detect table type
      if (headers.includes('book_id') && (headers.includes('judul_naskah') || headers.includes('judul_buku_terbit'))) {
        if (data.length > books.length) books = data;
      } else if (headers.includes('edition_id') || (headers.includes('edition_label') && headers.includes('publisher'))) {
        editions = data;
      } else if (headers.includes('publisher_evidence_url') || headers.includes('editor_evidence_url')) {
        evidence = data;
      }
    });

    if (books.length === 0) {
      setImportError("Tidak menemukan tabel utama buku (Books Master).");
      return;
    }

    const ids = new Set<string>();
    let duplicateIdCount = 0;
    let missingIdCount = 0;
    let totalEvidenceLogs = 0;
    let conflictsCount = 0;
    let lowConfidenceCount = 0;
    let readyToImportCount = 0;

    const validatedData = books.map((row, i) => {
      const bookId = row.book_id || row.id;
      if (!bookId) {
        missingIdCount++;
        errors.push(`Baris ${i + 1}: kehilangan 'id'.`);
      } else {
        if (ids.has(bookId)) {
          duplicateIdCount++;
          errors.push(`Baris ${i + 1}: duplikat id '${bookId}'.`);
        }
        ids.add(bookId);
      }

      // Find editions
      const bookEditions = editions.filter(ed => (ed.book_id || ed.id) === bookId);
      
      // Find evidence
      const bookEvidence = evidence.find(ev => ev.book_id === bookId);

      // Create merged object
      const result: any = {
        id: bookId,
        corpus: 'DKJ', // Default
        judulBuku: row.judul_buku_terbit || row.judul_naskah,
        pengarang: row.penulis || row.pengarang,
        statusTerbit: row.status_terbit_label || row.status_terbit,
        penerbit: row.first_edition_publisher || row.penerbit,
        tahunTerbit: row.first_edition_year || row.tahun_terbit,
        isbn: row.first_edition_isbn_13 || row.isbn,
        harga: row.first_edition_price_rp || row.harga,
        jumlahHalaman: row.first_edition_pages || row.halaman,
        editor: row.editor_penyunting || row.editor,
        desainerSampul: row.desainer_sampul,
        verificationStatus: row.verification_status,
        nextAction: row.next_action,
      };

      // Handle JSONB fields
      result.published = {
        editions: bookEditions,
        google_books_url: row.google_books_url,
        fliphtml5_url: row.fliphtml5_url,
        source_gambar: row.source_gambar,
        cover_evidence_url: row.cover_evidence_url,
      };

      result.paratext = {
        sinopsis: row.sinopsis,
        raw_sinopsis: row.raw_sinopsis,
        blurb: row.blurb,
        kata_promosi: row.kata_promosi,
        label_genre: row.label_genre,
        klaim_estetika: row.klaim_estetika,
        kata_kunci_dominan: row.kata_kunci_dominan,
        paratext_source_url: row.paratext_source_url,
      };

      result.research = {
        source_confidence: row.source_confidence,
        evidence_verdict: row.evidence_verdict,
        metadata_notes: row.metadata_notes,
        audit_note: row.audit_note,
      };

      // Create evidence log
      result.evidence = [];
      if (bookEvidence) {
        const fieldNames = [
          'publisher_evidence_url', 'isbn_pages_evidence_url', 'price_evidence_url', 
          'editor_evidence_url', 'cover_evidence_url', 'primary_source_url', 'source_url', 'evidence_url'
        ];
        fieldNames.forEach(field => {
          if (bookEvidence[field]) {
            result.evidence.push({
              field_name: field,
              value: bookEvidence[field],
              evidence_url: bookEvidence[field],
              evidence_status: bookEvidence.evidence_verdict,
              note: bookEvidence.audit_note
            });
          }
        });
      }

      totalEvidenceLogs += result.evidence.length;
      
      if (row.evidence_verdict === 'conflict_hold_for_credit_page' || row.evidence_verdict === 'conflict_needs_review') {
        conflictsCount++;
      }
      if (row.evidence_verdict === 'import_with_low_confidence_verify' || row.source_confidence === 'Low') {
        lowConfidenceCount++;
      }
      if (row.evidence_verdict === 'import_ok_with_evidence' || row.evidence_verdict === 'import_ok_but_editor_unverified') {
        readyToImportCount++;
      }

      return result;
    });

    setParsedData(validatedData);
    setSummary({
      total: validatedData.length,
      books: validatedData.length,
      editions: editions.length,
      evidenceLogs: totalEvidenceLogs,
      missingId: missingIdCount,
      duplicateId: duplicateIdCount,
      conflicts: conflictsCount,
      lowConfidence: lowConfidenceCount,
      readyToImport: readyToImportCount,
      jsonbValid: true,
      errors
    });
  };

  const mapToFallbackColumns = (rows: ParsedRow[]) => {
    return rows.map(row => {
      const mapped: any = {};
      for (const [key, value] of Object.entries(row)) {
        mapped[key.toLowerCase()] = value;
      }
      return mapped;
    });
  };

  const doImport = async () => {
    if (!parsedData.length || !summary) return;
    
    setIsImporting(true);
    setImportStatus("idle");
    setImportError("");

    try {
      // Try with original camelCase
      let { error } = await supabase.from('books').upsert(parsedData, { onConflict: 'id' });

      // If there is an error, fallback to lowercase mapping
      if (error) {
        console.warn("CamelCase insert failed, trying lowercase mapping fallback... Error was:", error.message);
        const fallbackData = mapToFallbackColumns(parsedData);
        const fallbackResult = await supabase.from('books').upsert(fallbackData, { onConflict: 'id' });
        error = fallbackResult.error;
      }

      if (error) throw error;

      setImportStatus("success");
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['corpus'] });
    } catch (err: any) {
      console.error(err);
      setImportStatus("error");
      setImportError(err.message || "Terjadi kesalahan saat import.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        // Reset when closing
        setTimeout(() => {
          setFile(null);
          setParsedData([]);
          setSummary(null);
          setImportStatus("idle");
          setImportError("");
        }, 300);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" /> Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Markdown Data</DialogTitle>
          <DialogDescription>
            Pilih file Markdown (.md) yang berisi blok <code>## BOOKS_IMPORT_JSON</code>. Data akan disinkronisasi ke Supabase (Upsert).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4 space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".md"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <FileText className="w-4 h-4 mr-2" />
              {file ? file.name : "Pilih File .md"}
            </Button>
          </div>

          {importError && importStatus !== "error" && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="font-mono text-xs whitespace-pre-wrap">{importError}</div>
            </div>
          )}

          {summary && (
            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2 border-b border-border font-medium text-sm">
                Ringkasan Validasi
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Total Books</div>
                  <div className="font-semibold text-lg">{summary.books}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Total Editions</div>
                  <div className="font-semibold text-lg">{summary.editions}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Evidence Logs</div>
                  <div className="font-semibold text-lg">{summary.evidenceLogs}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Ready to Import</div>
                  <div className="font-semibold text-lg text-green-600">{summary.readyToImport}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Missing ID</div>
                  <div className={`font-semibold text-lg ${summary.missingId > 0 ? 'text-red-600' : ''}`}>{summary.missingId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Duplicate ID</div>
                  <div className={`font-semibold text-lg ${summary.duplicateId > 0 ? 'text-red-600' : ''}`}>{summary.duplicateId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Conflicts</div>
                  <div className={`font-semibold text-lg ${summary.conflicts > 0 ? 'text-yellow-600' : ''}`}>{summary.conflicts}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Low Confidence</div>
                  <div className={`font-semibold text-lg ${summary.lowConfidence > 0 ? 'text-orange-600' : ''}`}>{summary.lowConfidence}</div>
                </div>
              </div>
              
              {summary.errors.length > 0 && (
                <div className="px-4 py-3 bg-red-50/50 border-t border-border text-xs text-red-700 max-h-32 overflow-auto">
                  <div className="font-semibold mb-1">Peringatan:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {summary.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden flex flex-col h-[300px]">
              <div className="bg-secondary/50 px-4 py-2 border-b border-border font-medium text-sm flex justify-between items-center">
                <span>Preview Data</span>
                <span className="text-xs text-muted-foreground">Menampilkan max 50 baris</span>
              </div>
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Corpus</TableHead>
                      <TableHead>Jenis Sayembara</TableHead>
                      <TableHead>Tahun Menang</TableHead>
                      <TableHead>Posisi</TableHead>
                      <TableHead>Judul Naskah</TableHead>
                      <TableHead>Pengarang</TableHead>
                      <TableHead>Status Verifikasi</TableHead>
                      <TableHead>Next Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{row.id}</TableCell>
                        <TableCell>{row.corpus}</TableCell>
                        <TableCell>{row.jenisSayembara}</TableCell>
                        <TableCell>{row.tahunMenang}</TableCell>
                        <TableCell>{row.posisi}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.judulNaskah}</TableCell>
                        <TableCell>{row.pengarang}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.verificationStatus}</TableCell>
                        <TableCell>{row.nextAction}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {importStatus === "success" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <div className="font-medium">Import Berhasil!</div>
                <div className="text-sm">Data telah di-upsert ke Supabase dan tabel telah diperbarui.</div>
              </div>
            </div>
          )}
          
          {importStatus === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Import Gagal</div>
                <div className="text-sm font-mono mt-1">{importError}</div>
              </div>
            </div>
          )}

        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Tutup</Button>
          <Button 
            onClick={doImport} 
            disabled={!summary || summary.missingId > 0 || !summary.jsonbValid || isImporting || importStatus === "success"}
          >
            {isImporting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengimpor...</>
            ) : (
              "Lakukan Import Final"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
