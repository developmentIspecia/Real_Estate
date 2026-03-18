// utils/mailer.js
import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // you can use outlook, yahoo, etc.
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password (not normal password)
      },
    });

    const mailOptions = {
      from: `"RealEstate App" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
      html: `<h2>RealEstate App</h2><p>Your OTP is: <b>${otp}</b></p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Could not send OTP email");
  }
};
