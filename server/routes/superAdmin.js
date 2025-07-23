import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getHods, createHod, getDepartments, getSAdminProfile } from '../controllers/superAdminController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['SUPER_ADMIN']));

router.get('/hods', getHods);
router.post('/create-hod', createHod);
router.get('/departments', getDepartments);
router.get('/profile', getSAdminProfile);

export default router;