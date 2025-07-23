import multer from 'multer';

const storage = multer.memoryStorage();

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

export const pdfParser = multer({ storage, fileFilter: pdfFileFilter });