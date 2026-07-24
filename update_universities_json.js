const fs = require('fs');

const universitiesJson = JSON.parse(fs.readFileSync('universities.json', 'utf8'));
const feesData = JSON.parse(fs.readFileSync('data/fees_data.json', 'utf8'));

const keyMapping = {
    'amu': 'Asia Metropolitan University (AMU)',
    'apu': 'Asia Pacific University of Technology & Innovation (APU)',
    'help': 'HELP University',
    'icms': 'ICMS',
    'limkokwing': 'Limkokwing University of Creative Technology',
    'lincoln': 'Lincoln University College',
    'mmu': 'Multimedia University (MMU)',
    'ucsi': 'UCSI University',
    'umw': 'International University of Malaya-Wales (IUMW)',
    'unikl': 'Universiti Kuala Lumpur (UniKL)'
};

for (const [id, name] of Object.entries(keyMapping)) {
    if (!feesData[id] || !feesData[id].categories) continue;
    
    let programs = [];
    feesData[id].categories.forEach(cat => {
        if (cat.table && cat.table.rows) {
            cat.table.rows.forEach(row => {
                if (row[0] && row[1]) {
                    programs.push({
                        name: row[1].replace(/<[^>]*>?/gm, '').trim(),
                        level: row[0].replace(/<[^>]*>?/gm, '').trim(),
                        duration: row[2] ? row[2].replace(/<[^>]*>?/gm, '').trim() : 'N/A'
                    });
                }
            });
        }
    });

    const newEntry = { name: name, campuses: ['Main Campus'], programs: programs };
    
    const existingIndex = universitiesJson.findIndex(u => u.name === name);
    if (existingIndex !== -1) {
        universitiesJson[existingIndex] = newEntry;
    } else {
        universitiesJson.push(newEntry);
    }
}

fs.writeFileSync('universities.json', JSON.stringify(universitiesJson, null, 4));
console.log('Successfully updated universities.json with the 10 new universities.');
