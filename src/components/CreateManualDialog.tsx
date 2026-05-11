import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function CreateManualDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    id: "",
    corpus: "DKJ",
    pengarang: "",
    judulBuku: "",
    // DKJ
    jenisSayembara: "",
    tahunMenang: "",
    posisi: "",
    judulNaskah: "",
    // KSK
    tahunKSK: "",
    statusKSK: "",
    // Tempo
    tahunTempo: "",
    statusTempo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!formData.id) throw new Error("ID wajib diisi.");
      if (!formData.corpus) throw new Error("Corpus wajib diisi.");

      // Prepare data (remove empty fields for specific corpora)
      const dataToInsert: any = {
        id: formData.id,
        corpus: formData.corpus,
        pengarang: formData.pengarang,
        judulBuku: formData.judulBuku,
      };

      if (formData.corpus === "DKJ") {
        dataToInsert.jenisSayembara = formData.jenisSayembara;
        dataToInsert.tahunMenang = formData.tahunMenang;
        dataToInsert.posisi = formData.posisi;
        dataToInsert.judulNaskah = formData.judulNaskah;
      } else if (formData.corpus === "KSK") {
        dataToInsert.tahunKSK = formData.tahunKSK;
        dataToInsert.statusKSK = formData.statusKSK;
      } else if (formData.corpus === "Tempo") {
        dataToInsert.tahunTempo = formData.tahunTempo;
        dataToInsert.statusTempo = formData.statusTempo;
      }

      const { error: insertError } = await supabase.from('books').insert([dataToInsert]);

      if (insertError) throw insertError;

      setOpen(false);
      // Reset form
      setFormData({
        id: "",
        corpus: "DKJ",
        pengarang: "",
        judulBuku: "",
        jenisSayembara: "",
        tahunMenang: "",
        posisi: "",
        judulNaskah: "",
        tahunKSK: "",
        statusKSK: "",
        tahunTempo: "",
        statusTempo: "",
      });
      // Refresh
      queryClient.invalidateQueries({ queryKey: ['corpus'] });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Create Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Manual Data</DialogTitle>
            <DialogDescription>
              Isi data buku secara manual. ID harus unik.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                ID *
              </Label>
              <Input
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="col-span-3"
                placeholder="DKJ-2026-001"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="corpus" className="text-right">
                Corpus *
              </Label>
              <select
                id="corpus"
                name="corpus"
                value={formData.corpus}
                onChange={handleChange}
                className="col-span-3 h-9 rounded-sm border border-border bg-background px-2 text-sm"
              >
                <option value="DKJ">DKJ</option>
                <option value="KSK">KSK</option>
                <option value="Tempo">Tempo</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pengarang" className="text-right">
                Pengarang
              </Label>
              <Input
                id="pengarang"
                name="pengarang"
                value={formData.pengarang}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="judulBuku" className="text-right">
                Judul Buku
              </Label>
              <Input
                id="judulBuku"
                name="judulBuku"
                value={formData.judulBuku}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            {/* Dynamic Fields based on Corpus */}
            {formData.corpus === "DKJ" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="jenisSayembara" className="text-right">
                    Jenis
                  </Label>
                  <Input
                    id="jenisSayembara"
                    name="jenisSayembara"
                    value={formData.jenisSayembara}
                    onChange={handleChange}
                    className="col-span-3"
                    placeholder="Novel / Puisi"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tahunMenang" className="text-right">
                    Tahun
                  </Label>
                  <Input
                    id="tahunMenang"
                    name="tahunMenang"
                    value={formData.tahunMenang}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="posisi" className="text-right">
                    Posisi
                  </Label>
                  <Input
                    id="posisi"
                    name="posisi"
                    value={formData.posisi}
                    onChange={handleChange}
                    className="col-span-3"
                    placeholder="Pemenang I / Unggulan"
                  />
                </div>
              </>
            )}

            {formData.corpus === "KSK" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tahunKSK" className="text-right">
                    Tahun KSK
                  </Label>
                  <Input
                    id="tahunKSK"
                    name="tahunKSK"
                    value={formData.tahunKSK}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="statusKSK" className="text-right">
                    Status KSK
                  </Label>
                  <Input
                    id="statusKSK"
                    name="statusKSK"
                    value={formData.statusKSK}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}

            {formData.corpus === "Tempo" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tahunTempo" className="text-right">
                    Tahun Tempo
                  </Label>
                  <Input
                    id="tahunTempo"
                    name="tahunTempo"
                    value={formData.tahunTempo}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="statusTempo" className="text-right">
                    Status Tempo
                  </Label>
                  <Input
                    id="statusTempo"
                    name="statusTempo"
                    value={formData.statusTempo}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-red-600 text-sm col-span-4 text-center">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
