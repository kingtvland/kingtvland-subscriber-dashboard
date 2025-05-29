
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

    // Fetch CSV data from Google Sheets using built-in fetch
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    const csvData = await response.text();
    
    console.log('CSV data received for user data, length:', csvData.length);

    // Parse CSV data manually
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('No data in CSV');
    }
    
    const headers_csv = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('CSV headers:', headers_csv);
    
    const userSubscriptions = [];
    const subscriptionTypes = { new: 0, renewal: 0 };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record = {};
      
      headers_csv.forEach((header, index) => {
        record[header.toLowerCase()] = values[index] || '';
      });

      // Check if this record matches the user by email (primary matching)
      const emailMatch = email && record.email && record.email.toLowerCase() === email.toLowerCase();
      
      if (emailMatch) {
        // Parse expire date
        const expireDateStr = record['expire date'] || record.expiredate || record['expire_date'] || '';
        let status = 'active';
        
        if (expireDateStr) {
          const expireDate = new Date(expireDateStr);
          const now = new Date();
          
          if (!isNaN(expireDate.getTime())) {
            if (expireDate < now) {
              status = 'expired';
            } else if ((expireDate.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000)) {
              status = 'expiring';
            }
          } else {
            status = 'unknown';
          }
        }

        userSubscriptions.push({
          username: record.username || 'N/A',
          password: record.password || 'N/A',
          expireDate: expireDateStr || 'N/A',
          status: status
        });

        // Count subscription types based on status
        if (status === 'expired') {
          subscriptionTypes.renewal++;
        } else {
          subscriptionTypes.new++;
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
          { type: 'מנוי פעיל', count: subscriptionTypes.new, color: '#ffd700' },
          { type: 'מנוי לחידוש', count: subscriptionTypes.renewal, color: '#4b0082' }
        ],
        totalSubscribers: userSubscriptions.length
      })
    };

  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + error.message })
    };
  }
};
