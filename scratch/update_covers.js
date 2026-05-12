const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

const data = [
    { id: "DKJ_2010_NOVEL_02", url: "https://gpu.id/data-gpu/images/img-book/92800/619173014.jpg", source: "https://gpu.id/book/92800/lampuki" },
    { id: "DKJ_2012_NOVEL_01", url: "https://gpu.id/data-gpu/images/img-book/93612/621202025.jpg", source: "https://gpu.id/book/93612/semusim-dan-semusim-lagi" },
    { id: "DKJ_2012_NOVEL_02", url: "https://penerbitombak.com/wp-content/uploads/2017/09/DASAMUKA.jpg", source: "https://penerbitombak.com/product/dasamuka/" },
    { id: "DKJ_2012_NOVEL_05", url: "https://gpu.id/data-gpu/images/uploads/dirimg_buku/re_buku_picture_update_86910.jpg", source: "https://gpu.id/book/86910/surat-panjang-tentang-jarak-kita-yang-jutaan-tahun-cahaya" },
    { id: "DKJ_2014_NOVEL_03", url: "https://gpu.id/data-gpu/images/uploads/dirimg_buku/re_buku_picture_88874.jpg", source: "https://gpu.id/book/88874/napas-mayat" },
    { id: "DKJ_2016_NOVEL_03", url: "https://gpu.id/data-gpu/images/img-book/92801/619173015.jpg", source: "https://gpu.id/book/92801/tanah-surga-merah" },
    { id: "DKJ_2019_NOVEL_01", url: "https://marjinkiri.id/wp-content/uploads/2025/08/AIB-NASIB-2025-FCover-680x987.jpg", source: "https://marjinkiri.id/product/aib-dan-nasib/" },
    { id: "DKJ_2021_NOVEL_01", url: "https://gpu.id/data-gpu/images/img-book/93840/622173002.jpg", source: "https://gpu.id/book/93840/kereta-semar-lembu" },
    { id: "DKJ_2023_NOVEL_01", url: "https://marjinkiri.id/wp-content/uploads/2024/12/TERSESAT-FCover-680x985.jpg", source: "https://marjinkiri.id/product/tersesat-setelah-terlahir-kembali/" },
    { id: "DKJ_2023_NOVEL_02", url: "https://gpu.id/data-gpu/images/img-book/95104/625173016.jpg", source: "https://gpu.id/book/95104/leiden-2020-1920" }
];

async function update() {
    for (const item of data) {
        console.log(`Updating ${item.id}...`);
        // 1. Fetch current row
        const res = await fetch(`${url}?id=eq.${item.id}`, { headers });
        const rows = await res.json();
        if (rows.length === 0) {
            console.log(`Row ${item.id} not found.`);
            continue;
        }
        
        const row = rows[0];
        const frontcover = row.frontcover || {};
        frontcover.imageUrl = item.url;
        frontcover.sourceUrl = item.source;
        
        // 2. Update row
        const updateRes = await fetch(`${url}?id=eq.${item.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ frontcover })
        });
        
        if (updateRes.ok) {
            console.log(`Updated ${item.id} successfully.`);
        } else {
            console.error(`Failed to update ${item.id}:`, await updateRes.text());
        }
    }
}

update();
