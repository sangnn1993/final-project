import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Textarea } from "./ui/textarea";

const AddTask = ({ handleNewTaskAdded }) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescribe, setNewTaskDescribe] = useState("");
  const [newDate, setNewDate] = useState("");
  const addTask = async () => {
    if (newTaskTitle.trim() && newTaskDescribe.trim()) {
      try {
        await api.post("/tasks", { title: newTaskTitle , describe: newTaskDescribe, doDate: newDate });
        toast.success(`Công việc đã được thêm thành công!`);
        handleNewTaskAdded();
      } catch (error) {
        console.error("Lỗi xảy ra khi thêm task!", error);
        toast.error("Lỗi xảy ra khi thêm công việc mới!");
      }

      setNewTaskTitle("");
      setNewTaskDescribe("");
      setNewDate("");
    } else {
      toast.error("Bạn cần nhập nội dung đầy đủ!");
    }
  };

  // const handleKeyPress = (event) => {
  //   if (event.key === "Enter") {
  //     addTask();
  //   }
  // };

  return (
    <Card className="p-6 border-0 bg-gradient-card shadow-custom-lg">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          placeholder="Tiêu đề công việc..."
          className="h-12 text-base bg-slate-50 sm:flex-1 border-border/50 focus:border-primary/50 focus:ring-primary/20"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          // onKeyPress={handleKeyPress}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Textarea
          placeholder="Mô tả chi tiết công việc..."
          className="min-h-[100px] text-base bg-slate-50 border-border/50 focus:border-primary/50 focus:ring-primary/20 resize-y"
          value={newTaskDescribe}
          onChange={(e) => setNewTaskDescribe(e.target.value)}
          rows={5}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="date"
          className="h-12 text-base bg-slate-50 sm:flex-1 border-border/50 focus:border-primary/50 focus:ring-primary/20"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          // onKeyPress={handleKeyPress}
        />
        <Button
          variant="gradient"
          size="xl"
          className="px-6"
          onClick={addTask}
          disabled={!newTaskTitle.trim() || !newTaskDescribe.trim()}
        >
          <Plus className="size-5" />
          Thêm
        </Button>
      </div>
    </Card>
  );
};

export default AddTask;
