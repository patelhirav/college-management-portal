import prisma from '../config/database.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import fs from 'fs';

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
    if (!profile.professor || profile.professor.isHod) {
      return res.status(403).json({ error: 'Access denied - not an sub-admin/professor' });
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

export const getAssignedSubjects = async (req, res) => {
  try {
        const professor = await prisma.professor.findUnique({
      where: { userId: req.user.id },
      include: {
        subjects: {
          include: {
            subject: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
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
    const semesterNumber = parseInt(semester, 10);

    let imageUrl = null;

    // Upload to Cloudinary if image exists
    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'tasks' }, // optional: uploads to "tasks" folder in Cloudinary
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req);
      imageUrl = result.secure_url;
    }

    // Get professor info
    const professor = await prisma.professor.findUnique({
      where: { userId: req.user.id },
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
        professorId: professor.id,
      },
    });

    // Get students
    const students = await prisma.student.findMany({
      where: {
        semester: semesterNumber,
        departmentId: professor.departmentId,
      },
    });

    // Assign to students
    await prisma.taskAssignment.createMany({
      data: students.map((student) => ({
        taskId: task.id,
        studentId: student.id,
      })),
    });

    res.status(201).json({
      message: 'Task created and assigned successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, semester, subjectId } = req.body;
    const semesterNumber = parseInt(semester, 10);

    let imageUrl = null;

    // Check if task exists and belongs to the professor
    const professor = await prisma.professor.findUnique({
      where: { userId: req.user.id },
    });

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.professorId !== professor.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Upload new image to Cloudinary if provided
    if (req.file) {
      // First delete old image if it exists
      if (existingTask.imageUrl) {
        const publicId = existingTask.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`tasks/${publicId}`);
      }

      // Upload new image
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'tasks' },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req);
      imageUrl = result.secure_url;
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        semester: semesterNumber,
        subjectId,
        ...(imageUrl && { imageUrl }), // Only update imageUrl if a new one was uploaded
      },
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
      }
    });

    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
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