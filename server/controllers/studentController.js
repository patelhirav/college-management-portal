import prisma from '../config/database.js';

export const getProfile = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        user: true,
        department: true
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

    const updateData = { name };
    if (profilePhoto) {
      updateData.profilePhoto = profilePhoto;
    }

    const student = await prisma.student.update({
      where: { userId: req.user.id },
      data: updateData,
      include: {
        user: true,
        department: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        semester: student.semester,
        departmentId: student.departmentId
      },
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
    });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const tasks = await prisma.taskAssignment.findMany({
      where: { studentId: student.id },
      include: {
        task: {
          include: {
            subject: true,
            professor: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        task: {
          createdAt: 'desc'
        }
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const submissionUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updateData = { status };
    if (submissionUrl) {
      updateData.submissionUrl = submissionUrl;
    }

    const taskAssignment = await prisma.taskAssignment.update({
      where: {
        taskId_studentId: {
          taskId,
          studentId: student.id
        }
      },
      data: updateData
    });

    res.json({
      message: 'Task status updated successfully',
      taskAssignment
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};