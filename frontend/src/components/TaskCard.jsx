import React, { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar, CheckCircle2, Circle, SquarePen, Trash2 } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

const TaskCard = ({ task, index, handleTaskChanged }) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // ← Chế độ chỉnh sửa
  const [isDeleting, setIsDeleting] = useState(false);

  // Giá trị form (chỉ dùng khi edit)
  const [editTitle, setEditTitle] = useState(task.title || "");
  const [editDescribe, setEditDescribe] = useState(task.describe || "");
  const [editDoDate, setEditDoDate] = useState(
    task.doDate ? task.doDate.split("T")[0] : ""
  );

  // Reset form khi mở dialog hoặc task thay đổi
  useEffect(() => {
    if (openDetail) {
      setEditTitle(task.title || "");
      setEditDescribe(task.describe || "");
      setEditDoDate(task.doDate ? task.doDate.split("T")[0] : "");
      setIsEditing(false); // Mở dialog luôn ở chế độ xem
    }
  }, [openDetail, task]);

  // Auto-resize textarea (tùy chọn, giữ cho đẹp)
  const textareaRef = useRef(null);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !isEditing) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [editDescribe, isEditing]);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast.error("Tiêu đề không được để trống!");
      return;
    }
    try {
      await api.put(`/tasks/${task._id}`, {
        title: editTitle,
        describe: editDescribe,
        doDate: editDoDate || null,
      });
      toast.success("Nhiệm vụ đã được cập nhật!");
      handleTaskChanged();
      setOpenDetail(false);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Không thể cập nhật nhiệm vụ.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success("Nhiệm vụ đã được xóa.");
      handleTaskChanged();
      setOpenDetail(false);
    } catch (error) {
      console.error("Lỗi xóa:", error);
      toast.error("Không thể xóa nhiệm vụ.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleComplete = async (e) => {
    e.stopPropagation();
    try {
      const newStatus = task.status === "active" ? "complete" : "active";
      await api.put(`/tasks/${task._id}`, {
        status: newStatus,
        completedAt: newStatus === "complete" ? new Date().toISOString() : null,
      });
      toast.success(
        newStatus === "complete"
          ? `${task.title} đã hoàn thành.`
          : `${task.title} đã được đánh dấu chưa hoàn thành.`
      );
      handleTaskChanged();
    } catch (error) {
      console.error("Lỗi toggle:", error);
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  return (
    <Dialog open={openDetail} onOpenChange={setOpenDetail}>
      <DialogTrigger asChild>
        <Card
          className={cn(
            "p-4 bg-gradient-card border-0 shadow-custom-md hover:shadow-custom-lg transition-all duration-200 animate-fade-in group cursor-pointer",
            task.status === "complete" && "opacity-75"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex-shrink-0 size-8 rounded-full",
                task.status === "complete"
                  ? "text-success hover:text-success/80"
                  : "text-muted-foreground hover:text-primary"
              )}
              onClick={toggleComplete}
            >
              {task.status === "complete" ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Circle className="size-5" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-base font-medium",
                  task.status === "complete" && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>
                  {task.doDate
                    ? new Date(task.doDate).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Chưa có hạn chót"}
                </span>
              </div>
            </div>

            <SquarePen className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Chi tiết nhiệm vụ</DialogTitle>
          <DialogDescription>
            {task.status === "complete" ? "(Đã hoàn thành)" : "Đang thực hiện"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tiêu đề */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Tiêu đề</label>
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
              />
            ) : (
              <p className="text-base font-medium px-3 py-2 bg-muted/40 rounded-md border">
                {task.title}
              </p>
            )}
          </div>

          {/* Hạn chót */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Hạn chót</label>
            {isEditing ? (
              <Input
                type="date"
                value={editDoDate}
                onChange={(e) => setEditDoDate(e.target.value)}
              />
            ) : (
              <p className="px-3 py-2 bg-muted/40 rounded-md border text-sm">
                {task.doDate
                  ? new Date(task.doDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Chưa có hạn chót"}
              </p>
            )}
          </div>

          {/* Mô tả */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Mô tả</label>
            {isEditing ? (
              <Textarea
                ref={textareaRef}
                placeholder="Nhập mô tả chi tiết công việc..."
                className="min-h-[100px] overflow-hidden resize-none"
                value={editDescribe}
                onChange={(e) => setEditDescribe(e.target.value)}
              />
            ) : (
              <div className="px-3 py-2 bg-muted/40 rounded-md border text-sm whitespace-pre-wrap min-h-[80px]">
                {task.describe || "Chưa có mô tả"}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 pt-4 border-t">

          {/* Bên trái: Nút Xóa - luôn hiển thị */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 px-3"
              >
                <Trash2 className="size-4 mr-2" />
                Xóa nhiệm vụ
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa nhiệm vụ <strong>"{task.title}"</strong>?  
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Bên phải: Các nút chính */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Thoát chỉnh sửa
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!editTitle.trim()} // optional: disable nếu title rỗng
                >
                  Lưu thay đổi
                </Button>
              </>
            ) : (
              <Button 
                variant="default" 
                onClick={() => setIsEditing(true)}
              >
                <SquarePen className="size-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCard;