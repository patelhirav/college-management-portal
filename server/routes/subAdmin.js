import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';
import { 
  getAssignedSubjects, 
  createTask, 
  getTasks, 
  getTaskStatus,
  addOrUpdateBio,
  getProfile,
  updateTask
} from '../controllers/subAdminController.js';
import parser from '../config/multer.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['SUB_ADMIN']));

router.get('/subjects', getAssignedSubjects);
router.post('/create-task', parser.single('taskImage'), createTask);
router.put('/tasks/:taskId', parser.single('taskImage'), updateTask);

router.get('/tasks', getTasks);
router.get('/task-status/:taskId', getTaskStatus);
router.post('/bio', addOrUpdateBio);
router.put('/bio', addOrUpdateBio);
router.get('/profile', getProfile);

export default router;