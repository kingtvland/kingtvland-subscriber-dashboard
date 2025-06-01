exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    if (!event.body) {
      console.error('No request body provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Request body is required' })
      };
    }

    const fetch = (await import('node-fetch')).default;
    const url = process.env.GOOGLE_SHEETS_UPDATE_URL;

    if (!url) {
      console.error('Google Sheets URL not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Google Sheets URL not configured' })
      };
    }

    console.log('Forwarding request to:', url);
    console.log('Request body:', event.body);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    const text = await response.text();
    console.log('Response from Google Apps Script:', text);

    return {
      statusCode: response.ok ? 200 : response.status,
      headers,
      body: JSON.stringify({ success: true, data: text })
    };
  } catch (error) {
    console.error('Error in proxy function:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: `Internal server error: ${error.message}` })
    };
  }
};
