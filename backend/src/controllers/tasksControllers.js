import Task from "../models/Task.js";

export const getAllTasks = async (req, res) => {
  const { filter = "today" } = req.query;
  const now = new Date();

  let query = {};  // query mặc định: tất cả

  switch (filter) {
    case "today": {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query = { doDate: { $gte: startOfDay } };
      break;
    }

    case "week": {
      const dayOfWeek = now.getDay(); // 0=CN, 1=T2, ..., 6=T7
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const mondayDate = now.getDate() - daysToMonday;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), mondayDate);
      query = { doDate: { $gte: startOfWeek } };
      break;
    }

    case "month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query = { doDate: { $gte: startOfMonth } };
      break;
    }

    case "no-expired": {
      // Nhiệm vụ chưa hết hạn: doDate >= today HOẶC chưa có doDate
      // Và chưa hoàn thành (status = "active")
      query = {
        status: "active",
        $or: [
          { doDate: { $gte: now } },
          { doDate: null },
        ],
      };
      break;
    }

    case "expired": {
      // Nhiệm vụ quá hạn: doDate < today, chưa hoàn thành, có doDate
      query = {
        status: "active",
        doDate: { $lt: now, $ne: null },  // $ne: null để loại bỏ task không có ngày
      };
      break;
    }

    case "all":
    default: {
      query = {}; // hoặc { } để lấy hết
      break;
    }
  }

  try {
    const result = await Task.aggregate([
      { $match: query },
      {
        $facet: {
          tasks: [
            { $sort: { doDate: -1, createdAt: -1 } }, // fallback nếu doDate null
          ],
          activeCount: [
            { $match: { status: "active" } },
            { $count: "count" },
          ],
          completeCount: [
            { $match: { status: "complete" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const tasks = result[0].tasks;
    const activeCount = result[0].activeCount[0]?.count || 0;
    const completeCount = result[0].completeCount[0]?.count || 0;

    res.status(200).json({ tasks, activeCount, completeCount });
  } catch (error) {
    console.error("Lỗi khi gọi getAllTasks:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, describe, doDate } = req.body;
    const task = new Task({ title, describe, doDate });

    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Lỗi khi gọi createTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, describe, status, doDate, completedAt } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        describe,
        status,
        doDate,
        completedAt,
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Nhiệm vụ không tồn tại" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Lỗi khi gọi updateTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const deleteTask = await Task.findByIdAndDelete(req.params.id);

    if (!deleteTask) {
      return res.status(404).json({ message: "Nhiệm vụ không tồn tại" });
    }

    res.status(200).json(deleteTask);
  } catch (error) {
    console.error("Lỗi khi gọi deleteTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
