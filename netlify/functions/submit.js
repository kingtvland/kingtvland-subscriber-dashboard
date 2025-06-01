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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const { username, phone, email, paymentMethod } = JSON.parse(event.body);

    if (!paymentMethod || (!username && !phone && !email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const updateUrl = process.env.GOOGLE_SHEETS_UPDATE_URL;
    if (!updateUrl) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Google Sheets URL not configured' })
      };
    }

    const fetch = (await import('node-fetch')).default;
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, phone, email, paymentMethod })
    });

    const updateResult = await updateResponse.text();

    if (updateResult.includes('Success')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Registration successful' })
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: updateResult })
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
