import fs from 'fs';

const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

async function update() {
    const rawData = fs.readFileSync('scratch/dkj_raw_synopsis_sources_filled_54.json', 'utf8');
    const booksToImport = JSON.parse(rawData);

    for (const book of booksToImport) {
        console.log(`Processing ${book.id} (${book.judulBuku})...`);
        
        if (!book.sources || book.sources.length === 0) {
            console.log(`  No sources for ${book.id}. Skipping.`);
            continue;
        }

        const res = await fetch(`${url}?id=eq.${book.id}`, { headers });
        const rows = await res.json();
        if (rows.length === 0) {
            console.log(`  Row ${book.id} not found in database.`);
            continue;
        }
        
        const dbRow = rows[0];
        const paratext = dbRow.paratext || {};
        const sourcesArray = paratext.rawSynopsisSources || [];
        
        for (const source of book.sources) {
            const existingIdx = sourcesArray.findIndex(s => s.sourceUrl === source.sourceUrl);
            
            const sourceObject = {
                sourceType: source.sourceType,
                sourceName: source.sourceName,
                sourceUrl: source.sourceUrl,
                rawSynopsisContributor: source.rawSynopsisContributor || "",
                rawSynopsisFullText: source.rawSynopsisFullText,
                scrapeStatus: source.scrapeStatus,
                validationNote: source.validationNote,
                scrapedAt: new Date().toISOString()
            };

            if (existingIdx !== -1) {
                console.log(`    Updating existing source: ${source.sourceUrl}`);
                sourcesArray[existingIdx] = { ...sourcesArray[existingIdx], ...sourceObject };
            } else {
                console.log(`    Adding new source: ${source.sourceUrl}`);
                sourcesArray.push(sourceObject);
            }
        }
        
        paratext.rawSynopsisSources = sourcesArray;

        const updateRes = await fetch(`${url}?id=eq.${book.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ paratext })
        });
        
        if (updateRes.ok) {
            console.log(`  Successfully updated paratext for ${book.id}.`);
        } else {
            console.error(`  Failed to update ${book.id}:`, await updateRes.text());
        }
    }
}

update().catch(err => console.error(err));
