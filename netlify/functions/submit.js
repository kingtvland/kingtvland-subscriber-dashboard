
export default async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };

  console.log('Function called with method:', event.httpMethod);

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

    let formData;
    try {
      formData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON format' })
      };
    }

    console.log('Registration attempt received');

    const { name, email, phone, username, subscriptionType, paymentMethod } = formData;

    // Enhanced input validation and sanitization
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return '';
      return input.trim().replace(/[<>]/g, '').substring(0, 255); // Limit length
    };

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedUsername = sanitizeInput(username);

    // Validate required fields
    if (!sanitizedEmail || !paymentMethod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and payment method are required' })
      };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Phone format validation (Israeli format)
    const phoneRegex = /^(\+972|0)[5-9]\d{8}$|^05[0-9]-\d{3}-\d{4}$/;
    if (sanitizedPhone && !phoneRegex.test(sanitizedPhone.replace(/[-\s]/g, ''))) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid phone format' })
      };
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    if (sanitizedUsername && !usernameRegex.test(sanitizedUsername)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid username format' })
      };
    }

    // Validate subscription type and payment method
    const validSubscriptionTypes = ['new', 'renewal'];
    const validPaymentMethods = ['paybox', 'crypto'];
    
    if (!validSubscriptionTypes.includes(subscriptionType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid subscription type' })
      };
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid payment method' })
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
          message: 'Registration received (Google Sheets not configured)'
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
    
    console.log('Sending sanitized data to Google Sheets');
    
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'KingTVLand-Registration/1.0'
      },
      body: JSON.stringify(updateData),
      timeout: 10000 // 10 second timeout
    });

    const updateResult = await updateResponse.text();
    console.log('Google Sheets response received');

    if (updateResult.includes('Success') || updateResult.includes('updated')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Registration successful' })
      };
    } else {
      console.error('Google Sheets update failed:', updateResult);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Registration failed' })
      };
    }
  } catch (error) {
    console.error('Error processing registration:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

export { handler };
