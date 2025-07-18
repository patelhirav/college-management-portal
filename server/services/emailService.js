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
    console.log('Credentials sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};