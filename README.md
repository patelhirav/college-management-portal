# 🎓 College Management System

![Project Banner](https://res.cloudinary.com/dqka3ftj6/image/upload/v1753854735/CMS_banner_gqgggm.png)  
*A modern solution for educational institutions to manage students, faculty, courses, and more.*

---

## ✨ Features

| Category        | Features                                                                 |
|-----------------|--------------------------------------------------------------------------|
| **Users**       | 👨‍🎓 Student profiles, 👩‍🏫 Faculty management, 👨‍💼 Admin roles            |
| **Academics**   | 📚 Course management, 📝 Task management          |
| **System**      | 🔐 JWT Authentication, 📧 Email notifications, ☁️ Cloudinary file storage |

---

## 🛠️ Tech Stack

**Frontend**  
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

**Backend**  
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

**Database**  
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Mongodb](https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white)

**Services**  
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone [repo-url]
cd [folder-name]
npm install
```

### 2. Configure Environment
Create \`.env\` file with:
```env
DATABASE_URL=\"your_db_url\"
JWT_SECRET=\"your_jwt_secret\"
CLOUDINARY_CLOUD_NAME=\"your_cloud_name\"
EMAIL_USER=
EMAIL_PASS=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run Development
```bash
npm run dev  # Starts both frontend and backend
```

---

## 📂 Project Structure
```bash
.
├── server/          # Backend code
│   ├── config/      # Configuration files
│   ├── controllers/ # Route controllers
│   ├── models/      # Data models
│   └── server.js    # Main server file
├── src/             # Frontend code
│   ├── assets/      # Static assets
│   ├── components/  # Reusable components
│   ├── pages/       # Application pages
│   └── App.jsx      # Root component
└── prisma/          # Database schema
```

---

## 📜 Available Scripts

| Command               | Action                                      |
|-----------------------|---------------------------------------------|
| \`npm run dev\`         | Start client & server concurrently         |
| \`npm run server\`      | Start backend server only                  |
| \`npm run client\`      | Start frontend development server          |
| \`npm run build\`       | Create production build                    |
| \`npm run db:generate\` | Generate Prisma client                     |
| \`npm run db:push\`     | Sync database schema                       |

---

## 📄 License

Distributed under the MIT License. See \`LICENSE\` for more information.


