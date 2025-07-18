import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { 
  getDepartmentInfo, 
  createProfessor, 
  createSubject, 
  assignProfessorToSubject 
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/department', getDepartmentInfo);
router.post('/create-professor', createProfessor);
router.post('/create-subject', createSubject);
router.post('/assign-professor', assignProfessorToSubject);

export default router;