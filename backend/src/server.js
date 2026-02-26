import express from "express";
import taskRoute from "./routes/tasksRouters.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5001;  // Đồng bộ với docker-compose và Dockerfile
const __dirname = path.resolve();

const app = express();

// Middlewares
app.use(express.json());

// Bật CORS cho cả dev và production (fix 405 preflight)
app.use(cors({
  origin: true,  // Tạm thời cho phép mọi origin (test nhanh, an toàn cho bài tập)
  // Nếu muốn giới hạn: origin: ["http://localhost:5173", "http://76.13.212.120"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Xử lý OPTIONS preflight cho mọi route (rất quan trọng để fix 405)
app.options("*", cors());

// Routes
app.use("/api/tasks", taskRoute);

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Kết nối DB và listen
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT} | Env: ${process.env.NODE_ENV || "development"}`);
  });
}).catch(err => {
  console.error("Không thể khởi động server vì lỗi DB:", err);
  process.exit(1);
});