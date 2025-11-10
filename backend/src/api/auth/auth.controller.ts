import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { signJwt } from '../../utils/jwt';
import prisma from '../../utils/prisma';
import { sendNotificationAfterAnEvent } from '../../services/notification.service';
import { z } from 'zod';
import { googleOAuthSchema } from './auth.validation';

const handleServiceError = (res: Response, error: any) => {
    const isConflict = error.message?.includes('exists');
    return res.status(isConflict ? 409 : 500).json({ message: error.message });
};

export const registerParentHandler = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerParent(req.body);
    const { password, ...userWithoutPassword } = user;
    const token = signJwt({ userId: user.id, role: user.role });

    const finduser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { parentProfile: true }
    });

       const welcomeHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 20px; 
            background-color: #f5f7fa;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .logo { 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 15px;
        }
        .content { 
            padding: 40px 30px; 
        }
        .welcome-text { 
            font-size: 16px; 
            margin-bottom: 20px; 
            color: #555;
            line-height: 1.7;
        }
        .features { 
            background: #f8f9ff; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 30px 0; 
            border-left: 4px solid #667eea;
        }
        .feature-item { 
            margin: 15px 0; 
            padding-left: 15px;
            line-height: 1.6;
        }
        .footer { 
            text-align: center; 
            padding: 30px; 
            color: #666; 
            font-size: 14px; 
            border-top: 1px solid #eee;
            background: #f9f9f9;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Therabee</div>
            <h1 style="margin: 0; font-size: 28px;">Welcome to Your Wellness Journey!</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hi ${finduser?.parentProfile?.name || "there"},</div>
            
            <p class="welcome-text">Welcome to Therabee — we're absolutely delighted to have you on board!</p>
            
            <p class="welcome-text">Your registration has been successfully completed, and you're now part of our trusted platform designed to help you connect with certified therapists and access personalized consultation experiences with ease.</p>
            
            <div class="features">
                <h3 style="color: #667eea; margin-top: 0; margin-bottom: 20px;">What you can do next:</h3>
                <div class="feature-item">• <strong>Explore therapist profiles</strong> - Browse detailed profiles and choose the right expert for your needs</div>
                <div class="feature-item">• <strong>Schedule consultations</strong> - Book sessions at your convenience with our easy scheduling system</div>
                <div class="feature-item">• <strong>Track your progress</strong> - Monitor your wellness journey and stay connected with your therapist</div>
                <div class="feature-item">• <strong>Secure communication</strong> - All your interactions are protected and confidential</div>
            </div>
            
            <p class="welcome-text">We're committed to supporting you at every step of your wellness journey. Your mental health is our priority, and we're here to make your experience seamless, effective, and transformative.</p>
            
            <div style="text-align: center;">
                <a href="https://thera-connectnew.vercel.app/" class="button">Begin Your Journey</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 15px 0;"><strong>The Therabee Team</strong></p>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #888;">
                Dedicated to your mental wellness journey
            </p>
            <p style="margin: 0; font-size: 12px; color: #999;">
                If you have any questions, please contact our support team at support@therabee.com
            </p>
        </div>
    </div>
</body>
</html>
`.trim();
  const welcomeText = `
Hi ${finduser?.parentProfile?.name || "there"},

Welcome to Therabee — we're delighted to have you on board!

Your registration has been successfully completed. Therabee is a trusted platform designed to help you connect with certified therapists and access personalized consultation experiences with ease.

WHAT YOU CAN DO NEXT:
• Explore therapist profiles and choose the right expert for your needs
• Schedule consultations at your convenience with our easy scheduling system
• Track your progress and stay connected with your therapist
• Enjoy secure and confidential communication

We're committed to supporting you at every step of your wellness journey. Your mental health is our priority, and we're here to make your experience seamless and effective.

Begin your journey today by exploring our platform.

Warm regards,
The Therabee Team

If you have any questions, please contact our support team at support@therabee.com
  `.trim();

    // Send Notification
    // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
    // await sendNotificationAfterAnEvent({
    //   userId: user.id,
    //   message: welcomeText,
    //   sendAt: new Date(),
    //   welcomeHtml: welcomeHTML
    // });

    
    res.status(201).json({ message: 'Parent registered successfully', user: userWithoutPassword ,token});
  } catch (error) {
    handleServiceError(res, error);
  }
};

export const registerTherapistHandler = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerTherapist(req.body);
    const  token = signJwt({ userId: user.id, role: user.role });
    const { password, ...userWithoutPassword } = user;

        const finduser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { therapistProfile: true }
    });
    const therapistWelcomeHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Therabee</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 50px 40px 40px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="rgba(255,255,255,0.1)"><polygon points="0,0 1000,50 1000,100 0,100"/></svg>');
            background-size: cover;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 15px;
            position: relative;
            z-index: 2;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
            position: relative;
            z-index: 2;
        }
        
        .welcome-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 12px 25px;
            border-radius: 50px;
            display: inline-block;
            margin-top: 20px;
            font-weight: 600;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 50px 40px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        
        .features-grid {
            display: grid;
            gap: 20px;
            margin: 35px 0;
        }
        
        .feature-card {
            background: #f8f9ff;
            padding: 25px;
            border-radius: 15px;
            border-left: 4px solid #667eea;
            transition: transform 0.2s ease;
        }
        
        .feature-card:hover {
            transform: translateX(5px);
        }
        
        .feature-icon {
            font-size: 24px;
            margin-bottom: 12px;
            color: #667eea;
        }
        
        .feature-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .feature-desc {
            color: #718096;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 45px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 40px 0;
            text-align: center;
        }
        
        .stat-item {
            padding: 20px;
            background: #f7fafc;
            border-radius: 12px;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #718096;
            font-weight: 500;
        }
        
        .footer {
            background: #1a202c;
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .footer-logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            color: white;
        }
        
        .social-links {
            margin: 25px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #cbd5e0;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .social-link:hover {
            color: #667eea;
        }
        
        .contact-info {
            font-size: 14px;
            color: #a0aec0;
            margin-top: 20px;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 30px 25px;
            }
            
            .header {
                padding: 40px 25px 30px;
            }
            
            .stats {
                grid-template-columns: 1fr;
            }
            
            .feature-card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Therabee</div>
            <div class="tagline">Connecting Therapists with Those Who Need Care</div>
            <div class="welcome-badge">Professional Portal</div>
        </div>
        
        <div class="content">
            <div class="greeting">Welcome, Dr. ${finduser?.therapistProfile?.name || "there"}! 👋</div>
            
            <p class="message">
                We're thrilled to welcome you to Therabee's professional community! Your profile registration has been successfully completed, and you're now part of a network dedicated to making quality mental health care accessible.
            </p>
            
            <p class="message">
                As a certified therapist on our platform, you'll connect with parents seeking expert guidance and make a meaningful impact on children's mental wellness journeys.
            </p>
            
            <div class="features-grid">
                
                
                <div class="feature-card">
                    <div class="feature-icon">🔄</div>
                    <div class="feature-title">Accept Consultation Requests</div>
                    <div class="feature-desc">Start receiving and managing appointment requests from verified parents.</div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Manage Sessions & Reports</div>
                    <div class="feature-desc">Access our comprehensive dashboard to track sessions and maintain records.</div>
                </div>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">500+</div>
                    <div class="stat-label">Active Therapists</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">10K+</div>
                    <div class="stat-label">Sessions Completed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">98%</div>
                    <div class="stat-label">Satisfaction Rate</div>
                </div>
            </div>
            
            <div class="cta-section">
                <a href="#" class="cta-button">Complete Your Profile</a>
            </div>
            
            <p class="message" style="text-align: center; color: #718096; font-size: 14px;">
                Thank you for joining our mission to provide accessible, quality mental health care to those who need it most.
            </p>
        </div>
        
        <div class="footer">
            <div class="footer-logo">Therabee</div>
            <p style="color: #cbd5e0; margin-bottom: 20px;">Building bridges to better mental health</p>
            
            <div class="social-links">
                <a href="#" class="social-link">Website</a> •
                <a href="#" class="social-link">Support</a> •
                <a href="#" class="social-link">Resources</a>
            </div>
            
            <div class="contact-info">
                Need help? Contact our therapist support team at therapists@therabee.com
            </div>
        </div>
    </div>
</body>
</html>
`.trim();
     const therapistWelcomeText = `
WELCOME TO THERABEE - PROFESSIONAL PORTAL

Dear Dr. ${finduser?.therapistProfile?.name || "there"},

We're excited to welcome you to Therabee's professional community! Your profile registration has been successfully completed, and you're now part of a network dedicated to making quality mental health care accessible.

As a certified therapist on our platform, you'll connect with parents seeking expert guidance and make a meaningful impact on children's mental wellness journeys.

YOUR NEXT STEPS:

📋 COMPLETE YOUR PROFILE
- Showcase your expertise, specialization, and experience
- Upload your credentials and certifications
- Set your availability and session preferences

🔄 START ACCEPTING REQUESTS
- Receive consultation requests from verified parents
- Manage your appointment calendar
- Conduct secure video sessions

📊 MANAGE YOUR PRACTICE
- Track session history and client progress
- Generate professional reports
- Maintain secure client records

PLATFORM STATISTICS:
• 500+ Active Therapists in our network
• 10,000+ Sessions successfully completed
• 98% Client satisfaction rate

Get started by completing your profile setup to begin receiving consultation requests.

Thank you for joining our mission to provide accessible, quality mental health care.

Warm regards,
The Therabee Team

Need help? Contact our therapist support team at therapists@therabee.com
`.trim();
              
              
        // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
        // await sendNotificationAfterAnEvent({
        //   userId: user.id,
        //   message: therapistWelcomeText,
        //   welcomeHtml: therapistWelcomeHTML,
        //   sendAt: new Date()
        // });
    res.status(201).json({ message: 'Therapist registered successfully', user: userWithoutPassword, token });
  } catch (error) {
    handleServiceError(res, error);
  }
};

