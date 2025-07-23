import express from 'express';
import parser from '../config/multer.js';
import { pdfParser }  from '../config/pdfParser.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';
import { 
  getSubjects, 
  getTasks, 
  updateTaskStatus,
  getStudentProfile,
  updateStudentInfo,
  uploadProfilePhoto
} from '../controllers/studentController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['STUDENT']));



router.put('/profile/photo', parser.single('profilePhoto'), uploadProfilePhoto);
router.get('/subjects', getSubjects);
router.get('/tasks', getTasks);
router.put('/task-status/:taskId', pdfParser.single('submissionFile'), updateTaskStatus);
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentInfo);

export default router;