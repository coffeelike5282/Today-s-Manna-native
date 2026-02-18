const fetch = require('node-fetch');

const SUPABASE_URL = 'https://quhfkeuvdszjmujukikb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aGZrZXV2ZHN6am11anVraWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzA2MDQsImV4cCI6MjA4NjU0NjYwNH0.36_PZpykhzO0fiR5eThmFqWX_vFN9tvao4uXYq199cs';
const DATE = '2026-02-19';

async function checkData() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/manna_verses?date=eq.${DATE}&select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const data = await response.json();
        console.log('DATA_START');
        console.log(JSON.stringify(data, null, 2));
        console.log('DATA_END');
    } catch (error) {
        console.error('FETCH_ERROR:', error);
    }
}

checkData();
