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
  missingId: number;
  duplicateId: number;
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
    
    // Find heading ## BOOKS_IMPORT_JSON
    const headingIndex = text.indexOf("BOOKS_IMPORT_JSON");
    if (headingIndex === -1) {
      setImportError("Tidak menemukan heading 'BOOKS_IMPORT_JSON' di dalam file.");
      return;
    }

    const afterHeading = text.substring(headingIndex);
    
    // Find first ```json block
    const jsonMatch = afterHeading.match(/```json\s+([\s\S]*?)\s+```/);
    if (!jsonMatch || !jsonMatch[1]) {
      setImportError("Tidak menemukan blok kode JSON setelah heading.");
      return;
    }

    let jsonData: any[];
    try {
      jsonData = JSON.parse(jsonMatch[1]);
      if (!Array.isArray(jsonData)) throw new Error("JSON harus berupa array.");
    } catch (err) {
      setImportError("JSON tidak valid atau bukan array.");
      return;
    }

    let missingIdCount = 0;
    let jsonbValid = true;
    const ids = new Set<string>();
    let duplicateIdCount = 0;

    const validatedData = jsonData.map((row, i) => {
      if (!row.id) {
        missingIdCount++;
        errors.push(`Baris ${i + 1}: kehilangan 'id'.`);
      } else {
        if (ids.has(row.id)) {
          duplicateIdCount++;
          errors.push(`Baris ${i + 1}: duplikat id '${row.id}'.`);
        }
        ids.add(row.id);
      }

      if (!row.corpus) {
        errors.push(`Baris ${i + 1} (${row.id}): kehilangan 'corpus'.`);
      }

      // Check JSONB fields
      ['frontCover', 'backCover', 'paratext', 'research', 'published'].forEach(field => {
        if (row[field] !== undefined && typeof row[field] !== 'object') {
          jsonbValid = false;
          errors.push(`Baris ${i + 1}: '${field}' harus berupa object.`);
        }
      });

      if (row.evidence !== undefined && !Array.isArray(row.evidence)) {
        jsonbValid = false;
        errors.push(`Baris ${i + 1}: 'evidence' harus berupa array.`);
      }

      return row;
    });

    setParsedData(validatedData);
    setSummary({
      total: validatedData.length,
      missingId: missingIdCount,
      duplicateId: duplicateIdCount,
      jsonbValid,
      errors
    });
  };

  const mapToFallbackColumns = (rows: ParsedRow[]) => {
    return rows.map(row => {
      const mapped: any = {};
      for (const [key, value] of Object.entries(row)) {
        if (dbColumnMap[key]) {
          mapped[dbColumnMap[key]] = value;
        } else {
          mapped[key] = value;
        }
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
                  <div className="text-muted-foreground text-xs uppercase">Total Baris</div>
                  <div className="font-semibold text-lg">{summary.total}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">JSONB Valid</div>
                  <div className={`font-semibold text-lg flex items-center gap-1 ${summary.jsonbValid ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.jsonbValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {summary.jsonbValid ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Missing ID</div>
                  <div className={`font-semibold text-lg ${summary.missingId > 0 ? 'text-red-600' : ''}`}>{summary.missingId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Duplicate ID</div>
                  <div className={`font-semibold text-lg ${summary.duplicateId > 0 ? 'text-red-600' : ''}`}>{summary.duplicateId}</div>
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
