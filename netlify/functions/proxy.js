const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const url = 'https://script.google.com/macros/s/AKfycbzrdTbbQ8xoTxqGfGp8YheUVZkoCMBqV7m9qWp1D0w4jcVuBRZnoP_R2Nb3XpH1HPNA9A/exec';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: event.body,
  });
  const text = await response.text();
  return {
    statusCode: 200,
    body: text,
  };
};
