
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  console.log('Function called with method:', event.httpMethod);
  console.log('Function called with body:', event.body);

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

    const formData = JSON.parse(event.body);
    console.log('Parsed form data:', formData);

    const { name, email, phone, username, subscriptionType, paymentMethod } = formData;

    if (!email || !paymentMethod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and payment method are required' })
      };
    }

    const updateUrl = process.env.GOOGLE_SHEETS_UPDATE_URL;
    console.log('Update URL configured:', !!updateUrl);
    
    if (!updateUrl) {
      console.log('Google Sheets URL not configured, simulating success for testing');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Registration received (Google Sheets not configured)',
          data: formData
        })
      };
    }

    const fetch = (await import('node-fetch')).default;
    
    const updateData = {
      name,
      email,
      phone,
      username,
      subscriptionType,
      paymentMethod
    };
    
    console.log('Sending to Google Sheets:', updateData);
    
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.text();
    console.log('Google Sheets response:', updateResult);

    if (updateResult.includes('Success') || updateResult.includes('updated')) {
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
