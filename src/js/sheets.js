/* =====================================================================
   NimbleX — Google Sheets Form Integration
   =====================================================================
   This file handles submitting the signup form's data to a Google Sheet
   via a Google Apps Script Web App endpoint.

   SETUP STEPS:
   1. Open your Google Sheet → Extensions → Apps Script
   2. Paste the Apps Script code from the comment below, deploy as Web App
      (Execute as: Me | Who has access: Anyone) → copy the Web App URL
   3. Replace SHEETS_URL below with your Web App URL

   Apps Script code to paste (uses doGet to avoid CORS issues):
   ---------------------------------------------------------------------
   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var p = e.parameter;
     if (sheet.getLastRow() === 0) {
       sheet.appendRow(['Timestamp','Name','Mobile','Email','City','Level']);
     }
     sheet.appendRow([
       new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'}),
       p.name, p.mobile, p.email, p.city, p.level
     ]);
     return ContentService
       .createTextOutput(JSON.stringify({status:'ok'}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ---------------------------------------------------------------------
*/

var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzbeHd5M1HhViAjDq8kw7qP-IPEa4bdU_NLYolx4rhAGxCNZIiukTKgcbpUjiXzck-mFQ/exec';

/**
 * Submits form data to the configured Google Sheet endpoint.
 * @param {Object} data - { name, mobile, email, city, level }
 * @param {Function} onComplete - called after the request finishes (success or failure)
 */
function submitToGoogleSheets(data, onComplete) {
  // Form-encoded POST — Apps Script accepts this without CORS preflight
  var formData = new FormData();
  formData.append('name', data.name);
  formData.append('mobile', data.mobile);
  formData.append('email', data.email);
  formData.append('city', data.city);
  formData.append('level', data.level);

  fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  })
  .then(function() {
    if (typeof onComplete === 'function') onComplete();
  })
  .catch(function(err) {
    console.error('Sheets error:', err);
    if (typeof onComplete === 'function') onComplete();
  });
}