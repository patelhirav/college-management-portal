import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { sendCredentials } from '../services/emailService.js';

export const getDepartmentInfo = async (req, res) => {
  try {
    const department = await prisma.department.findUnique({
      where: { hodId: req.user.id },
      include: {
        professors: {
          include: {
            user: true,
            subjects: {
              include: {
                subject: true
              }
            }
          }
        },
        subjects: {
          include: {
            professors: {
              include: {
                professor: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        students: {
          include: {
            user: true
          }
        }
      }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get department info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProfessor = async (req, res) => {
  try {
    const { email, password, subjectIds } = req.body;

    // Get department
    const department = await prisma.department.findUnique({
      where: { hodId: req.user.id }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
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

    // Create professor
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'SUB_ADMIN',
        professor: {
          create: {
            departmentId: department.id
          }
        }
      },
      include: {
        professor: true
      }
    });

    // Assign subjects
    if (subjectIds && subjectIds.length > 0) {
      await prisma.professorSubject.createMany({
        data: subjectIds.map(subjectId => ({
          professorId: user.professor.id,
          subjectId
        }))
      });
    }

    // Send credentials via email
    await sendCredentials(email, password, 'Professor');

    res.status(201).json({
      message: 'Professor created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        professor: user.professor
      }
    });
  } catch (error) {
    console.error('Create professor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, semester } = req.body;

    // Get department
    const department = await prisma.department.findUnique({
      where: { hodId: req.user.id }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        semester,
        departmentId: department.id
      }
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignProfessorToSubject = async (req, res) => {
  try {
    const { professorId, subjectId } = req.body;

    // Check if assignment already exists
    const existingAssignment = await prisma.professorSubject.findFirst({
      where: {
        professorId,
        subjectId
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Professor already assigned to this subject' });
    }

    const assignment = await prisma.professorSubject.create({
      data: {
        professorId,
        subjectId
      }
    });

    res.status(201).json({
      message: 'Professor assigned to subject successfully',
      assignment
    });
  } catch (error) {
    console.error('Assign professor to subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};