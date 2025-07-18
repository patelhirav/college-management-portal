import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';
import { 
  getAssignedSubjects, 
  createTask, 
  getTasks, 
  getTaskStatus 
} from '../controllers/subAdminController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['SUB_ADMIN']));

router.get('/subjects', getAssignedSubjects);
router.post('/create-task', upload.single('taskImage'), createTask);
router.get('/tasks', getTasks);
router.get('/task-status/:taskId', getTaskStatus);

export default router;