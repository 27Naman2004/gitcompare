# 🚀 GitCompare - Production-Ready Git Comparison Ecosystem

GitCompare is a high-performance developer suite designed for seamless repository analysis, branch diffing, and historical growth tracking. Built with **Java Spring Boot 3.2** and **Next.js 14**, it provides a robust engine for git-based insights.

---

## ✨ Features

- **🔐 Secure Auth**: JWT-based identity management with password encryption.
- **🏗️ Git Engine**: Precise cloning and diff calculation powered by JGit.
- **📊 Insightful Dashboard**: Real-time stats for additions, deletions, and active repos.
- **🎨 Premium UI**: Modern aesthetic featuring Glassmorphism, Framer Motion, and Lucide icons.
- **🔍 Diff Viewer**: Integrated Monaco Editor for advanced code diff visualization.
- **🗃️ Comparison History**: Persistent tracking of all past activity in MongoDB.

---

## 🛠️ Getting Started "The Proper Manner"

To run GitCompare correctly, follow these steps to ensure all services are communicating.

### 1. Prerequisites
- **Java 17+ (JDK)**: For the backend engine.
- **Node.js 18+ (LTS)**: For the frontend application.
- **MongoDB**: Running locally at `mongodb://localhost:27017/gitcompare`.
- **System Memory**: At least 4GB RAM is recommended to handle repository cloning.

### 2. Backend Orchestration
1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Launch the Service**:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will be live on `http://localhost:8080`.*

### 3. Frontend Orchestration
1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install & Launch**:
   ```bash
   npm install
   npm run dev
   ```
   *The frontend will be live on `http://localhost:3000`.*

---

## 📦 Deployment Process

### Production Build (JAR)
For production environments, build the backend as an executable JAR to ensure stability.
```bash
cd backend
mvn clean package -DskipTests
java -jar target/git-compare-backend-0.0.1-SNAPSHOT.jar
```

### Static Optimization (Frontend)
Build the frontend for maximum performance and static delivery.
```bash
cd frontend
npm run build
npm start
```

---

## 💡 Using GitCompare Effectively

### Step-by-Step Flow:
1. **Register**: Start by creating an account. This allows the system to partition your comparison history.
2. **Dashboard**: Use the dashboard to see your aggregate developer metrics (Total Additions/Deletions).
3. **Compare**: Input a repository URL and two branches to analyze the delta.
4. **History**: Retrieve any past analysis using the real-time search on your dashboard.

---

## 📈 API Architecture

- `POST /auth/register`: Initialize user identity.
- `POST /auth/login`: Exchange credentials for a JWT.
- `GET /compare/stats`: Fetch aggregate insights for the dashboard.
- `POST /compare`: Execute a new git-diff analyze.
- `GET /compare/history`: List all previous results.

---

## 📋 License
This project is licensed under the MIT License - see the LICENSE file for details.
