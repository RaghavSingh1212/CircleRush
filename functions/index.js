/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest, onCall } = require("firebase-functions/v2/https");
const {
  onDocumentWritten,
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
  Change,
  FirestoreEvent
} = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");

const { initializeApp, getApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { beforeEmailSent } = require("firebase-functions/identity");

const sgMail = require('@sendgrid/mail')
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const app = initializeApp();
const db = getFirestore(app);
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');

exports.helloWorld = onCall(() => {
  logger.info("Hello logs!", { structuredData: true });
  console.log("SHITTTTT");
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



// const msg = {
//   to: 'ppurathe@ucsc.edu', // Change to your recipient
//   from: 'ppurathe@ucsc.edu', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }

async function sendEmail({ recipientEmail, subject, text, html }) {
  const message = {
    to: recipientEmail,
    from: "mailcirclerush@gmail.com", // Verified sender
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(message);
    console.log(`Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${recipientEmail}:`, error);
    throw error;
  }
}



exports.sendMail = onCall(async (request, context) => {
  console.log(process.env.SENDGRID_API_KEY)
  const { recipientEmail, subject, text, html } = request.data;

  console.log(recipientEmail);
  console.log(subject);
  console.log(text);
  console.log(html);

  const message = {
    to: recipientEmail, // Change to your recipient
    from: 'mailcirclerush@gmail.com', // Change to your verified sender
    subject: subject,
    text: text,
    html: html,
  }

  await sgMail
    .send(message)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })

  return { message };
})


exports.notifyOnTaskCompletion = onCall(async (request, context) => {
  const { circleData, taskData } = request.data;

  // Check if the task's `completed` status changed to true
  const circleId = circleData.circleId
  const taskName = taskData.taskName;
  const completedBy = taskData.assignedUserId;

  try {
    // Get users with Circle Notifications enabled and exclude the task completer
    const usersToNotify = circleData.users.filter(
      (user) =>
        user.userName !== completedBy && // Exclude the task completer
        user.notifications?.circleUpdates // Only notify if Circle Notifications are enabled
    );

    // Extract email addresses of users to notify
    const userEmails = usersToNotify.map((user) => user.userName);

    if (userEmails.length === 0) {
      console.log("No users to notify based on notification settings.");
      return;
    }

    // Prepare email notifications
    // const sendMail = functions.httpsCallable("sendMail");
    const sendMailPromises = userEmails.map((email) =>
      sendEmail({
        recipientEmail: email,
        subject: `Task Completed in ${circleData.circleName}`,
        text: `The task "${taskName}" was completed by ${completedBy} in the circle "${circleData.circleName}"! They earned ${taskData.points} points.`,
        html: `<p>The task "<b>${taskName}</b>" was completed by <b>${completedBy}</b> in the circle "<b>${circleData.circleName}</b>".</p>
         <p>They earned <b>${taskData.points}</b> points for completing this task!</p>`,
      })
    );

    await Promise.all(sendMailPromises);

    console.log(`Notification emails sent to users in Circle ${circleId}`);
  } catch (error) {
    console.error("Error notifying users on task completion:", error);
  }
}
);