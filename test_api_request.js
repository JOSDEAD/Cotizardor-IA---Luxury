const fs = require('fs');

// Mock Data
const mockData = {
    clientName: "Cliente API Test",
    reference: "API-TEST-001",
    date: "26/11/2025",
    zones: [
        {
            name: "Zona API",
            items: [
                { name: "Item API 1", description: "Test via API", unit: "unid", qty: 5, price: 20000, tax: 0.13 }
            ]
        }
    ]
};

async function testApi() {
    try {
        console.log("Sending request to http://localhost:3000/api/quote...");

        const response = await fetch('http://localhost:3000/api/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        fs.writeFileSync('api_generated_quote.pdf', Buffer.from(buffer));
        console.log("Success! PDF saved to api_generated_quote.pdf");

    } catch (error) {
        console.error("API Test Failed:", error);
    }
}

testApi();
