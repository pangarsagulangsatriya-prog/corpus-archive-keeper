const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

const data = [
    { id: "DKJ_2003_NOVEL_03", url: "https://fliphtml5.com/aausu/pnpy/Tabula_Rasa_by_Ratih_Kumala/" },
    { id: "DKJ_2014_NOVEL_01", url: "https://fliphtml5.com/dyage/zsti/KAMBING_DAN_HUJAN/" },
    { id: "DKJ_2014_NOVEL_02", url: "https://fliphtml5.com/fdufi/avne/Di_Tanah_Lada_by_Ziggy_Zezsyazeoviennazabrizkie/" },
    { id: "DKJ_2016_NOVEL_01", url: "https://fliphtml5.com/izjcm/qpjr/Semua_Ikan_Di_Langit_Karya_Ziggy._Z/" }
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
        const published = row.published || {};
        published.fliphtml5Url = item.url;
        
        // 2. Update row
        const updateRes = await fetch(`${url}?id=eq.${item.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ published })
        });
        
        if (updateRes.ok) {
            console.log(`Updated ${item.id} successfully.`);
        } else {
            console.error(`Failed to update ${item.id}:`, await updateRes.text());
        }
    }
}

update();