export const registerAdminHandler = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerAdmin(req.body);
    const { password, ...userWithoutPassword } = user;
    const token = signJwt({ userId: user.id, role: user.role });

      const adminWelcomeHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Admin Access Granted</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                            
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                line-height: 1.6;
                                color: #333333;
                                background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                                margin: 0;
                                padding: 20px;
                                min-height: 100vh;
                            }
                            
                            .email-container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: #ffffff;
                                border-radius: 20px;
                                overflow: hidden;
                                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                            }
                            
                            .header {
                                background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                                padding: 50px 40px 40px;
                                text-align: center;
                                color: white;
                                position: relative;
                            }
                            
                            .admin-badge {
                                background: #e53e3e;
                                color: white;
                                padding: 8px 20px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                display: inline-block;
                                margin-bottom: 15px;
                            }
                            
                            .logo {
                                font-size: 32px;
                                font-weight: 700;
                                margin-bottom: 10px;
                            }
                            
                            .tagline {
                                font-size: 16px;
                                opacity: 0.9;
                                font-weight: 400;
                            }
                            
                            .content {
                                padding: 50px 40px;
                            }
                            
                            .greeting {
                                font-size: 24px;
                                font-weight: 700;
                                color: #2d3748;
                                margin-bottom: 25px;
                                background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                            }
                            
                            .message {
                                font-size: 16px;
                                color: #4a5568;
                                margin-bottom: 25px;
                                line-height: 1.7;
                            }
                            
                            .admin-features {
                                background: #f7fafc;
                                border-radius: 15px;
                                padding: 30px;
                                margin: 30px 0;
                                border: 2px solid #e2e8f0;
                            }
                            
                            .feature-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 20px;
                                margin-top: 20px;
                            }
                            
                            .feature-item {
                                display: flex;
                                align-items: flex-start;
                                gap: 12px;
                            }
                            
                            .feature-icon {
                                font-size: 20px;
                                color: #2d3748;
                                margin-top: 2px;
                            }
                            
                            .feature-text {
                                font-size: 14px;
                                color: #4a5568;
                            }
                            
                            .security-notice {
                                background: #fff5f5;
                                border: 1px solid #fed7d7;
                                border-radius: 12px;
                                padding: 25px;
                                margin: 30px 0;
                                text-align: center;
                            }
                            
                            .security-icon {
                                font-size: 32px;
                                margin-bottom: 15px;
                            }
                            
                            .security-title {
                                font-weight: 600;
                                color: #c53030;
                                margin-bottom: 10px;
                            }
                            
                            .security-text {
                                color: #744210;
                                font-size: 14px;
                                line-height: 1.6;
                            }
                            
                            .dashboard-access {
                                text-align: center;
                                margin: 40px 0 30px;
                            }
                            
                            .dashboard-button {
                                display: inline-block;
                                background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                                color: white;
                                padding: 16px 45px;
                                text-decoration: none;
                                border-radius: 12px;
                                font-weight: 600;
                                font-size: 16px;
                                transition: all 0.3s ease;
                                box-shadow: 0 10px 30px rgba(45, 55, 72, 0.3);
                            }
                            
                            .dashboard-button:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 15px 40px rgba(45, 55, 72, 0.4);
                            }
                            
                            .footer {
                                background: #1a202c;
                                color: white;
                                padding: 40px;
                                text-align: center;
                            }
                            
                            .footer-logo {
                                font-size: 24px;
                                font-weight: 700;
                                margin-bottom: 20px;
                                color: white;
                            }
                            
                            .admin-contact {
                                background: #2d3748;
                                padding: 20px;
                                border-radius: 10px;
                                margin-top: 20px;
                            }
                            
                            .contact-title {
                                font-weight: 600;
                                margin-bottom: 10px;
                                color: #cbd5e0;
                            }
                            
                            .contact-email {
                                color: #667eea;
                                text-decoration: none;
                                font-weight: 500;
                            }
                            
                            @media (max-width: 600px) {
                                .content {
                                    padding: 30px 25px;
                                }
                                
                                .header {
                                    padding: 40px 25px 30px;
                                }
                                
                                .feature-grid {
                                    grid-template-columns: 1fr;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">
                                <div class="admin-badge">Administrator Access</div>
                                <div class="logo">Therabee</div>
                                <div class="tagline">Platform Administration Portal</div>
                            </div>
                            
                            <div class="content">
                                <div class="greeting">Admin Access Granted, ${user?.email?.split('@')[0].trim() || "there"}! 🔐</div>
                                
                                <p class="message">
                                    Your administrator privileges have been successfully activated. You now have full control over the Therabee platform and its operations.
                                </p>
                                
                                <div class="admin-features">
                                    <h3 style="color: #2d3748; margin-bottom: 20px; text-align: center;">Your Administrative Capabilities</h3>
                                    
                                    <div class="feature-grid">
                                        <div class="feature-item">
                                            <span class="feature-icon">👥</span>
                                            <span class="feature-text">Manage user accounts and profiles</span>
                                        </div>
                                        <div class="feature-item">
                                            <span class="feature-icon">🩺</span>
                                            <span class="feature-text">Oversee therapist verifications</span>
                                        </div>
                                        <div class="feature-item">
                                            <span class="feature-icon">📊</span>
                                            <span class="feature-text">Access platform analytics & reports</span>
                                        </div>
                                        <div class="feature-item">
                                            <span class="feature-icon">⚙️</span>
                                            <span class="feature-text">Configure system settings</span>
                                        </div>
                                        <div class="feature-item">
                                            <span class="feature-icon">🔍</span>
                                            <span class="feature-text">Monitor sessions and compliance</span>
                                        </div>
                                        <div class="feature-item">
                                            <span class="feature-icon">📝</span>
                                            <span class="feature-text">Manage content and resources</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="security-notice">
                                    <div class="security-icon">🔒</div>
                                    <div class="security-title">Important Security Notice</div>
                                    <div class="security-text">
                                        With administrative access comes significant responsibility. Please ensure the secure and ethical use of your privileges. Maintain confidentiality of sensitive data and follow our security protocols at all times.
                                    </div>
                                </div>
                                
                                <div class="dashboard-access">
                                    <a href="#" class="dashboard-button">Access Admin Dashboard</a>
                                </div>
                                
                                <p class="message" style="text-align: center; color: #718096; font-size: 14px;">
                                    You are now responsible for maintaining the integrity and security of our platform.
                                </p>
                            </div>
                            
                            <div class="footer">
                                <div class="footer-logo">Therabee</div>
                                <p style="color: #cbd5e0; margin-bottom: 20px;">Secure Platform Administration</p>
                                
                                <div class="admin-contact">
                                    <div class="contact-title">Administrative Support</div>
                                    <a href="mailto:admin@therabee.com" class="contact-email">admin@therabee.com</a>
                                </div>
                                
                                <div style="margin-top: 25px; font-size: 12px; color: #a0aec0;">
                                    This is an automated message for authorized personnel only.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    `.trim();

                    const adminWelcomeText = `
                  ADMINISTRATOR ACCESS GRANTED - THERABEE PLATFORM

                  Hello ${user?.email?.split('@')[0].trim() || "there"},

                  Your administrator privileges have been successfully activated for the Therabee platform.

                  You now have full control to manage:
                  • User accounts and profiles
                  • Therapist verifications and approvals  
                  • Session monitoring and compliance
                  • Platform analytics and reporting
                  • System configuration and settings
                  • Content management and resources

                  SECURITY NOTICE:
                  With administrative access comes significant responsibility. Please ensure:
                  - Secure and ethical use of privileges
                  - Confidentiality of sensitive user data
                  - Compliance with security protocols
                  - Responsible platform management

                  Access the admin dashboard to begin managing platform operations.

                  Remember: You are responsible for maintaining the integrity and security of our mental health platform.

                  Administrative support: admin@therabee.com

                  This is an automated message for authorized personnel only.

                  Warm regards,
                  The Therabee Team
                  `.trim();
              // Send Notification
      // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
      // await sendNotificationAfterAnEvent({
      //   userId: user.id,
      //   message: adminWelcomeText,
      //   welcomeHtml:adminWelcomeHTML,
      //   sendAt: new Date()
      // });

    res.status(201).json({ message: 'Admin registered successfully', user: userWithoutPassword,token });
  } catch (error) {
    handleServiceError(res, error);
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};


export const changePasswordHandler = async (req: Request, res: Response) => {
  try {
    const result = await authService.changePassword(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    const status = /incorrect|No account/i.test(error.message) ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const googleOAuthHandler = async (req: Request, res: Response) => {
  try {
    // Basic debug without logging tokens
    console.log('[AUTH][GOOGLE] Incoming request to /auth/google')
    const parsed = googleOAuthSchema.parse({ body: req.body });
    console.log('[AUTH][GOOGLE] Payload received (token length):', parsed.body.idToken?.length)
    const result = await authService.loginWithGoogle(parsed.body);
    console.log('[AUTH][GOOGLE] Login success for user', result?.user?.email)
    res.status(200).json(result);
  } catch (error: any) {
    const status = error?.issues ? 400 : 401;
    console.error('[AUTH][GOOGLE][ERROR]', error?.message || error)
    res.status(status).json({ message: error.message || 'Google login failed' });
  }
};