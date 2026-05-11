import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnyRow, CoverFile } from "@/lib/corpus-data";
import { fetchCorpusData, sampleDKJ, sampleKSK, sampleTempo } from "@/lib/corpus-data";
import { supabase } from "@/lib/supabase";
import { 
  Search, Filter, ChevronLeft, ChevronRight, Book, FolderOpen, 
  Download, Copy, ExternalLink, Check, AlertTriangle, ZoomIn, ZoomOut, Maximize2,
  Upload, Link as LinkIcon, X
} from "lucide-react";

// Helper components
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-border/60 py-1.5 last:border-b-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || "—"}</dd>
    </div>
  );
}

function MetadataCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border bg-secondary px-3 py-1.5 text-xs font-semibold uppercase">
        {title}
      </div>
      <div className="p-3 space-y-1">
        {children}
      </div>
    </div>
  );
}

function ImageViewer({ src, alt, onEditToggle, isEditing, children }: { src?: string; alt: string; onEditToggle?: () => void; isEditing?: boolean; children?: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const handleReset = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col items-center space-y-2 w-full h-full max-w-[500px]">
      <div className="flex justify-between w-full">
        <div className="flex gap-1">
          <Button size="icon" variant="outline" className="w-7 h-7" onClick={handleZoomOut} disabled={scale <= 0.5}><ZoomOut className="w-4 h-4" /></Button>
          <Button size="icon" variant="outline" className="w-7 h-7" onClick={handleZoomIn} disabled={scale >= 3}><ZoomIn className="w-4 h-4" /></Button>
          <Button size="icon" variant="outline" className="w-7 h-7" onClick={handleReset}><Maximize2 className="w-4 h-4" /></Button>
        </div>
        {onEditToggle && (
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={onEditToggle}>
            {isEditing ? "Hide Edit" : "Edit Cover"}
          </Button>
        )}
      </div>

      <div 
        className="relative border border-border bg-card p-2 w-full flex-1 shadow-sm overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="h-[500px] bg-muted flex items-center justify-center text-muted-foreground text-xs border border-dashed border-border overflow-hidden">
          {src ? (
            <img 
              src={src} 
              alt={alt} 
              className="object-contain max-w-full max-h-full" 
              style={{ 
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default')
              }}
              draggable={false}
            />
          ) : (
            `No ${alt} Image`
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
}

export function DetailView({ row: initialRow }: { row: AnyRow; backTo: string }) {
  const [row, setRow] = useState(initialRow);
  const [frontUrl, setFrontUrl] = useState(row.frontCover?.imageUrl || "");
  const [backUrl, setBackUrl] = useState(row.backCover?.imageUrl || "");
  const [frontSourceUrl, setFrontSourceUrl] = useState(row.frontCover?.sourceUrl || "");
  const [backSourceUrl, setBackSourceUrl] = useState(row.backCover?.sourceUrl || "");
  const [googleBooksUrl, setGoogleBooksUrl] = useState(row.published?.googleBooksUrl || "");
  const [showEditFront, setShowEditFront] = useState(false);
  const [showEditBack, setShowEditBack] = useState(false);
  const [activeTab, setActiveTab] = useState("front");
  const [showEditUrl, setShowEditUrl] = useState(false);
  const [frontEd2, setFrontEd2] = useState({
    imageUrl: row.frontCover?.edition2?.imageUrl || "",
    sourceUrl: row.frontCover?.edition2?.sourceUrl || "",
    publisher: row.frontCover?.edition2?.publisher || "",
    year: row.frontCover?.edition2?.year || ""
  });
  const [backEd2, setBackEd2] = useState({
    imageUrl: row.backCover?.edition2?.imageUrl || "",
    sourceUrl: row.backCover?.edition2?.sourceUrl || "",
    publisher: row.backCover?.edition2?.publisher || "",
    year: row.backCover?.edition2?.year || ""
  });
  
  useEffect(() => {
    setFrontUrl(row.frontCover?.imageUrl || "");
    setBackUrl(row.backCover?.imageUrl || "");
    setFrontSourceUrl(row.frontCover?.sourceUrl || "");
    setBackSourceUrl(row.backCover?.sourceUrl || "");
    setGoogleBooksUrl(row.published?.googleBooksUrl || "");
    setFrontEd2({
      imageUrl: row.frontCover?.edition2?.imageUrl || "",
      sourceUrl: row.frontCover?.edition2?.sourceUrl || "",
      publisher: row.frontCover?.edition2?.publisher || "",
      year: row.frontCover?.edition2?.year || ""
    });
    setBackEd2({
      imageUrl: row.backCover?.edition2?.imageUrl || "",
      sourceUrl: row.backCover?.edition2?.sourceUrl || "",
      publisher: row.backCover?.edition2?.publisher || "",
      year: row.backCover?.edition2?.year || ""
    });
    setShowEditFront(false);
    setShowEditBack(false);
  }, [row]);


  const { data: corpusList = [] } = useQuery({
    queryKey: ['corpus', row.corpus],
    queryFn: () => fetchCorpusData(row.corpus as any)
  });

  const fallbackList = row.corpus === "DKJ" ? sampleDKJ : row.corpus === "KSK" ? sampleKSK : sampleTempo;
  const list = corpusList.length > 0 ? corpusList : fallbackList;
  
  const [listSortOrder, setListSortOrder] = useState<"asc" | "desc">("desc");

  const sortedList = useMemo(() => {
    const getYear = (r: any) => {
      const y = r.tahunMenang || r.tahunKSK || r.tahunTempo || r.tahunmenang || r.tahunksk || r.tahuntempo;
      return parseInt(y, 10) || 0;
    };
    return [...list].sort((a, b) => {
      const ya = getYear(a);
      const yb = getYear(b);
      return listSortOrder === "desc" ? yb - ya : ya - yb;
    });
  }, [list, listSortOrder]);

  const currentIndex = sortedList.findIndex(r => r.id === row.id);
  
  const handlePrev = () => {
    if (currentIndex > 0) setRow(list[currentIndex - 1]);
  };
  const handleNext = () => {
    if (currentIndex < list.length - 1) setRow(list[currentIndex + 1]);
  };

  const handleSaveCover = async (type: 'front' | 'back', url: string, sourceUrl?: string, edition2?: any) => {
    const key = type === 'front' ? 'frontcover' : 'backcover';
    const currentCover = type === 'front' ? row.frontCover : row.backCover;
    const updatedCover = { 
      ...currentCover, 
      imageUrl: url, 
      sourceUrl: sourceUrl || currentCover?.sourceUrl,
      edition2: edition2 || currentCover?.edition2
    };
    
    const { error } = await supabase
      .from('books')
      .update({ [key]: updatedCover })
      .eq('id', row.id);
      
    if (!error) {
      setRow({ ...row, [type === 'front' ? 'frontCover' : 'backCover']: updatedCover });
      alert("Saved!");
    } else {
      alert("Error: " + error.message);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("output", "embed");
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  };

  const handleSaveGoogleBooksUrl = async () => {
    const updatedPublished = { ...row.published, googleBooksUrl };
    const { error } = await supabase
      .from('books')
      .update({ published: updatedPublished })
      .eq('id', row.id);
      
    if (!error) {
      setRow({ ...row, published: updatedPublished });
      alert("Saved!");
    } else {
      alert("Error: " + error.message);
    }
  };

  const handleFileUpload = (type: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      handleSaveCover(type, base64);
    };
    reader.readAsDataURL(file);
  };

  const title = "judulBuku" in row ? row.judulBuku : row.judulNaskah;

  return (
    <div className="flex h-screen bg-background text-foreground text-sm font-sans overflow-hidden">
      {/* 2. LEFT RECORD LIST PANEL */}
      <div className="w-[320px] border-r border-border bg-card flex flex-col h-full">
        {/* Search & Filter */}
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
            <Input placeholder="Cari judul / pengarang / penerbit..." className="pl-8 text-xs h-9" />
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-9">
              <Filter className="w-3 h-3 mr-1" /> Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs h-9"
              onClick={() => setListSortOrder(listSortOrder === "asc" ? "desc" : "asc")}
            >
              Sort: {listSortOrder === "desc" ? "Terbaru" : "Terlama"}
            </Button>
          </div>
        </div>
        
        {/* Corpus Title */}
        <div className="px-3 py-2 border-b border-border bg-secondary text-xs font-semibold uppercase">
          Korpus {row.corpus}
        </div>
        
        {/* List of Records */}
        <div className="flex-1 overflow-auto">
          {sortedList.map(r => {
            const winYear = r.tahunMenang || r.tahunKSK || r.tahunTempo || r.tahunmenang || r.tahunksk || r.tahuntempo;
            return (
              <div 
                key={r.id} 
                className={`p-3 border-b border-border cursor-pointer hover:bg-secondary/50 flex flex-col space-y-1 ${r.id === row.id ? 'bg-[oklch(0.95_0.02_150)] border-l-4 border-l-[oklch(0.4_0.1_150)]' : ''}`}
                onClick={() => setRow(r)}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold">{r.corpus} ({winYear || "—"})</span>
                </div>
                <div className="font-semibold text-xs truncate">{"judulBuku" in r ? r.judulBuku : r.judulNaskah}</div>
                <div className="text-xs text-muted-foreground truncate">{r.pengarang}</div>
                {(r.published?.penerbit && r.published.penerbit !== "—" || r.published?.tahunTerbit && r.published.tahunTerbit !== "—") ? (
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{r.published?.penerbit !== "—" ? r.published?.penerbit : ""}</span>
                    <span>{r.published?.tahunTerbit !== "—" ? r.published?.tahunTerbit : ""}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        
        {/* Pagination */}
        <div className="p-2 border-t border-border flex items-center justify-between text-xs bg-card">
          <span>Total: {list.length}</span>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" className="w-7 h-7" disabled><ChevronLeft className="w-4 h-4" /></Button>
            <Button size="icon" variant="outline" className="w-7 h-7" disabled><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 3. TOP BREADCRUMB + NAVIGATION BAR */}
        <div className="border-b border-border bg-card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Korpus {row.corpus} &gt; Detail Buku
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-xs text-primary hover:underline flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Back
              </Link>
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {row.pengarang} · {row.published.tahunTerbit} · {row.published.penerbit}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>{currentIndex + 1} of {list.length}</span>
            <Button size="icon" variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="w-7 h-7"><ChevronLeft className="w-4 h-4" /></Button>
            <Button size="icon" variant="outline" onClick={handleNext} disabled={currentIndex === list.length - 1} className="w-7 h-7"><ChevronRight className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" className="text-xs h-8"><FolderOpen className="w-3 h-3 mr-1" /> Open Source</Button>
            <Button variant="outline" size="sm" className="text-xs h-8"><Download className="w-3 h-3 mr-1" /> Export</Button>
          </div>
        </div>

        {/* 4. MAIN DETAIL WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* A. CENTER-LEFT METADATA CARDS */}
          <div className="w-[300px] border-r border-border bg-card p-4 overflow-auto space-y-4 h-full">
            <MetadataCard title="Award / Corpus Identity">
              <dl>
                {row.corpus === "DKJ" && (
                  <>
                    <Field label="Jenis Sayembara" value={row.jenisSayembara} />
                    <Field label="Tahun Menang" value={row.tahunMenang} />
                    <Field label="Posisi" value={row.posisi} />
                    <Field label="Judul Naskah" value={row.judulNaskah} />
                    <Field label="Judul Setelah Terbit" value={row.judulBukuSetelahTerbit} />
                    <Field label="Judul Berubah?" value={row.judulBerubah} />
                    <Field label="Pengarang" value={row.pengarang} />
                    <Field label="Juri" value={row.juri} />
                    <Field label="Link" value={row.linkPengumuman} />
                  </>
                )}
                {row.corpus === "KSK" && (
                  <>
                    <Field label="Tahun KSK" value={row.tahunKSK} />
                    <Field label="Kategori" value={row.kategori} />
                    <Field label="Status KSK" value={row.statusKSK} />
                    <Field label="Judul Buku" value={row.judulBuku} />
                    <Field label="Pengarang" value={row.pengarang} />
                    <Field label="Link" value={row.linkPengumuman} />
                  </>
                )}
                {row.corpus === "Tempo" && (
                  <>
                    <Field label="Tahun Tempo" value={row.tahunTempo} />
                    <Field label="Kategori" value={row.kategori} />
                    <Field label="Status Tempo" value={row.statusTempo} />
                    <Field label="Judul Buku" value={row.judulBuku} />
                    <Field label="Pengarang" value={row.pengarang} />
                    <Field label="Link" value={row.linkArtikel} />
                  </>
                )}
              </dl>
            </MetadataCard>

            <MetadataCard title="Published Book Metadata">
              <dl>
                <Field label="Penerbit" value={row.published.penerbit} />
                <Field label="Tahun Terbit" value={row.published.tahunTerbit} />
                <Field label="ISBN" value={row.published.isbn} />
                <Field label="Harga" value={row.published.harga} />
                <Field label="Halaman" value={row.published.jumlahHalaman} />
                <Field label="Editor" value={row.published.editor} />
                <Field label="Desainer Sampul" value={row.published.desainerSampul} />
              </dl>
            </MetadataCard>
          </div>

          {/* B. CENTER PREVIEW WORKSPACE */}
          <div className="flex-1 flex flex-col bg-muted/20 h-full overflow-hidden">
            <Tabs defaultValue="front" className="flex-1 flex flex-col h-full overflow-hidden" onValueChange={setActiveTab}>
              <TabsList className="border-b border-border bg-card rounded-none h-10 px-4 justify-start space-x-2">
                <TabsTrigger value="front" className="text-xs h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Front Cover</TabsTrigger>
                <TabsTrigger value="back" className="text-xs h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Back Cover</TabsTrigger>
                <TabsTrigger value="paratext" className="text-xs h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Paratext</TabsTrigger>
                <TabsTrigger value="credit" className="text-xs h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Credit Page</TabsTrigger>
                <TabsTrigger value="google-books" className="text-xs h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Google Books</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-auto p-4 h-full">
                <TabsContent value="front" className="mt-0 h-full flex flex-col p-4 relative">
                  <Tabs key={row.id} defaultValue={row.frontCover?.edition2?.imageUrl ? "ed2" : "ed1"} className="w-full h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <TabsList className="h-8 bg-muted/50 border border-border">
                        <TabsTrigger value="ed1" className="text-xs h-7">Edisi 1</TabsTrigger>
                        <TabsTrigger value="ed2" className="text-xs h-7">Edisi 2</TabsTrigger>
                      </TabsList>
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setShowEditFront(!showEditFront)}>
                        Edit Cover
                      </Button>
                    </div>

                    {showEditFront && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[450px] space-y-4 p-6 bg-card border border-border shadow-2xl z-20">
                        <div className="flex justify-between items-center border-b border-border pb-2">
                          <h3 className="text-xs font-semibold uppercase">Update Front Cover</h3>
                          <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setShowEditFront(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Edisi 1 */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold">Edisi 1</h4>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Image URL</label>
                            <Input 
                              placeholder="URL..." 
                              className="text-xs h-8" 
                              value={frontUrl} 
                              onChange={(e) => setFrontUrl(e.target.value)} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Source URL</label>
                            <Input 
                              placeholder="Source URL..." 
                              className="text-xs h-8" 
                              value={frontSourceUrl} 
                              onChange={(e) => setFrontSourceUrl(e.target.value)} 
                            />
                          </div>
                        </div>

                        {/* Edisi 2 */}
                        <div className="border-t border-border pt-2 space-y-2">
                          <h4 className="text-xs font-semibold">Edisi 2 (Opsional)</h4>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Image URL</label>
                            <Input 
                              placeholder="URL..." 
                              className="text-xs h-8" 
                              value={frontEd2.imageUrl} 
                              onChange={(e) => setFrontEd2({...frontEd2, imageUrl: e.target.value})} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Source URL</label>
                            <Input 
                              placeholder="Source URL..." 
                              className="text-xs h-8" 
                              value={frontEd2.sourceUrl} 
                              onChange={(e) => setFrontEd2({...frontEd2, sourceUrl: e.target.value})} 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Penerbit</label>
                              <Input 
                                placeholder="Penerbit..." 
                                className="text-xs h-8" 
                                value={frontEd2.publisher} 
                                onChange={(e) => setFrontEd2({...frontEd2, publisher: e.target.value})} 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Tahun</label>
                              <Input 
                                placeholder="Tahun..." 
                                className="text-xs h-8" 
                                value={frontEd2.year} 
                                onChange={(e) => setFrontEd2({...frontEd2, year: e.target.value})} 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Button size="sm" className="w-full text-xs bg-[#2D4C3E] hover:bg-[#1e3a2f] text-white" onClick={() => {
                          handleSaveCover('front', frontUrl, frontSourceUrl, frontEd2);
                          setShowEditFront(false);
                        }}>
                          Save All
                        </Button>
                      </div>
                    )}

                    <TabsContent value="ed1" className="flex-1 flex items-center justify-center relative">
                      <ImageViewer 
                        src={row.frontCover?.imageUrl} 
                        alt="Front Cover Edisi 1" 
                      />
                      {/* Elegant Source Display */}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-muted-foreground/80 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-sm">
                        <span>Source: {row.frontCover?.sourceType || "—"}</span>
                        {row.frontCover?.sourceUrl && (
                          <a href={row.frontCover.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                            Link
                          </a>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="ed2" className="flex-1 flex items-center justify-center relative">
                      <ImageViewer 
                        src={row.frontCover?.edition2?.imageUrl} 
                        alt="Front Cover Edisi 2" 
                      />
                      {/* Elegant Source Display */}
                      <div className="absolute bottom-2 left-2 right-2 flex flex-col text-xs text-muted-foreground/80 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-sm">
                        <div className="flex justify-between">
                          <span>Penerbit: {row.frontCover?.edition2?.publisher || "—"} ({row.frontCover?.edition2?.year || "—"})</span>
                          {row.frontCover?.edition2?.sourceUrl && (
                            <a href={row.frontCover.edition2.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                              Link
                            </a>
                          )}
                        </div>
                      </div>
                    </TabsContent>


                  </Tabs>
                </TabsContent>
                
                <TabsContent value="back" className="mt-0 h-full flex flex-col p-4 relative">
                  <Tabs key={row.id} defaultValue={row.backCover?.edition2?.imageUrl ? "ed2" : "ed1"} className="w-full h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <TabsList className="h-8 bg-muted/50 border border-border">
                        <TabsTrigger value="ed1" className="text-xs h-7">Edisi 1</TabsTrigger>
                        <TabsTrigger value="ed2" className="text-xs h-7">Edisi 2</TabsTrigger>
                      </TabsList>
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setShowEditBack(!showEditBack)}>
                        Edit Cover
                      </Button>
                    </div>

                    {showEditBack && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[450px] space-y-4 p-6 bg-card border border-border shadow-2xl z-20">
                        <div className="flex justify-between items-center border-b border-border pb-2">
                          <h3 className="text-xs font-semibold uppercase">Update Back Cover</h3>
                          <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setShowEditBack(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Edisi 1 */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold">Edisi 1</h4>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Image URL</label>
                            <Input 
                              placeholder="URL..." 
                              className="text-xs h-8" 
                              value={backUrl} 
                              onChange={(e) => setBackUrl(e.target.value)} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Source URL</label>
                            <Input 
                              placeholder="Source URL..." 
                              className="text-xs h-8" 
                              value={backSourceUrl} 
                              onChange={(e) => setBackSourceUrl(e.target.value)} 
                            />
                          </div>
                        </div>

                        {/* Edisi 2 */}
                        <div className="border-t border-border pt-2 space-y-2">
                          <h4 className="text-xs font-semibold">Edisi 2 (Opsional)</h4>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Image URL</label>
                            <Input 
                              placeholder="URL..." 
                              className="text-xs h-8" 
                              value={backEd2.imageUrl} 
                              onChange={(e) => setBackEd2({...backEd2, imageUrl: e.target.value})} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Source URL</label>
                            <Input 
                              placeholder="Source URL..." 
                              className="text-xs h-8" 
                              value={backEd2.sourceUrl} 
                              onChange={(e) => setBackEd2({...backEd2, sourceUrl: e.target.value})} 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Penerbit</label>
                              <Input 
                                placeholder="Penerbit..." 
                                className="text-xs h-8" 
                                value={backEd2.publisher} 
                                onChange={(e) => setBackEd2({...backEd2, publisher: e.target.value})} 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Tahun</label>
                              <Input 
                                placeholder="Tahun..." 
                                className="text-xs h-8" 
                                value={backEd2.year} 
                                onChange={(e) => setBackEd2({...backEd2, year: e.target.value})} 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Button size="sm" className="w-full text-xs bg-[#2D4C3E] hover:bg-[#1e3a2f] text-white" onClick={() => {
                          handleSaveCover('back', backUrl, backSourceUrl, backEd2);
                          setShowEditBack(false);
                        }}>
                          Save All
                        </Button>
                      </div>
                    )}

                    <TabsContent value="ed1" className="flex-1 flex items-center justify-center relative">
                      <ImageViewer 
                        src={row.backCover?.imageUrl} 
                        alt="Back Cover Edisi 1" 
                      />
                      {/* Elegant Source Display */}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-muted-foreground/80 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-sm">
                        <span>Source: {row.backCover?.sourceType || "—"}</span>
                        {row.backCover?.sourceUrl && (
                          <a href={row.backCover.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                            Link
                          </a>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="ed2" className="flex-1 flex items-center justify-center relative">
                      <ImageViewer 
                        src={row.backCover?.edition2?.imageUrl} 
                        alt="Back Cover Edisi 2" 
                      />
                      {/* Elegant Source Display */}
                      <div className="absolute bottom-2 left-2 right-2 flex flex-col text-xs text-muted-foreground/80 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-sm">
                        <div className="flex justify-between">
                          <span>Penerbit: {row.backCover?.edition2?.publisher || "—"} ({row.backCover?.edition2?.year || "—"})</span>
                          {row.backCover?.edition2?.sourceUrl && (
                            <a href={row.backCover.edition2.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                              Link
                            </a>
                          )}
                        </div>
                      </div>
                    </TabsContent>


                  </Tabs>
                </TabsContent>

                <TabsContent value="paratext" className="mt-0 h-full space-y-4">
                  <div className="border border-border bg-card p-4 space-y-3">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Sinopsis Penerbit</h3>
                    <p className="text-sm leading-relaxed">{row.paratext.sinopsisPenerbit || "Tidak ada sinopsis."}</p>
                  </div>
                  <div className="border border-border bg-card p-4 space-y-3">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Blurb</h3>
                    <p className="text-sm leading-relaxed italic">"{row.paratext.blurb1}"</p>
                    <p className="text-xs text-right text-muted-foreground">— {row.paratext.pemberiBlurb1}</p>
                  </div>
                </TabsContent>

                <TabsContent value="credit" className="mt-0 h-full flex items-center justify-center">
                  <div className="text-xs text-muted-foreground">Credit page image or text goes here.</div>
                </TabsContent>

                <TabsContent value="google-books" className="mt-0 h-full flex flex-col space-y-4 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-semibold uppercase">Google Books Preview</h3>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowEditUrl(true)}>
                      Edit URL
                    </Button>
                  </div>
                  
                  <div className="flex-1 border border-border bg-card flex items-stretch justify-center min-h-[500px] relative">
                    {googleBooksUrl ? (
                      <iframe 
                        key={googleBooksUrl}
                        src={(() => {
                          try {
                            const u = new URL(googleBooksUrl);
                            const id = u.searchParams.get("id");
                            return id 
                              ? `https://books.google.com/books?id=${id}&output=embed`
                              : googleBooksUrl;
                          } catch { return googleBooksUrl; }
                        })()}
                        className="w-full min-h-[500px] border-0"
                        allowFullScreen
                        title="Google Books Preview"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full text-xs text-muted-foreground">Input Google Books URL to preview.</div>
                    )}
                    
                    {showEditUrl && (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 z-10">
                        <div className="w-full max-w-[350px] space-y-4 p-4 bg-card border border-border shadow-lg">
                          <div className="flex justify-between items-center border-b border-border pb-2">
                            <h3 className="text-xs font-semibold uppercase">Update Google Books URL</h3>
                            <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setShowEditUrl(false)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Google Books URL</label>
                            <Input 
                              placeholder="https://books.google.com/..." 
                              className="text-xs h-8" 
                              value={googleBooksUrl} 
                              onChange={(e) => setGoogleBooksUrl(e.target.value)} 
                            />
                          </div>
                          
                          <Button size="sm" className="w-full text-xs" onClick={() => { handleSaveGoogleBooksUrl(); setShowEditUrl(false); }}>
                            Save
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* C. RIGHT ANALYSIS / EVIDENCE PANEL */}
          <div className="w-[360px] border-l border-border bg-card p-4 overflow-auto space-y-4 h-full">
            <h2 className="text-sm font-semibold uppercase border-b border-border pb-2">Research Analysis</h2>
            
            <div className="border border-border bg-card p-3 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Verification Status</h3>
              <div className="flex items-center justify-between">
                <span>Overall:</span>
                <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${row.verificationStatus === 'Verified' ? 'bg-[oklch(0.92_0.05_155)] text-[oklch(0.3_0.06_155)]' : 'bg-[oklch(0.95_0.06_55)] text-[oklch(0.4_0.12_55)]'}`}>
                  {row.verificationStatus}
                </span>
              </div>
            </div>

            <div className="border border-border bg-card p-3 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Paratext Coding</h3>
              <div className="space-y-1 text-xs">
                <div><span className="text-muted-foreground">Kata Promosi:</span> {row.research.kataPromosiDominan}</div>
                <div><span className="text-muted-foreground">Label Genre:</span> {row.research.labelGenre}</div>
                <div><span className="text-muted-foreground">Klaim Estetika:</span> {row.research.klaimEstetika}</div>
              </div>
            </div>

            <div className="border border-border bg-card p-3 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Evidence Log</h3>
              <div className="space-y-2">
                {row.evidence.map((e, i) => (
                  <div key={i} className="text-xs border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex justify-between font-semibold mb-1">
                      <span>{e.sourceType}</span>
                      <span className="text-primary">{e.confidence}</span>
                    </div>
                    <p className="italic text-muted-foreground mb-1">"{e.excerpt}"</p>
                    <p className="text-[10px] text-muted-foreground">Accessed: {e.accessDate}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border bg-card p-3 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Next Action</h3>
              <p className="text-xs text-muted-foreground">{row.nextAction || "No action required."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
