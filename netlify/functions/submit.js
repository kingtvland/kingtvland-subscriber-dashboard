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
    const { param1, param2, paymentMethod } = JSON.parse(event.body);
    console.log('Received data:', { param1, param2, paymentMethod });

    if (!param1 || !param2 || !paymentMethod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing param1, param2, or payment method' })
      };
    }

    const updateUrl = process.env.GOOGLE_SHEETS_UPDATE_URL ||
      'https://script.google.com/macros/s/AKfycbzrdTbbQ8xoTxqGfGp8YheUVZkoCMBqV7m9qWp1D0w4jcVuBRZnoP_R2Nb3XpH1HPNA9A/exec';

    const fetch = (await import('node-fetch')).default; // Dynamic import
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ param1, param2, paymentMethod })
    });

    const updateResult = await updateResponse.text();
    console.log('Update response:', updateResult);

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
