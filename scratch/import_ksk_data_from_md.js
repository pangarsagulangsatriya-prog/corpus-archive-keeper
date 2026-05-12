import fs from 'fs';

const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

async function importKSK() {
    const filePath = 'c:\\Users\\Feedloop\\Downloads\\ksk_award_master_2000_2025_books_import_ready.md';
    if (!fs.existsSync(filePath)) {
        console.error(`File ${filePath} not found.`);
        return;
    }

    console.log(`Reading file ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract JSON block
    const jsonStartMarker = "## BOOKS_IMPORT_JSON\n\n```json\n";
    const jsonEndMarker = "\n```";
    
    const startIndex = content.indexOf(jsonStartMarker);
    if (startIndex === -1) {
        console.error("Could not find ## BOOKS_IMPORT_JSON marker in file.");
        return;
    }
    
    const jsonStartIndex = startIndex + jsonStartMarker.length;
    const endIndex = content.indexOf(jsonEndMarker, jsonStartIndex);
    if (endIndex === -1) {
        console.error("Could not find closing code block marker.");
        return;
    }
    
    const jsonText = content.substring(jsonStartIndex, endIndex);
    
    console.log("Parsing JSON...");
    const booksToImport = JSON.parse(jsonText);
    console.log(`Loaded ${booksToImport.length} books.`);

    // Batch size for upsert (Supabase REST API supports array inserts)
    // PostgREST supports upserting arrays if we use Prefer: resolution=merge
    // Let's try to upsert in chunks to avoid large payload errors
    const chunkSize = 50;
    for (let i = 0; i < booksToImport.length; i += chunkSize) {
        const chunk = booksToImport.slice(i, i + chunkSize);
        console.log(`Upserting chunk ${i / chunkSize + 1} (${chunk.length} items)...`);
        
        // Whitelist of allowed keys in lowercase based on Supabase schema
        const allowedKeys = [
            'id', 'corpus', 'issample', 'verificationstatus', 'nextaction', 'halamankreditnotes', 'pengarang', 'judulbuku', 'penerbit', 'tahunterbit', 'isbn', 'harga', 'jumlahhalaman', 'editor', 'desainersampul', 'kategori', 'linkpengumuman', 'jenissayembara', 'tahunmenang', 'posisi', 'judulnaskah', 'judulbukusetelahterbit', 'judulberubah', 'statusterbit', 'jarakmenangterbit', 'juri', 'pertanggungjawabanjuri', 'tahunksk', 'statusksk', 'juricatatan', 'tahuntempo', 'statustempo', 'artikeltempo', 'kutipantempo', 'linkartikel', 'frontcover', 'backcover', 'paratext', 'research', 'published', 'evidence'
        ];

        // Convert top-level keys to lowercase and filter by whitelist
        const cleanChunk = chunk.map(book => {
            const cleanBook = {};
            for (const key in book) {
                const lowerKey = key.toLowerCase();
                if (allowedKeys.includes(lowerKey)) {
                    cleanBook[lowerKey] = book[key];
                }
            }
            return cleanBook;
        });
        
        const res = await fetch(url, {
            method: "POST",
            headers: {
                ...headers,
                "Prefer": "resolution=merge-duplicates" // PostgREST upsert header
            },
            body: JSON.stringify(cleanChunk)
        });

        if (res.ok) {
            console.log(`  Successfully upserted chunk.`);
        } else {
            console.error(`  Failed to upsert chunk:`, await res.text());
            // If it fails, let's try to log the first item to see what's wrong
            console.log("Sample item:", JSON.stringify(chunk[0]));
            break; // Stop on error
        }
    }
}

importKSK().catch(err => console.error(err));
