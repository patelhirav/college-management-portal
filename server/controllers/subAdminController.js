import prisma from '../config/database.js';

export const getAssignedSubjects = async (req, res) => {
  try {
    const professor = await prisma.professor.findUnique({
      where: { userId: req.user.id },
      include: {
        subjects: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json(professor.subjects);
  } catch (error) {
    console.error('Get assigned subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, semester, subjectId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

     const semesterNumber = parseInt(semester, 10);

    const professor = await prisma.professor.findUnique({
      where: { userId: req.user.id }
    });

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        imageUrl,
        semester: semesterNumber,
        subjectId,
        professorId: professor.id
      }
    });

    // Get all students in the semester and department
    const students = await prisma.student.findMany({
      where: {
        semester: semesterNumber,
        departmentId: professor.departmentId
      }
    });

    // Create task assignments for all students
    await prisma.taskAssignment.createMany({
      data: students.map(student => ({
        taskId: task.id,
        studentId: student.id
      }))
    });

    res.status(201).json({
      message: 'Task created and assigned successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const professor = await prisma.professor.findUnique({
      where: { userId: req.user.id }
    });

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    const tasks = await prisma.task.findMany({
      where: { professorId: professor.id },
      include: {
        subject: true,
        taskAssignments: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;

    const taskAssignments = await prisma.taskAssignment.findMany({
      where: { taskId },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    });

    res.json(taskAssignments);
  } catch (error) {
    console.error('Get task status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};