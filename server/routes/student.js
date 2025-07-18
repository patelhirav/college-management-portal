import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';
import { 
  getProfile, 
  updateProfile, 
  getSubjects, 
  getTasks, 
  updateTaskStatus 
} from '../controllers/studentController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['STUDENT']));

router.get('/profile', getProfile);
router.put('/profile', upload.single('profilePhoto'), updateProfile);
router.get('/subjects', getSubjects);
router.get('/tasks', getTasks);
router.put('/task-status/:taskId', upload.single('submissionFile'), updateTaskStatus);

export default router;