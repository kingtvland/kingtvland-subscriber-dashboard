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
    const url = 'https://script.google.com/macros/s/AKfycbzrdTbbQ8xoTxqGfGp8YheUVZkoCMBqV7m9qWp1D0w4jcVuBRZnoP_R2Nb3XpH1HPNA9A/exec';

    console.log('Forwarding request to:', url);
    console.log('Request body:', event.body);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    if (!response.ok) {
      console.error('Fetch failed with status:', response.status, response.statusText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ success: false, error: `Fetch failed: ${response.statusText}` })
      };
    }

    const text = await response.text();
    console.log('Response from Google Apps Script:', text);

    return {
      statusCode: 200,
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
