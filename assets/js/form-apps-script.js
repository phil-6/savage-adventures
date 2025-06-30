/**
 * This is a Google Apps Script for handling form submissions.
 * It runs as an extension on a Google Sheet.
 */

// if you want to store your email server-side (hidden), uncomment the next line
const TO_ADDRESS = "";
const ERROR_EMAIL = "";
const TURNSTILE_SECRET_KEY = ""

function validate_turnstile(token) {
    const payload = {
        secret: TURNSTILE_SECRET_KEY,
        response: token
    };

    const options = {
        method: 'post',
        payload: payload,
        muteHttpExceptions: true // Optional: to avoid errors throwing
    };

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
}

/**
 * record_data inserts the data received from the html form submission
 * formData is the data received from the POST
 */
function record_data(formData) {
    const lock = LockService.getDocumentLock();
    lock.waitLock(30000); // hold off up to 30 sec to avoid concurrent writing

    try {
        // log the POST data in case we need to debug it. Not convinced this works in the new Apps Script editor
        Logger.log(JSON.stringify(formData));

        // select the 'responses' sheet by default
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        const sheetName = formData.parameter.formGoogleSheetName || "responses";
        const sheet = doc.getSheetByName(sheetName);

        const oldHeader = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const newHeader = oldHeader.slice();
        const fieldsFromForm = getDataColumns(formData.parameter);
        const row = [new Date()]; // first element in the row should always be a timestamp

        // loop through the header columns
        let i;
        let field;
        let output;
        for (i = 1; i < oldHeader.length; i++) { // start at 1 to avoid Timestamp column
            field = oldHeader[i];
            output = getFieldFromData(field, formData.parameter);
            row.push(output);

            // mark as stored by removing from form fields
            const formIndex = fieldsFromForm.indexOf(field);
            if (formIndex > -1) {
                fieldsFromForm.splice(formIndex, 1);
            }
        }

        // set any new fields in our form
        for (i = 0; i < fieldsFromForm.length; i++) {
            field = fieldsFromForm[i];
            output = getFieldFromData(field, formData.parameter);
            row.push(output);
            newHeader.push(field);
        }

        // more efficient to set values as [][] array than individually
        const nextRow = sheet.getLastRow() + 1; // get next row
        sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

        // update header row with any new data
        if (newHeader.length > oldHeader.length) {
            sheet.getRange(1, 1, 1, newHeader.length).setValues([newHeader]);
        }
    } catch (error) {
        Logger.log(error);
        MailApp.sendEmail({
            to: ERROR_EMAIL,
            subject: "SavAdv: record data Error",
            htmlBody: String(error) + "<br><hr><br>" + JSON.stringify(formData.parameter, null, 2)
        });
    } finally {
        lock.releaseLock();
        return;
    }
}

function getDataColumns(data) {
    const skipColumns = [
        'formDataNameOrder',
        'formGoogleSheetName',
        'formGoogleSendEmail',
        'honeypot',
        'formGoogleSend',
        'submit'
    ];
    return Object.keys(data).filter(column => !skipColumns.includes(column));
}

function getFieldFromData(field, data) {
    const values = data[field] || '';
    const output = values.join ? values.join(', ') : values;
    return output;
}

// spit out all the keys/values from the form in HTML for email
function formatMailBody(formData) {
    let result = "";
    const skipKeys = [
        'cf-turnstile-response',
        'formDataNameOrder',
        'formGoogleSheetName',
        'formGoogleSend'
    ];

    for (const [key, value] of Object.entries(formData.parameter)) {
        if (skipKeys.includes(key)) {
            continue;
        }
        result += "<h4 style='text-transform: capitalize; margin-bottom: 0'>" + key + "</h4><div>" + sanitizeInput(value) + "</div>";
        // for every key, concatenate an `<h4 />`/`<div />` pairing of the key name and its value,
        // and append it to the `result` string created at the start.
    }
    return result;
}

// sanitize content from the user - trust no one
// ref: https://developers.google.com/apps-script/reference/html/html-output#appendUntrusted(String)
function sanitizeInput(rawInput) {
    const placeholder = HtmlService.createHtmlOutput(" ");
    placeholder.appendUntrusted(rawInput);

    return placeholder.getContent();
}

function doPost(formData) {
    try {
        const cf_validate = validate_turnstile(formData.parameter["cf-turnstile-response"]);
        formData.parameter.cfValidated = cf_validate.success
        formData.parameter.cfTime = cf_validate.challenge_ts
        Logger.log(formData); // the Google Script version of console.log see: Class Logger
        record_data(formData);

        // if you have your email uncommented above, it uses that `TO_ADDRESS`
        // otherwise, it defaults to the email provided by the form's data attribute
        let sendEmailTo = (typeof TO_ADDRESS !== "undefined") ? TO_ADDRESS : formData.parameter.formGoogleSendEmail;

        // send email if to address is set
        if (sendEmailTo && cf_validate.success) {
            MailApp.sendEmail({
                to: String(sendEmailTo),
                subject: String(formData.parameter.subject),
                replyTo: String(formData.parameter.email),
                htmlBody: formatMailBody(formData)
            });
        }

        return ContentService    // return json success results
            .createTextOutput(
                JSON.stringify({
                    "result": "success",
                    "data": JSON.stringify(formData.parameter)
                }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) { // if error return this
        Logger.log(error);
        MailApp.sendEmail({
            to: ERROR_EMAIL,
            subject: "SavAdv: Early Form Submission Error",
            htmlBody: String(error)
        });

        return ContentService
            .createTextOutput(JSON.stringify({"result": "error", "error": error}))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
