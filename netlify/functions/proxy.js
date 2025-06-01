exports.handler = async (event) => {
  const fetch = (await import('node-fetch')).default; // שימוש ב-import דינמי
  const url = 'https://script.google.com/macros/s/AKfycbzrdTbbQ8xoTxqGfGp8YheUVZkoCMBqV7m9qWp1D0w4jcVuBRZnoP_R2Nb3XpH1HPNA9A/exec';

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
