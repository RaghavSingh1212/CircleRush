/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");


const functions = require('firebase-functions');
const { initializeApp, getApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { beforeEmailSent } = require("firebase-functions/identity");


const app = initializeApp();
const db = getFirestore(app);


exports.helloWorld = onCall(() => {
  logger.info("Hello logs!", { structuredData: true });
  console.log("SHITTTTT");
});

exports.generateEmailBody = onCall((request, context) => {
  // Extract inputs from the client
  const { recipientName, circleName } = request.data;

  console.log(recipientName);
  console.log(circleName);


  if (!recipientName || !circleName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required input fields: recipientName, circleName"
    );
  }

  // Construct the email body
  const emailBody = `
    Hi ${recipientName},

    You have been invited to join the circle "${circleName}"!

    Click the link below to accept your invitation:

    Best regards,
    The CircleRush Team
  `;

  logger.info("Generated email body:", { emailBody });

  // Return the generated email body
  return { emailBody };
});



// to test in the emulator
// in the terminal run 'firebase functions:shell'
// inside the shell run 'setInterval(() => checkCircleCompletion(), 30000)' <- this runs the function every 30 seconds


exports.checkCircleCompletion = onSchedule("every 5 minutes", async () => {
  console.log("RUN");
  const now = new Date();

  // Query circles where the completion time has passed
  const circlesRef = db.collection("Circles");
  const querySnapshot = await circlesRef
    .where("completionTime", "<=", now)
    .get();

  const filteredCircles = querySnapshot.docs.filter(
    (doc) => doc.data().status === "active"
  );

  if (filteredCircles.length === 0) {
    console.log("No circles to complete at this time.");
    return;
  }

  // Handle each completed circle
  filteredCircles.forEach(async (doc) => {
    const circle = doc.data();
    console.log(`CIRCLE COMPLETED: ${circle.circleName}`);

    // Update the circle's status to 'completed'
    await doc.ref.update({ status: "completed" });

    // Optionally, restart the circle
    // const newCompletionTime = Timestamp.fromDate(
    //   new Date(circle.completionTime.toDate().getTime() + circle.duration * 24 * 60 * 60 * 1000)
    // );
    // await doc.ref.update({ status: "active", completionTime: newCompletionTime });

    // console.log(`CIRCLE RESTARTED: ${circle.circleName} with new completion time: ${newCompletionTime.toDate()}`);
  });
});




// write function for sending emails to join circle
// write function for general email notfications, ex: 'From circleName: person A completed a task worth X points', can be enabled or disabled in circle settings
// enable notifications for upcoming deadlines for tasks








// const axios = require('axios');


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



// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
