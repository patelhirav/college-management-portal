import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { sendCredentials } from '../services/emailService.js';

//superadmin profile

export const getSAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id; // set via auth middleware

    // Fetch user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    // Check if user is Super Admin
    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.status(200).json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Error fetching super admin profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get All HODs (Admins)
export const getHods = async (req, res) => {
  try {
    const hods = await prisma.user.findMany({
      where: {
        AND: [
          { role: 'ADMIN' },          // Must have ADMIN role
          { professor: { isHod: true } } // Must be a professor marked as HOD
        ]
      },
      include: {
        professor: {
          include: {
            department: true,
            subjects: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });

    // Format the response
    const formattedHods = hods.map(hod => ({
      _id: hod.id,
      userId: hod.id,
      name: hod.name,
      email: hod.email,
      role: hod.role,
      isHod: hod.professor?.isHod,
      departmentId: hod.professor?.department?.id,
      departmentName: hod.professor?.department?.name,
      bio: hod.professor?.bio || null,
      subjects: hod.professor?.subjects?.map(sub => ({
        id: sub.subject.id,
        name: sub.subject.name,
        semester: sub.subject.semester
      })) || [],
      createdAt: hod.createdAt,
      updatedAt: hod.updatedAt
    }));

    res.json(formattedHods);
  } catch (error) {
    console.error('Get HODs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ Create HOD + Department
export const createHod = async (req, res) => {
  try {
    const { email, password, name, departmentId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        professor: {
          create: {
            departmentId,
            isHod: true,
            bio: null
          }
        }
      },
      include: {
        professor: true
      }
    });

    await prisma.department.update({
      where: { id: departmentId },
      data: { hodId: user.id }
    });

    await sendCredentials(email, password, 'HOD');

    res.status(201).json({
      message: 'HOD created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        department,
        isHod: true
      }
    });
  } catch (error) {
    console.error('Create HOD error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// ✅ Get All Departments with HOD and Counts
export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        hod: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        },
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
