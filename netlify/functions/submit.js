
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

    // Fetch CSV data from Google Sheets using built-in fetch
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    const csvData = await response.text();
    
    console.log('CSV data received, length:', csvData.length);

    // Parse CSV data manually (simple parser for this use case)
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('No data in CSV');
    }
    
    const headers_csv = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('CSV headers:', headers_csv);

    // Find matching records by email
    let emailFound = false;
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record = {};
      
      headers_csv.forEach((header, index) => {
        record[header.toLowerCase()] = values[index] || '';
      });

      // Check for email match
      const emailMatch = record.email && record.email.toLowerCase() === email.toLowerCase();
      
      if (emailMatch) {
        emailFound = true;
        console.log('Email found in row:', i + 1);
        break;
      }
    }

    if (!emailFound) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Email not found in system' })
      };
    }

    // Now try to update the Google Sheet via Apps Script
    const updateUrl = process.env.GOOGLE_SHEETS_UPDATE_URL || 'https://script.google.com/macros/s/AKfycbzrdTbbQ8xoTxqGfGp8YheUVZkoCMBqV7m9qWp1D0w4jcVuBRZnoP_R2Nb3XpH1HPNA9A/exec';
    
    console.log('Attempting to update sheet via:', updateUrl);
    
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        paymentMethod: paymentMethod
      })
    });

    const updateResult = await updateResponse.text();
    console.log('Update response:', updateResult);

    if (updateResult.includes('Success') || updateResponse.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Registration successful and sheet updated'
        })
      };
    } else {
      // If update fails, still return success since email was found
      console.log('Sheet update failed but email was found');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Registration successful (update may have failed)'
        })
      };
    }

  } catch (error) {
    console.error('Error processing registration:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + error.message })
    };
  }
};
