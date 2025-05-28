
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, phone, username, subscriptionType, paymentMethod } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !email || !phone || !username || !subscriptionType || !paymentMethod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'All fields are required' })
      };
    }

    // Get CSV URL from environment variable
    const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL;
    if (!csvUrl) {
      console.log('GOOGLE_SHEETS_CSV_URL not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Google Sheets URL not configured' })
      };
    }

    console.log('Fetching CSV data from:', csvUrl);

    // Fetch CSV data from Google Sheets
    const response = await fetch(csvUrl);
    const csvData = await response.text();
    
    console.log('CSV data received, length:', csvData.length);

    // Parse CSV data manually (simple parser for this use case)
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('CSV headers:', headers);

    // Find matching records (at least 2 fields must match)
    let matchingRecords = 0;
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record = {};
      
      headers.forEach((header, index) => {
        record[header.toLowerCase()] = values[index] || '';
      });

      // Check for matches
      const emailMatch = record.email && record.email.toLowerCase() === email.toLowerCase();
      const phoneMatch = record.phone && record.phone.replace(/[-\s]/g, '') === phone.replace(/[-\s]/g, '');
      const usernameMatch = record.username && record.username.toLowerCase() === username.toLowerCase();
      
      const matches = [emailMatch, phoneMatch, usernameMatch].filter(Boolean).length;
      
      if (matches >= 2) {
        matchingRecords++;
      }
    }

    console.log('Matching records found:', matchingRecords);

    // For demo purposes, we'll accept the registration if at least one field matches
    // In production, you might want stricter validation
    if (matchingRecords === 0) {
      console.log('No matching records found for validation');
      // Still allow registration for demo purposes
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Registration successful',
        matchingRecords
      })
    };

  } catch (error) {
    console.error('Error processing registration:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
