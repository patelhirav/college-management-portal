import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { sendOtp } from '../services/emailService.js';
import crypto from 'crypto';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        professor: { 
          include: { 
            department: true 
          } 
        },
        student: { 
          include: { 
            department: true 
          } 
        },
        hodDepartment: true // Include if the user is an HOD (admin)
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Determine if the user is an admin/HOD
    const isAdmin = user.professor?.isHod || false;
    const department = user.professor?.department || user.student?.department || null;

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        //isAdmin // Include this in the token if needed
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin,
        department,
        professor: user.professor,
        student: user.student,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const studentSignup = async (req, res) => {
  try {
    const { email, password, name, semester, departmentId } = req.body;

    // Only allow email ending with @example.edu
    const allowedDomain = '@example.edu';
    if (!email.endsWith(allowedDomain)) {
      return res.status(400).json({ error: `Signup allowed only with college email.` });
    }

    

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and student
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            semester,
            departmentId
          }
        }
      },
      include: {
        student: { include: { department: true } }
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        student: user.student
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true
      }
    });
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Create JWT with OTP and expiration
    const resetToken = jwt.sign(
      { email, otp, exp: Math.floor(otpExpires / 1000) },
      process.env.JWT_SECRET
    );

    // Send otp email
     await sendOtp(email, otp);


    res.status(200).json({ message: "OTP sent to your email.", resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

export const verifyOtp = async (req, res) => {
  const { resetToken, otp } = req.body;
  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (Date.now() > decoded.exp * 1000) {
      return res.status(400).json({ error: "OTP has expired" });
    }
    res.status(200).json({ message: "OTP verified successfully.", resetToken });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, otp, newPassword } = req.body;
  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (Date.now() > decoded.exp * 1000) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    const user = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};