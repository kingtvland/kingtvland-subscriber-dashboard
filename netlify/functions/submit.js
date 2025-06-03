
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
    return new Response('', { status: 200, headers });
  }

  if (event.httpMethod !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    if (!event.body) {
      return new Response(JSON.stringify({ success: false, error: 'Request body is required' }), {
        status: 400,
        headers
      });
    }

    let formData;
    try {
      formData = JSON.parse(event.body);
    } catch (parseError) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON format' }), {
        status: 400,
        headers
      });
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
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'All fields are required: email, phone, username, and payment method' 
      }), {
        status: 400,
        headers
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email format' }), {
        status: 400,
        headers
      });
    }

    // Phone format validation (Israeli format)
    const phoneRegex = /^(\+972|0)[5-9]\d{8}$|^05[0-9]-?\d{3}-?\d{4}$/;
    if (!phoneRegex.test(sanitizedPhone.replace(/[-\s]/g, ''))) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid phone format' }), {
        status: 400,
        headers
      });
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    if (!usernameRegex.test(sanitizedUsername)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid username format' }), {
        status: 400,
        headers
      });
    }

    // Validate subscription type and payment method
    const validSubscriptionTypes = ['new', 'renewal'];
    const validPaymentMethods = ['paybox', 'crypto'];
    
    if (!validSubscriptionTypes.includes(subscriptionType)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid subscription type' }), {
        status: 400,
        headers
      });
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid payment method' }), {
        status: 400,
        headers
      });
    }

    const updateUrl = process.env.GOOGLE_SHEETS_UPDATE_URL;
    if (!updateUrl) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Google Sheets integration not configured' 
      }), {
        status: 500,
        headers
      });
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
      if (updateResult.success === false) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: updateResult.error || 'Registration failed' 
        }), {
          status: 400,
          headers
        });
      }
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Registration successful',
        details: updateResult.message || 'Record updated successfully'
      }), {
        status: 200,
        headers
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Google Sheets error: ${updateResponse.status}` 
      }), {
        status: updateResponse.status,
        headers
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers
    });
  }
}

export { handler };
