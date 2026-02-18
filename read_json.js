const fs = require('fs');
try {
    const rawContent = fs.readFileSync('db_sample.json', 'utf16le');
    const cleanedContent = rawContent.replace(/^\uFEFF/, '');
    const data = JSON.parse(cleanedContent);
    if (data && data.length > 0) {
        console.log('FIELDS_START');
        console.log(Object.keys(data[0]).join(', '));
        console.log('FIELDS_END');
        console.log('SAMPLE_EN_VERSE_TEXT:', data[0].verse_text_en || 'NULL');
        console.log('SAMPLE_EN_REFERENCE:', data[0].reference_en || 'NULL');
    } else {
        console.log('NO_DATA_FOUND');
    }
} catch (e) {
    console.error('ERROR:', e.message);
}
