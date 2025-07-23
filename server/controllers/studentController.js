import prisma from '../config/database.js';
//import { v2 as cloudinary } from 'cloudinary';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

export const getStudentProfile = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        department: {
          select: { name: true }
        }
      }
    });

    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    res.json(student);
  } catch (err) {
    console.error('Error getting student profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateStudentInfo = async (req, res) => {
  try {
    const {
      address,
      mobile,
      fatherName,
      fatherMobile,
      guardianName,
      city,
      semester
    } = req.body;


    // Build the info update object dynamically
    const infoUpdate = {};
    if (address !== undefined) infoUpdate.address = address;
    if (mobile !== undefined) infoUpdate.mobile = mobile;
    if (fatherName !== undefined) infoUpdate.fatherName = fatherName;
    if (fatherMobile !== undefined) infoUpdate.fatherMobile = fatherMobile;
    if (guardianName !== undefined) infoUpdate.guardianName = guardianName;
    if (city !== undefined) infoUpdate.city = city;

    const updateData = {
      ...(semester !== undefined && { semester }),
      ...(Object.keys(infoUpdate).length > 0 && {
        info: { set: infoUpdate }
      })
    };

    const updated = await prisma.student.update({
      where: { userId: req.user.id },
      data: updateData
    });

    res.json({ message: 'Student info updated', student: updated });

  } catch (err) {
    console.error('Error updating student info:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// export const uploadProfilePhoto = async (req, res) => {
//   try {
//     // req.file.path contains Cloudinary URL
//     const imageUrl = req.file.path;

//     // Save this imageUrl to Student or Professor model
//     await prisma.student.update({ where: { userId: req.user.id }, data: { profilePhoto: imageUrl } })

//     res.json({ success: true, imageUrl });
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({ error: 'Upload failed' });
//   }
// };

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Now update student's profile photo URL in DB
    const student = await prisma.student.update({
      where: { userId: req.user.id },
      data: {
        profilePhoto: result.secure_url,
      },
    });

    res.status(200).json({ message: 'Profile photo updated', photoUrl: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    res.status(500).json({ message: 'Something went wrong!' });
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

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let submissionUrl = null;

    // If a PDF file is submitted, upload it to Cloudinary
    

      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw', // Required for PDF or any non-image files
              folder: 'submissions',
              format: 'pdf', // Ensures it's treated as a PDF
              public_id: `submission_${Date.now()}`
            },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      if (req.file) {
      const result = await streamUpload(req.file.buffer);
      submissionUrl = result.secure_url;
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