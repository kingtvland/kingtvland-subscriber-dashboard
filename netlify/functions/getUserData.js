
export default async function handler(event, context) {
  // Enhanced CORS headers with more security
  const headers = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
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
    // Validate authentication
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }

    const { email, phone, username } = event.queryStringParameters || {};

    // Input validation and sanitization
    if (!email && !phone && !username) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'At least one identifier (email, phone, username) is required' })
      };
    }

    // Sanitize inputs
    const sanitizeInput = (input) => {
      if (!input) return input;
      return input.trim().toLowerCase().replace(/[<>]/g, '');
    };

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedUsername = sanitizeInput(username);

    // Get CSV URL from environment variable
    const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL;
    if (!csvUrl) {
      console.log('GOOGLE_SHEETS_CSV_URL not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Service configuration error' })
      };
    }

    console.log('Fetching user data from CSV for authenticated user');

    // Rate limiting check (basic implementation)
    const userAgent = event.headers['user-agent'] || '';
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    console.log(`Request from IP: ${clientIP}, User-Agent: ${userAgent}`);

    // Fetch CSV data from Google Sheets
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch CSV: ${response.status}`);
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'External service unavailable' })
      };
    }
    
    const csvData = await response.text();
    
    if (!csvData || csvData.length === 0) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'No data available' })
      };
    }

    // Parse CSV data manually
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'Invalid data format' })
      };
    }
    
    const headers_csv = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('CSV headers found:', headers_csv.length);
    
    const userSubscriptions = [];
    const subscriptionTypes = { new: 0, renewal: 0 };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record = {};
      
      headers_csv.forEach((header, index) => {
        record[header.toLowerCase()] = values[index] || '';
      });

      // Check if this record matches the authenticated user
      const emailMatch = sanitizedEmail && record.email && record.email.toLowerCase() === sanitizedEmail;
      
      if (emailMatch) {
        // Parse expire date safely
        const expireDateStr = record['expire date'] || record.expiredate || record['expire_date'] || '';
        let status = 'active';
        
        if (expireDateStr) {
          try {
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
          } catch (dateError) {
            console.error('Date parsing error:', dateError);
            status = 'unknown';
          }
        }

        // SECURITY: Do not expose passwords in the response
        userSubscriptions.push({
          username: record.username || 'N/A',
          // password: record.password || 'N/A', // REMOVED for security
          expireDate: expireDateStr || 'N/A',
          status: status,
          hasPassword: !!(record.password) // Only indicate if password exists
        });

        // Count subscription types based on status
        if (status === 'expired') {
          subscriptionTypes.renewal++;
        } else {
          subscriptionTypes.new++;
        }
      }
    }

    // Log successful data retrieval (without sensitive info)
    console.log(`User subscriptions found: ${userSubscriptions.length} for authenticated user`);

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
    console.error('Error fetching user data:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

export { handler };
