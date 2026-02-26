
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Thêm check biến môi trường để debug
    if (!process.env.MONGODB_CONNECTIONSTRING) {
      throw new Error("MONGODB_CONNECTIONSTRING không được định nghĩa trong biến môi trường");
    }

    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING, {
      // Các option ổn định và thường dùng với Atlas
      serverSelectionTimeoutMS: 5000,     // timeout nếu không connect được
      maxPoolSize: 10,                    // giới hạn connection pool
    });

    console.log(`Liên kết CSDL thành công! (MongoDB Atlas)`);
    
    // Optional: log tên database đang connect (dễ debug)
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Database: ${dbName}`);
  } catch (error) {
    console.error("Lỗi khi kết nối CSDL:", error.message || error);
    process.exit(1);
  }
};