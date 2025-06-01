exports.handler = async (event) => {
  const fetch = (await import('node-fetch')).default;
  const url = process.env.GOOGLE_SHEETS_UPDATE_URL;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    const result = await response.text();
    return {
      statusCode: response.ok ? 200 : response.status,
      body: result
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
