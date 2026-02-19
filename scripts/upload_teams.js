const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000/api/admin/teams/bulk';
const CSV_FILE_PATH = path.join(__dirname, './teams.csv');

async function uploadTeams() {
    try {
        if (!fs.existsSync(CSV_FILE_PATH)) {
            console.error(`Error: CSV file not found at ${CSV_FILE_PATH}`);
            console.log("Please create a 'teams.csv' file in the root directory with columns: name,email,track");
            return;
        }

        const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
        const lines = csvContent.split('\n');
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const teams = [];

        console.log(`Parsing ${lines.length} lines...`);

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',');
            const team = {};

            headers.forEach((header, index) => {
                if (values[index]) {
                    team[header] = values[index].trim();
                }
            });

            if (team.name && team.email) {
                teams.push(team);
            }
        }

        console.log(`Sending ${teams.length} teams to API...`);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teams)
        });

        const result = await response.json();
        console.log('Upload Result:', result);

    } catch (error) {
        console.error('Script Error:', error);
    }
}

uploadTeams();
