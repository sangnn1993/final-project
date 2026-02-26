import * as React from "react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

export function TaskCalendar({ tasks =[], onDateSelect }) {

  const taskCountByDate = React.useMemo(() => {
    const map = {};

    // An toàn: nếu tasks không phải array → trả map rỗng
    if (!Array.isArray(tasks)) {
      console.warn("Tasks is not an array:", tasks);
      return map;
    }

    tasks.forEach((task) => {
      if (task?.doDate && task.status === "active") {
        try {
          const parsedDate = new Date(task.doDate);
          if (!isNaN(parsedDate.getTime())) {
            const dateKey = parsedDate.toISOString().split("T")[0];
            map[dateKey] = (map[dateKey] || 0) + 1;
          }
        } catch (e) {}
      }
    });

    return map;
  }, [tasks]);

  return (
    <Card className="overflow-visible border shadow-sm">
      <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Lịch công việc</h3>
            <p className="text-sm text-muted-foreground">
            Số nhiệm vụ chưa hoàn thành theo ngày
            </p>
      </div>

      <div className="overflow-visible p-4 pb-20 relative z-0"> {/* pb-20 để dành chỗ icon nhô lên */}
  <Calendar
    mode="single"
    selected={undefined}
    onSelect={onDateSelect}
    className="rounded-md border overflow-visible"
    style={{ overflow: 'visible' }}  // inline
    components={{
      DayContent: ({ date, displayMonth, ...props }) => {
        const dateKey = date.toISOString().split("T")[0];
        const count = taskCountByDate[dateKey] || 0;
        const isCurrentMonth = date.getMonth() === displayMonth.getMonth();

        return (
          <div 
            className="relative size-9 overflow-visible" 
            style={{ overflow: 'visible' }}  // inline nữa cho chắc
          >
            <button
              {...props}
              className={cn(
                "size-9 p-0 font-normal relative overflow-visible",
                !isCurrentMonth && "text-muted-foreground opacity-40"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-colors",
                  props.isSelected && "bg-primary text-primary-foreground",
                  props.isToday && !props.isSelected && "bg-accent text-accent-foreground"
                )}
              >
                {date.getDate()}
              </span>

              {count > 0 && (
                <>
                  {/* Badge nhỏ dưới ngày - cái này thường hiện tốt hơn */}
                  <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-600 z-10 pointer-events-none">
                    {count}
                  </span>

                  {/* Icon stack to -top-right - thử -top-7 -right-7 nếu cần nhô xa hơn */}
                  <div
                    className={cn(
                      "absolute -top-7 -right-7 z-[999] flex size-8 items-center justify-center",
                      "rounded-full bg-red-600 text-white text-sm font-bold shadow-2xl",
                      "ring-2 ring-white border-2 border-background pointer-events-none"
                    )}
                    style={{ transform: 'translate(50%, -50%)' }} // giúp căn chỉnh đẹp hơn
                  >
                    {count}!
                  </div>
                </>
              )}
            </button>
          </div>
        );
      },
    }}
  />
</div>
    </Card>
  );
}