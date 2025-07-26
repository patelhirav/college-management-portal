import express from 'express';
import { login, studentSignup, getDepartments, forgotPassword, verifyOtp, resetPassword  } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/student-signup', studentSignup);
router.get('/departments', getDepartments);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;