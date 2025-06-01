exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, paymentMethod } = JSON.parse(event.body);
    console.log('Received data:', { email, paymentMethod });

    if (!email || !paymentMethod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing email or payment method' })
      };
    }

    // Now try to update the Google Sheet via Apps Script
    const updateUrl = process.env.GOOGLE_SHEETS_UPDATE_URL || 
      'https://script.google.com/macros/s/AKfycbzrdTbbQ8xoTxqGfGp8YheUVZkoCMBqV7m9qWp1D0w4jcVuBRZnoP_R2Nb3XpH1HPNA9A/exec';
    
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
