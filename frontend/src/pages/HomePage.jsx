import AddTask from "@/components/AddTask";
import DateTimeFilter from "@/components/DateTimeFilter";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import StatsAndFilters from "@/components/StatsAndFilters";
import TaskList from "@/components/TaskList";
import TaskListPagination from "@/components/TaskListPagination";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { visibleTaskLimit } from "@/lib/data";
import { TaskCalendar } from "@/components/TaskCalendar";

const HomePage = () => {
  const [taskBuffer, setTaskBuffer] = useState([]); // luôn là mảng
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [completeTaskCount, setCompleteTaskCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [dateQuery, setDateQuery] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // trạng thái đang tải

  useEffect(() => {
    fetchTasks();
  }, [dateQuery]);

  useEffect(() => {
    setPage(1); // reset về trang 1 khi filter hoặc date thay đổi
  }, [filter, dateQuery]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/tasks?filter=${dateQuery}`);
      const tasks = Array.isArray(res.data.tasks) ? res.data.tasks : [];
      setTaskBuffer(tasks);
      setActiveTaskCount(res.data.activeCount || 0);
      setCompleteTaskCount(res.data.completeCount || 0);
    } catch (error) {
      console.error("Lỗi xảy ra khi truy xuất tasks:", error);
      toast.error("Lỗi xảy ra khi truy xuất tasks.");
      setTaskBuffer([]); // fallback về rỗng nếu lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskChanged = () => {
    fetchTasks();
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Tính filteredTasks an toàn
  const filteredTasks = Array.isArray(taskBuffer)
    ? taskBuffer.filter((task) => {
        if (!task || typeof task !== "object") return false;
        switch (filter) {
          case "active":
            return task.status === "active";
          case "completed":
            return task.status === "complete";
          default:
            return true;
        }
      })
    : [];

  const totalPages = Math.ceil(filteredTasks.length / visibleTaskLimit) || 1;

  // Điều chỉnh page nếu cần (tránh page không hợp lệ sau khi filter)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filteredTasks.length, totalPages, page]);

  const visibleTasks = filteredTasks.slice(
    (page - 1) * visibleTaskLimit,
    page * visibleTaskLimit
  );

  return (
    <div className="min-h-screen w-full bg-[#fefcff] relative">
      {/* Dreamy Sky Pink Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
            radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      />

      <div className="container relative z-10 mx-auto">
        <div className="w-full p-6 mx-auto space-y-6">
          <div className="lg:flex">
            {/* Cột trái: AddTask + Calendar + Stats */}
            <div className="max-[1099px]:w-full w-1/3 p-6 mx-auto space-y-6">
              <AddTask handleNewTaskAdded={handleTaskChanged} />
              
              <StatsAndFilters
                filter={filter}
                setFilter={setFilter}
                activeTasksCount={activeTaskCount}
                completedTasksCount={completeTaskCount}
              />

              <TaskCalendar tasks={taskBuffer} />

            </div>

            {/* Cột phải: Header + TaskList + Pagination + Filter + Footer */}
            <div className="max-[1099px]:w-full w-2/3 p-6 mx-auto space-y-6">
              <Header />

              {isLoading ? (
                <div className="p-6 text-center text-gray-500">
                  Đang tải danh sách nhiệm vụ...
                </div>
              ) : (
                <>
                  <TaskList
                    filteredTasks={visibleTasks}
                    filter={filter}
                    handleTaskChanged={handleTaskChanged}
                  />

                  <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <TaskListPagination
                      handleNext={handleNext}
                      handlePrev={handlePrev}
                      handlePageChange={handlePageChange}
                      page={page}
                      totalPages={totalPages}
                    />
                    <DateTimeFilter
                      dateQuery={dateQuery}
                      setDateQuery={setDateQuery}
                    />
                  </div>
                </>
              )}

              <Footer
                activeTasksCount={activeTaskCount}
                completedTasksCount={completeTaskCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;