import fs from 'fs';

const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

async function update() {
    const rawData = fs.readFileSync('scratch/dkj_raw_synopsis_filled_2.json', 'utf8');
    const sourcesToImport = JSON.parse(rawData);

    for (const source of sourcesToImport) {
        console.log(`Processing ${source.id}...`);
        
        // 1. Fetch current row
        const res = await fetch(`${url}?id=eq.${source.id}`, { headers });
        const rows = await res.json();
        if (rows.length === 0) {
            console.log(`Row ${source.id} not found.`);
            continue;
        }
        
        const row = rows[0];
        const paratext = row.paratext || {};
        const sourcesArray = paratext.rawSynopsisSources || [];
        
        // 2. Upsert source
        // Check if there is an existing source with the same sourceUrl
        const existingIdx = sourcesArray.findIndex(s => s.sourceUrl === source.sourceUrl);
        
        // Remove 'id' and 'judul' from the source object as they belong to the parent, 
        // though it's okay to keep them, we mainly need the source fields.
        const sourceObject = {
            sourceType: source.sourceType,
            sourceName: source.sourceName,
            sourceUrl: source.sourceUrl,
            rawSynopsisContributor: source.rawSynopsisContributor,
            rawSynopsisFullText: source.rawSynopsisFullText,
            scrapeStatus: source.scrapeStatus,
            httpStatus: source.httpStatus,
            scrapedAt: source.scrapedAt,
            extractionMethod: source.extractionMethod,
            rawSynopsisCharCount: source.rawSynopsisCharCount
        };

        if (existingIdx !== -1) {
            console.log(`  Updating existing source: ${source.sourceUrl}`);
            sourcesArray[existingIdx] = { ...sourcesArray[existingIdx], ...sourceObject };
        } else {
            console.log(`  Adding new source: ${source.sourceUrl}`);
            sourcesArray.push(sourceObject);
        }
        
        paratext.rawSynopsisSources = sourcesArray;

        // 3. Update row
        const updateRes = await fetch(`${url}?id=eq.${source.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ paratext })
        });
        
        if (updateRes.ok) {
            console.log(`Successfully updated paratext for ${source.id}.`);
        } else {
            console.error(`Failed to update ${source.id}:`, await updateRes.text());
        }
    }
}

update().catch(err => console.error(err));
