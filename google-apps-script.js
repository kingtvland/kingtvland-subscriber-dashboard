
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
        name: e.parameter.name,
        email: e.parameter.email,
        phone: e.parameter.phone,
        username: e.parameter.username,
        subscriptionType: e.parameter.subscriptionType,
        paymentMethod: e.parameter.paymentMethod
      };
    }
    
    console.log('Parsed data:', JSON.stringify(data));
    
    // Validate required fields - need at least email, phone, and username
    if (!data.email || !data.phone || !data.username || !data.paymentMethod) {
      console.log('Missing required fields');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'Missing required fields: email, phone, username, and paymentMethod are required'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var email = data.email.toLowerCase().trim();
    var phone = data.phone.replace(/[-\s]/g, ''); // Remove spaces and dashes
    var username = data.username.toLowerCase().trim();
    var paymentMethod = data.paymentMethod;
    
    console.log('Looking for - Email:', email, 'Phone:', phone, 'Username:', username);
    
    // Get all data from the sheet
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    
    console.log('Sheet has', values.length, 'rows');
    
    // Define column indices (adjust based on your sheet structure)
    var nameColumnIndex = 0;      // Column A
    var emailColumnIndex = 1;     // Column B  
    var phoneColumnIndex = 2;     // Column C
    var usernameColumnIndex = 3;  // Column D
    var subscriptionColumnIndex = 4; // Column E
    var paymentMethodColumnIndex = 5; // Column F
    var registrationStatusColumnIndex = 6; // Column G
    
    // Search for matching records starting from row 2 (index 1)
    for (var i = 1; i < values.length; i++) {
      var rowEmail = values[i][emailColumnIndex];
      var rowPhone = values[i][phoneColumnIndex];
      var rowUsername = values[i][usernameColumnIndex];
      
      // Clean the data from the sheet
      var cleanRowEmail = rowEmail ? rowEmail.toString().toLowerCase().trim() : '';
      var cleanRowPhone = rowPhone ? rowPhone.toString().replace(/[-\s]/g, '') : '';
      var cleanRowUsername = rowUsername ? rowUsername.toString().toLowerCase().trim() : '';
      
      // Check if at least 2 parameters match
      var matches = 0;
      if (cleanRowEmail === email) matches++;
      if (cleanRowPhone === phone) matches++;
      if (cleanRowUsername === username) matches++;
      
      console.log('Row', i + 1, '- Email match:', cleanRowEmail === email, 
                  'Phone match:', cleanRowPhone === phone, 
                  'Username match:', cleanRowUsername === username, 
                  'Total matches:', matches);
      
      if (matches >= 2) {
        console.log('Found matching record in row:', i + 1);
        
        // Update the record with new information
        if (data.name) {
          sheet.getRange(i + 1, nameColumnIndex + 1).setValue(data.name);
        }
        if (data.email) {
          sheet.getRange(i + 1, emailColumnIndex + 1).setValue(data.email);
        }
        if (data.phone) {
          sheet.getRange(i + 1, phoneColumnIndex + 1).setValue(data.phone);
        }
        if (data.username) {
          sheet.getRange(i + 1, usernameColumnIndex + 1).setValue(data.username);
        }
        if (data.subscriptionType) {
          sheet.getRange(i + 1, subscriptionColumnIndex + 1).setValue(data.subscriptionType);
        }
        
        // Update Payment Method
        sheet.getRange(i + 1, paymentMethodColumnIndex + 1).setValue(paymentMethod);
        
        // Update Registration Status
        sheet.getRange(i + 1, registrationStatusColumnIndex + 1).setValue('רשום');
        
        // Add timestamp
        var timestampColumn = 7; // Column H
        sheet.getRange(i + 1, timestampColumn + 1).setValue(new Date());
        
        console.log('Updated row', i + 1, 'with payment method:', paymentMethod);
        
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            message: 'Record updated successfully',
            rowNumber: i + 1
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    console.log('No matching record found with at least 2 matching parameters');
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'No matching record found. At least 2 parameters (email, phone, username) must match an existing record.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Server error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: 'GET method not supported. Use POST.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
