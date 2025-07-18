import express from 'express';
import { login, studentSignup, getDepartments } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/student-signup', studentSignup);
router.get('/departments', getDepartments);

export default router;