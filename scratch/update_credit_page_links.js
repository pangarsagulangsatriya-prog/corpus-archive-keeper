import fs from 'fs';

const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

const data = [
  {
    "id": "DKJ_2016_NOVEL_05",
    "creditPageUrl": "https://books.google.com/books?id=M0iGEAAAQBAJ&printsec=copyright",
    "publisherContentImageUrl": "https://books.google.co.id/books/publisher/content?id=M0iGEAAAQBAJ&hl=id&pg=PR4&img=1&zoom=3&sig=ACfU3U3DPCHgicZ8WVSSUBm8dkErF04HiA&w=1280"
  },
  {
    "id": "DKJ_2006_NOVEL_01",
    "creditPageUrl": "https://books.google.com/books?id=l6qzMi2K4rAC&printsec=copyright",
    "publisherContentImageUrl": ""
  },
  {
    "id": "DKJ_2019_NOVEL_03",
    "creditPageUrl": "https://books.google.com/books?id=ryAZEAAAQBAJ&printsec=copyright",
    "publisherContentImageUrl": ""
  }
];

async function run() {
    for (const item of data) {
        console.log(`Processing ${item.id}...`);
        
        const res = await fetch(`${url}?id=eq.${item.id}`, { headers });
        const rows = await res.json();
        if (rows.length === 0) {
            console.log(`  Row ${item.id} not found.`);
            continue;
        }
        
        const row = rows[0];
        const published = row.published || {};
        
        published.creditPageUrl = item.creditPageUrl;
        published.publisherContentImageUrl = item.publisherContentImageUrl;
        
        const updateRes = await fetch(`${url}?id=eq.${item.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ published })
        });
        
        if (updateRes.ok) {
            console.log(`  Successfully updated credit page links for ${item.id}.`);
        } else {
            console.error(`  Failed to update ${item.id}:`, await updateRes.text());
        }
    }
}

run().catch(err => console.error(err));
