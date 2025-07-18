import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { sendCredentials } from '../services/emailService.js';

export const getHods = async (req, res) => {
  try {
    const hods = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: {
        admin: true
      }
    });
    res.json(hods);
  } catch (error) {
    console.error('Get HODs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createHod = async (req, res) => {
  try {
    const { email, password, departmentName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create department and HOD
    const department = await prisma.department.create({
      data: {
        name: departmentName
      }
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    await prisma.department.update({
      where: { id: department.id },
      data: { hodId: user.id }
    });

    // Send credentials via email
    await sendCredentials(email, password, 'HOD');

    res.status(201).json({
      message: 'HOD created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        department: department
      }
    });
  } catch (error) {
    console.error('Create HOD error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        hod: true,
        _count: {
          select: {
            professors: true,
            subjects: true,
            students: true
          }
        }
      }
    });
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};