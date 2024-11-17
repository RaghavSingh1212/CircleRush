/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest, onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();

// const axios = require('axios');


exports.addmessage = onCall((request) => {
  logger.info("CODE RUNSSSS BITCHHHHHH")
});


// Cloud Function to send an email using Mailgun
// exports.sendMailgunEmail = functions.https.onCall(async (data, context) => {

//   logger.info("REACHED function ");

//   const { toEmails, subject, text } = data; // Extract recipients, subject, and text from request

//   const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

//   console.log("made it to function");
//   // Form data payload for the Mailgun API
//   const emailData = {
//     from: `Excited User <mailgun@${MAILGUN_DOMAIN}>`,
//     to: 'pranavsp2003@gmail.com', // array of emails or single email
//     subject: subject,
//     text: text,
//   };

//   try {
//     const response = await axios.post(mailgunUrl, null, {
//       auth: {
//         username: 'api',
//         password: MAILGUN_API_KEY,
//       },
//       params: emailData,
//     });
    
//     return { success: true, message: 'Email sent successfully!' };
//   } catch (error) {
//     console.error('Error sending email:', error.response ? error.response.data : error.message);
//     throw new functions.https.HttpsError('internal', 'Failed to send email');
//   }
// });


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onCall(() => {
  logger.info("Hello logs!", {structuredData: true});
  // response.send("Hello from Firebase!");
});


// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
