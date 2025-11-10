"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendemail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
dotenv_1.default.config();
// EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_APP_PASSWORD 
//     }
// });
const sendemail = (email, message, html, subject) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.sendemail = sendemail;
exports.default = router;
