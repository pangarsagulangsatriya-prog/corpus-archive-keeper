import fs from 'fs';

const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

const data = [
  { id: "DKJ_2003_NOVEL_01", url: "https://books.google.com/books/about/Dadaisme.html?id=OJ8yjHlEjFYC" },
  { id: "DKJ_2003_NOVEL_02", url: "https://books.google.com/books/about/Geni_Jora.html?id=fmzlKMELxRAC" },
  { id: "DKJ_2003_NOVEL_03", url: "https://books.google.com/books/about/Tabula_rasa.html?id=V3rAh_R0nPoC" },
  { id: "DKJ_2006_NOVEL_01", url: "https://books.google.com/books/about/Hubbu.html?id=l6qzMi2K4rAC" },
  { id: "DKJ_2006_NOVEL_03", url: "https://books.google.com/books/about/Jukstaposisi.html?id=Cr6aCgAAQBAJ" },
  { id: "DKJ_2006_NOVEL_05", url: "https://books.google.com/books/about/Lanang.html?id=9r7VCwAAQBAJ" },
  { id: "DKJ_2008_NOVEL_01", url: "https://books.google.com/books/about/Tanah_Tabu_Cover_Baru.html?id=T0pFDwAAQBAJ" },
  { id: "DKJ_2010_NOVEL_01", url: "https://books.google.com/books/about/Persiden.html?id=G_RfCwAAQBAJ" },
  { id: "DKJ_2010_NOVEL_03", url: "https://books.google.com/books/about/Jatisaba.html?id=YpV3qy92lekC" },
  { id: "DKJ_2012_NOVEL_01", url: "https://books.google.com/books/about/Semusim_dan_Semusim_Lagi.html?id=WVVFDwAAQBAJ" },
  { id: "DKJ_2012_NOVEL_05", url: "https://books.google.com/books/about/Surat_Panjang_Tentang_Jarak_Kita_yang_Ju.html?id=AldFDwAAQBAJ" },
  { id: "DKJ_2014_NOVEL_01", url: "https://books.google.com/books/about/Kambing_dan_Hujan.html?id=7fFaDwAAQBAJ" },
  { id: "DKJ_2014_NOVEL_04", url: "https://books.google.com/books/about/Puya_ke_Puya_NEW.html?id=7qlNEAAAQBAJ" },
  { id: "DKJ_2016_NOVEL_03", url: "https://books.google.com/books?id=V0tFDwAAQBAJ" },
  { id: "DKJ_2016_NOVEL_05", url: "https://books.google.com/books/about/24_Jam_Bersama_Gaspar.html?id=M0iGEAAAQBAJ" },
  { id: "DKJ_2019_NOVEL_02", url: "https://books.google.com/books/about/Sang_Keris.html?id=bcnTDwAAQBAJ" },
  { id: "DKJ_2019_NOVEL_03", url: "https://books.google.com/books/about/Haniyah_dan_Ala_di_Rumah_Teteruga.html?id=ryAZEAAAQBAJ" },
  { id: "DKJ_2021_NOVEL_02", url: "https://books.google.com/books/about/Bagaimana_Cara_Mengurangi_Berat_Badan.html?id=B4fQEAAAQBAJ" },
  { id: "DKJ_2021_NOVEL_03", url: "https://books.google.com/books/about/Lantak_La.html?id=Jry9EAAAQBAJ" }
];

async function run() {
    for (const item of data) {
        console.log(`Processing ${item.id}...`);
        
        // 1. Fetch current row
        const res = await fetch(`${url}?id=eq.${item.id}`, { headers });
        const rows = await res.json();
        if (rows.length === 0) {
            console.log(`  Row ${item.id} not found.`);
            continue;
        }
        
        const row = rows[0];
        const published = row.published || {};
        
        // 2. Update field
        published.googleBooksUrl = item.url;
        
        // 3. Update row
        const updateRes = await fetch(`${url}?id=eq.${item.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ published })
        });
        
        if (updateRes.ok) {
            console.log(`  Successfully updated googleBooksUrl for ${item.id}.`);
        } else {
            console.error(`  Failed to update ${item.id}:`, await updateRes.text());
        }
    }
}

run().catch(err => console.error(err));
