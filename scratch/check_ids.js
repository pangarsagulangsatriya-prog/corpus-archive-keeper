const url = "https://yvdkrhqbuknjvdqyxoaw.supabase.co/rest/v1/books";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM";

const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
};

async function run() {
    const res = await fetch(`${url}`, { headers });
    const rows = await res.json();
    
    if (!Array.isArray(rows)) {
        console.log("Response is not an array. Content:", JSON.stringify(rows));
        return;
    }
    
    const row2016 = rows.find(r => r.id === "DKJ_2016_NOVEL_05");
    console.log(`\nID: DKJ_2016_NOVEL_05`);
    if (row2016) {
        console.log(JSON.stringify(row2016, null, 2));
    } else {
        console.log(`  Not found.`);
    }
    
    const row2018 = rows.find(r => r.id === "DKJ_2018_NOVEL_01");
    console.log(`\nID: DKJ_2018_NOVEL_01`);
    if (row2018) {
        console.log(JSON.stringify(row2018, null, 2));
    } else {
        console.log(`  Not found.`);
    }
}

run().catch(err => console.error(err));
