// config/multer.js
import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import cloudinary from './cloudinary.js';

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'student_profiles', // or professor_profiles
//     allowed_formats: ['jpg', 'jpeg', 'png'],
//   },
// });
const storage = multer.memoryStorage();
const parser = multer({ storage });
export default parser;
