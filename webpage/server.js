const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

// Serve static files (like index.html) from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "saiprasad2523@gmail.com", // Your Gmail ID
    pass: "fbki ndks mecj acol", // Gmail App Password
  },
});

// Email Sending and Saving Endpoint
app.post("/send-email", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required!" });
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Our Newsletter!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello,</p>
            <p>Thank you for subscribing to our newsletter. Stay tuned for the latest updates and exclusive content.</p>
            <div style="text-align: center; margin: 20px 0;">
              <img src="https://via.placeholder.com/400x200" alt="Welcome Image" style="width: 100%; max-width: 500px; border-radius: 8px;"/>
            </div>
            <p>If you have any questions, feel free to contact us.</p>
          </div>
          <div style="background-color: #4CAF50; color: white; text-align: center; padding: 10px;">
            <p style="margin: 0;">&copy; 2024 Our Company. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // Send Email using Nodemailer
    const mailOptions = {
      from: "saiprasad2523@gmail.com", // Your Gmail ID
      to: email,
      subject: "Welcome to Our Newsletter!",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    const timestamp = new Date().toISOString();

    // Save email and timestamp to Google Sheets
    const googleSheetsURL = "https://script.google.com/macros/s/AKfycbzt7KF7DhooqBA9RLCrUnFitHHiyVEKSagEj7fly_EjgIeQugsRt-xaDt2beV1Jyf1S/exec";
    const sheetsResponse = await fetch(googleSheetsURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, timestamp }),
    });

    // Save email and timestamp to local CSV file
    const csvData = `${timestamp},${email}\n`;
    fs.appendFile("emails.csv", csvData, (err) => {
      if (err) {
        console.error("Error saving email to CSV file:", err);
      }
    });

    if (sheetsResponse.ok) {
      res.status(200).json({ message: "Email sent and saved successfully!" });
    } else {
      res.status(500).json({ message: "Email sent, but failed to save to Google Sheets." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed to send or save email." });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
