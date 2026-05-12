import fs from 'fs';

const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    "Prefer": "resolution=merge" // For upsert behavior if supported by PostgREST
};

async function importKSK() {
    const filePath = 'scratch/ksk_import.json';
    if (!fs.existsSync(filePath)) {
        console.error(`File ${filePath} not found. Please provide the file.`);
        return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const booksToImport = JSON.parse(rawData);

    console.log(`Loaded ${booksToImport.length} books from ${filePath}`);

    for (const book of booksToImport) {
        console.log(`Processing ${book.id} (${book.judulBuku})...`);
        
        // Ensure corpus is set to KSK
        book.corpus = "KSK";
        
        // Map fields if necessary (assuming the JSON already has the correct keys based on the user's prompt)
        // If the JSON uses different keys, we will need to adjust this mapping.
        
        // Example of upsert using POST with Prefer header (Standard PostgREST behavior)
        const res = await fetch(url, {
            method: "POST",
            headers: {
                ...headers,
                "Prefer": "resolution=merge" // This makes it an upsert if the ID matches
            },
            body: JSON.stringify(book)
        });

        if (res.ok) {
            console.log(`  Successfully upserted ${book.id}.`);
        } else {
            console.error(`  Failed to upsert ${book.id}:`, await res.text());
        }
    }
}

importKSK().catch(err => console.error(err));
