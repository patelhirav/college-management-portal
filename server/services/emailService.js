import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendCredentials = async (email, password, role) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your ${role} Credentials - College Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to College Management System</h2>
          <p>Dear ${role},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please log in using these credentials and change your password after first login.</p>
          <p>Best regards,<br>College Management System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Credentials sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendOtp = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - College Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Dear User,</p>
          <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 24px; font-weight: bold; color: #1f2937;">${otp}</p>
          </div>
          <p>This OTP is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>
          <p>Best regards,<br>College Management System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};