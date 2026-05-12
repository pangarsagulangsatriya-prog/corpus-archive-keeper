const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

const data = [
    { id: "DKJ_2010_NOVEL_02", url: "https://down-id.img.susercontent.com/file/0b69b57b14bbbd34c25f9d4e19ce3c6d", source: "https://shopee.co.id/Lampuki-Arafat-Nur-i.41126818.16102896330" },
    { id: "DKJ_2012_NOVEL_01", url: "https://cf.shopee.co.id/file/d0c1580e5e80db534f262d262dcee0b6", source: "https://tessabuku.blogspot.com/2022/05/download-semusim-dan-semusim-lagi-cu.html" },
    { id: "DKJ_2012_NOVEL_05", url: "https://down-id.img.susercontent.com/file/id-11134207-7qul6-lfwp5uul3g5386", source: "https://shopee.co.id/Buku-Novel-Dewi-Kharisma-Michellia-%E2%80%94-Surat-Panjang-tentang-Jarak-Kita-yang-Jutaan-Tahun-Cahaya-%28Unggulan-DKJ-2012%29-i.134059147.22065834575" },
    { id: "DKJ_2014_NOVEL_03", url: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//101/MTA-57410893/no_brand_napas_mayat_bagus_dwi_hananto_buku_novel_fiksi_buku_fiksi_buku_novel_dewasa_buku_sastra_dewasa_full02_tloz3gu7.jpg", source: "https://www.blibli.com/p/napas-mayat-bagus-dwi-hananto-buku-novel-fiksi-buku-fiksi-buku-novel-dewasa-buku-sastra-dewasa/ps--RAB-70140-03594" },
    { id: "DKJ_2016_NOVEL_03", url: "https://down-id.img.susercontent.com/file/id-11134207-7r98z-lv67jci90fp4b2", source: "https://shopee.co.id/Novel-Tanah-Surga-Merah-karya-Arafat-Nur-i.122200111.24780006389" },
    { id: "DKJ_2019_NOVEL_01", url: "https://down-id.img.susercontent.com/file/sg-11134201-23010-7iknz9v2l4lv0f", source: "https://shopee.co.id/AIB-DAN-NASIB-Minanto-Marjin-Kiri-i.86688232.23517403704" },
    { id: "DKJ_2023_NOVEL_01", url: "https://down-id.img.susercontent.com/file/id-11134207-7rbkc-m7qx4fw0aojl4d", source: "https://shopee.co.id/Novel-Tersesat-Setelah-Terlahir-Kembali-Yoga-Zen-Marjin-Kiri-i.269300573.28280714942" },
    { id: "DKJ_2023_NOVEL_02", url: "https://down-id.img.susercontent.com/file/sg-11134201-82599-mg36giy1zrpp05", source: "https://shopee.co.id/Leiden-2020-1920-%28Hasbunallah-Haris%29-i.63842097.41925261491" }
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
        const backcover = row.backcover || {};
        backcover.imageUrl = item.url;
        backcover.sourceUrl = item.source;
        
        // 2. Update row
        const updateRes = await fetch(`${url}?id=eq.${item.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ backcover })
        });
        
        if (updateRes.ok) {
            console.log(`Updated ${item.id} successfully.`);
        } else {
            console.error(`Failed to update ${item.id}:`, await updateRes.text());
        }
    }
}

update();
