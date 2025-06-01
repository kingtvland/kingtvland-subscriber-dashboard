
function doPost(e) {
  try {
    console.log('Received POST request');
    console.log('Content type:', e.postData.type);
    console.log('Raw data:', e.postData.contents);
    
    var sheet = SpreadsheetApp.getActiveSheet();
    var data;
    
    // Parse the incoming data
    if (e.postData.type === 'application/json') {
      data = JSON.parse(e.postData.contents);
    } else {
      // Handle form data
      data = {
        email: e.parameter.email,
        paymentMethod: e.parameter.paymentMethod
      };
    }
    
    console.log('Parsed data:', JSON.stringify(data));
    
    if (!data.email || !data.paymentMethod) {
      console.log('Missing required fields');
      return ContentService
        .createTextOutput('Missing required fields')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    var email = data.email.toLowerCase().trim();
    var paymentMethod = data.paymentMethod;
    
    console.log('Looking for email:', email);
    console.log('Payment method:', paymentMethod);
    
    // Get all data from the sheet
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    
    console.log('Sheet has', values.length, 'rows');
    
    // Find the email column (column F = index 5)
    var emailColumnIndex = 5; // 0-based index for column F
    var paymentMethodColumnIndex = 6; // 0-based index for column G
    var registrationStatusColumnIndex = 7; // 0-based index for column H
    
    // Search for the email starting from row 2 (index 1)
    for (var i = 1; i < values.length; i++) {
      var rowEmail = values[i][emailColumnIndex];
      
      if (rowEmail && rowEmail.toString().toLowerCase().trim() === email) {
        console.log('Found email in row:', i + 1);
        
        // Update Payment Method (column G)
        sheet.getRange(i + 1, paymentMethodColumnIndex + 1).setValue(paymentMethod);
        
        // Update Registration Status (column H)
        sheet.getRange(i + 1, registrationStatusColumnIndex + 1).setValue('רשום');
        
        console.log('Updated row', i + 1, 'with payment method:', paymentMethod);
        
        return ContentService
          .createTextOutput('Success')
          .setMimeType(ContentService.MimeType.TEXT);
      }
    }
    
    console.log('Email not found in sheet');
    return ContentService
      .createTextOutput('Email not found')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    console.error('Error in doPost:', error.toString());
    return ContentService
      .createTextOutput('Error: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('GET method not supported')
    .setMimeType(ContentService.MimeType.TEXT);
}
