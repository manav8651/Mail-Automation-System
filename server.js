const express = require('express');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth')
const { google } = require('googleapis');


const {sendReply, createLabel, addLabel, getUnrepliesMessages} = require('./app');

const app = express();

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://mail.google.com/",
];

app.get("/api", async (req, res) => {
    const auth = await authenticate({
        keyfilePath: path.join(__dirname, "credentials.json"),
        scopes: SCOPES,
      });

      const gmail = google.gmail({ version: "v1", auth });


      const response = await gmail.users.labels.list({
        userId: "me",
      });
    
      async function main() {
        const labelId = await createLabel(auth);
        console.log(`Label has been created  ${labelId}`);
        setInterval(async () => {
          const messages = await getUnrepliesMessages(auth);
          console.log(`found ${messages.length} unreplied messages`);
    
      for (const message of messages) {
      await sendReply(auth, message);
      console.log(`sent reply to message with id ${message.id}`);
    
      await addLabel(auth, message, labelId); 
      console.log(`Added label to message with id ${message.id}`);
      } 
      }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000); 
    };
    
    main().catch(console.error);
});


app.listen(5000, () => {
    console.log('Server started at localhost:5000');
})