// setAdmin.js
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" }; // tu JSON de Firebase Admin

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = "ET3XszUhdfaWbrbGGWh7v5C5MWh2"; // tu usuario Gmail

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("✅ Usuario promovido a admin");
  })
  .catch(console.error);
git