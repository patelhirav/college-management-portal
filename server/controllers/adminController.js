import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { sendCredentials } from '../services/emailService.js';


export const getProfile = async (req, res) => {
  try {
    // Get the authenticated user's ID from the request
    const userId = req.user.id;

    // Fetch the complete profile data including user, professor, and department info
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        professor: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            },
            subjects: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    semester: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify this is actually an admin/HOD
    if (!profile.professor || !profile.professor.isHod) {
      return res.status(403).json({ error: 'Access denied - not an admin/HOD' });
    }

    // Structure the response data
    const responseData = {
      _id: profile.id,
      userId: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      departmentId: profile.professor.department.id,
      departmentName: profile.professor.department.name,
      bio: profile.professor.bio || null,
      subjects: profile.professor.subjects.map(sub => ({
        id: sub.subject.id,
        name: sub.subject.name,
        semester: sub.subject.semester
      })),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };

    res.json(responseData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addOrUpdateBio = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { contact, profession, degree, linkedin } = req.body;

    const professor = await prisma.professor.findUnique({
      where: { userId },
    });

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    const updatedProfessor = await prisma.professor.update({
      where: { userId },
      data: {
        bio: {
          contact,
          profession,
          degree,
          linkedin,
        },
      },
      include: {
        user: true,
        department: true,
      },
    });

    res.status(200).json({
      message: 'Bio updated successfully',
      bio: updatedProfessor.bio,
    });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



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
    const { email, password, subjectIds = [], name, bio = {} } = req.body;

    // Get HOD's department
    const department = await prisma.department.findUnique({
      where: { hodId: req.user.id }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and professor
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SUB_ADMIN',
        professor: {
          create: {
            departmentId: department.id,
            isHod: false, // Not a HOD
            bio: null, // Optional JSON data 
          }
        }
      },
      include: {
        professor: true
      }
    });

    // Assign subjects if provided
    if (subjectIds.length > 0) {
      await prisma.professorSubject.createMany({
        data: subjectIds.map(subjectId => ({
          professorId: user.professor.id,
          subjectId
        }))
      });
    }

    // Send email with credentials
    await sendCredentials(email, password, 'Professor');

    res.status(201).json({
      message: 'Professor created successfully',
      user: {
        id: user.id,
        name: user.name,
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