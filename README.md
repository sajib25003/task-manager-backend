# Task Manager - Backend

## 🚀 Live API Link
🔗 **[Task Manager API](https://task-manager-backend-khaki-gamma.vercel.app)**  

## 📦 Project Setup

### ⚙️ To Run Locally:
1. Clone the repository:  
   ```bash
   git clone <repository-url>
   cd task-manager-backend
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
3. Run the development server:  
   ```bash
   npm run dev
   ```

### 🚀 Deploying to Production:
1. Create a **vercel.json** file in the root directory:
   ```json
   {
      "version": 2,
      "builds": [
        {
          "src": "dist/index.js",
          "use": "@vercel/node"
        }
      ],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "dist/index.js",
          "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        }
      ]
   }
   ```
2. Run the following commands:
   ```bash
   tsc
   vercel --prod
   ```

---

## 🔗 API Endpoints

| **Endpoint**               | **Method** | **Description**                     |
|----------------------------|------------|-------------------------------------|
| `/api/users`               | `POST`     | Create a new user                  |
| `/api/users`               | `GET`      | Retrieve all users                 |
| `/api/login`               | `POST`     | User login                         |
| `/api/allTasks`            | `GET`      | Retrieve all tasks                 |
| `/api/tasks/:userId`       | `GET`      | Get tasks by user ID               |
| `/api/tasks`               | `POST`     | Create a new task                  |
| `/api/tasks/:id`           | `PATCH`    | Update an existing task            |
| `/api/tasks/:id`           | `DELETE`   | Delete a task                      |

---

## 🛠 Tech Stack
- **Node.js** - Backend runtime
- **Express.js** - Web framework
- **MongoDB & Mongoose** - Database & ORM
- **TypeScript** - Type safety
- **JWT** - Authentication
- **CORS** - Cross-Origin Resource Sharing
- **Bcrypt** - Password hashing
- **Vercel** - Deployment

---

## 🛡 Security & Authentication
- User authentication is handled using **JWT**.
- Passwords are securely stored using **Bcrypt** hashing.
- CORS is configured to allow frontend connections.

---

## 🤝 Contribution
Feel free to fork this repo and contribute! 🚀  
