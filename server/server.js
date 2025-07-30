import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//

// Routes
import authRoutes from './routes/auth.js';
import superAdminRoutes from './routes/superAdmin.js';
import adminRoutes from './routes/admin.js';
import subAdminRoutes from './routes/subAdmin.js';
import studentRoutes from './routes/student.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sub-admin', subAdminRoutes);
app.use('/api/student', studentRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/api.html'); // Still needed if 'api.html' is not 'index.html'
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});