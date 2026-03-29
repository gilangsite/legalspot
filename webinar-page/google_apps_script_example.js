function sendWebinarEmail() {
    // 1. Get the HTML template content
    // In a real usage, you might load this from a file or paste the HTML string here.
    // Ideally, use HtmlService.createHtmlOutputFromFile('email_template').getContent();

    var htmlTemplate = HtmlService.createTemplateFromFile('email_template');

    // 2. Set dynamic variables (replace with data from your Spreadsheet)
    htmlTemplate.nama = "Nama Peserta"; // Example name from sheet
    // Note: Webinar details are currently hardcoded in the HTML as requested.


    // 3. Evaluate the template
    var htmlBody = htmlTemplate.evaluate().getContent();

    // 4. Send the email
    MailApp.sendEmail({
        to: "budi@example.com",
        subject: "Pendaftaran Webinar Coretax Mastery Berhasil! 🎉",
        htmlBody: htmlBody
    });
}

/**
 * INSTRUCTIONS:
 * 1. Open your Google Spreadsheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Create a new HTML file named 'email_template.html' and paste the content of the file we created.
 * 4. Create a Script file (.gs) and paste the code above (adjusting to loop through your sheet data).
 * 5. Make sure to replace the poster image src in the HTML with a public URL.
 */
