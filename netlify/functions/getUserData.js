
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, phone, username } = event.queryStringParameters || {};

    if (!email && !phone && !username) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'At least one identifier (email, phone, username) is required' })
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

    console.log('Fetching user data from CSV:', csvUrl);

    // Fetch CSV data from Google Sheets
    const response = await fetch(csvUrl);
    const csvData = await response.text();
    
    console.log('CSV data received for user data');

    // Parse CSV data manually
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const userSubscriptions = [];
    const subscriptionTypes = { new: 0, renewal: 0 };

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record = {};
      
      headers.forEach((header, index) => {
        record[header.toLowerCase()] = values[index] || '';
      });

      // Check if this record matches the user
      const emailMatch = email && record.email && record.email.toLowerCase() === email.toLowerCase();
      const phoneMatch = phone && record.phone && record.phone.replace(/[-\s]/g, '') === phone.replace(/[-\s]/g, '');
      const usernameMatch = username && record.username && record.username.toLowerCase() === username.toLowerCase();
      
      if (emailMatch || phoneMatch || usernameMatch) {
        // Determine subscription status based on expire date
        const expireDate = new Date(record['expire date'] || record.expiredate || '');
        const now = new Date();
        let status = 'active';
        
        if (isNaN(expireDate.getTime())) {
          status = 'unknown';
        } else if (expireDate < now) {
          status = 'expired';
        } else if ((expireDate.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000)) {
          status = 'expiring';
        }

        userSubscriptions.push({
          username: record.username || 'N/A',
          password: record.password || 'N/A',
          expireDate: record['expire date'] || record.expiredate || 'N/A',
          status: status
        });

        // Count subscription types (for demo, we'll randomly assign)
        if (Math.random() > 0.5) {
          subscriptionTypes.new++;
        } else {
          subscriptionTypes.renewal++;
        }
      }
    }

    console.log('User subscriptions found:', userSubscriptions.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        subscriptions: userSubscriptions,
        subscriptionData: [
          { type: 'מנוי חדש', count: subscriptionTypes.new, color: '#ffd700' },
          { type: 'הארכת מנוי', count: subscriptionTypes.renewal, color: '#4b0082' }
        ],
        totalSubscribers: userSubscriptions.length
      })
    };

  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
