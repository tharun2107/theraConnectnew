import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import express, { Request, Response } from 'express';

const router = express.Router();
dotenv.config();

// EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_APP_PASSWORD 
//     }
// });

export const sendemail = async (email: string, message: string, html?: string, subject?: string) => {
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // Uncomment the code below when ready to enable email functionality
  /*
  try {
    const mailOptions: any = {
      from: process.env.EMAIL_USER,
      to: email,   
      subject: subject || "Welcome to Therabee - Start Your Wellness Journey",
      text: message
    };

    // Add HTML if provided
    if (html) {
      mailOptions.html = html;
    }

    await transporter.sendMail(mailOptions);
    return { success: true };  
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
  */
  
  // Temporarily return success without sending email
  console.log('[EMAIL] Email sending disabled. Would send to:', email, 'Subject:', subject || 'Welcome to Therabee');
  return { success: true };
};



export default router;