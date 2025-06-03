
export default async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };

  console.log('Function called with method:', event.httpMethod);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Request body is required' })
      };
    }

    let formData;
    try {
      formData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid JSON format' })
      };
    }

    console.log('Registration attempt received');

    const { name, email, phone, username, subscriptionType, paymentMethod } = formData;

    // Enhanced input validation and sanitization
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return '';
      return input.trim().replace(/[<>]/g, '').substring(0, 255);
    };

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedUsername = sanitizeInput(username);

    // Validate ALL required fields - email, phone, username, and paymentMethod
    if (!sanitizedEmail || !sanitizedPhone || !sanitizedUsername || !paymentMethod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'All fields are required: email, phone, username, and payment method' 
        })
      };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid email format' })
      };
    }

    // Phone format validation (Israeli format)
    const phoneRegex = /^(\+972|0)[5-9]\d{8}$|^05[0-9]-?\d{3}-?\d{4}$/;
    if (!phoneRegex.test(sanitizedPhone.replace(/[-\s]/g, ''))) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid phone format' })
      };
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    if (!usernameRegex.test(sanitizedUsername)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid username format' })
      };
    }

    // Validate subscription type and payment method
    const validSubscriptionTypes = ['new', 'renewal'];
    const validPaymentMethods = ['paybox', 'crypto'];
    
    if (!validSubscriptionTypes.includes(subscriptionType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid subscription type' })
      };
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid payment method' })
      };
    }

    const updateUrl = process.env.GOOGLE_SHEETS_UPDATE_URL;
    console.log('Update URL configured:', !!updateUrl);
    
    if (!updateUrl) {
      console.log('Google Sheets URL not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Google Sheets integration not configured'
        })
      };
    }

    const fetch = (await import('node-fetch')).default;
    
    const updateData = {
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      username: sanitizedUsername,
      subscriptionType,
      paymentMethod,
      timestamp: new Date().toISOString(),
      ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    };
    
    console.log('Sending data to Google Sheets:', JSON.stringify(updateData));
    
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'KingTVLand-Registration/1.0'
      },
      body: JSON.stringify(updateData),
      timeout: 15000
    });

    console.log('Google Sheets response status:', updateResponse.status);
    console.log('Google Sheets response headers:', updateResponse.headers.raw());
    
    const responseText = await updateResponse.text();
    console.log('Google Sheets response text:', responseText);

    // Try to parse as JSON first
    let updateResult;
    try {
      updateResult = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Response is not JSON, treating as text:', responseText);
      updateResult = { text: responseText };
    }

    if (updateResponse.ok) {
      // Check if it's a JSON response with success field
      if (updateResult.success === true || 
          updateResult.success === false ||
          (typeof updateResult.text === 'string' && updateResult.text.includes('Success'))) {
        
        if (updateResult.success === false) {
          console.error('Google Sheets update failed:', updateResult.error);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: updateResult.error || 'Registration failed' 
            })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Registration successful',
            details: updateResult.message || 'Record updated successfully'
          })
        };
      } else {
        console.error('Unexpected response format:', updateResult);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Unexpected response from Google Sheets' })
        };
      }
    } else {
      console.error('Google Sheets request failed with status:', updateResponse.status);
      return {
        statusCode: updateResponse.status,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: `Google Sheets error: ${updateResponse.status}` 
        })
      };
    }
  } catch (error) {
    console.error('Error processing registration:', error.message, error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
}

export { handler };
