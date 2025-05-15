import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  isWithinInterval,
  parseISO,
  eachWeekOfInterval,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useState } from "react";
import { statusColorMap } from "@/types/scheduleTypes";
import { getSchedulesResponse } from "@/types/scheduleApiTypes";

interface CalendarProps {
  scheduleList: getSchedulesResponse[];
}

// 주 단위로 이벤트를 처리하기 위한 인터페이스
interface WeekEvent {
  schedule: getSchedulesResponse;
  startIdx: number;
  endIdx: number;
  row?: number;
}

const Calendar = ({ scheduleList }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const prevMonth = subMonths(currentDate, 1);
  const nextMonth = addMonths(currentDate, 1);

  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });

  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  // 해당 월을 주 단위로 자르기
  const weekStarts = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 });

  // 주마다 7일씩 채우기
  const weeks = weekStarts.map((weekStart) =>
    Array.from({ length: 7 }, (_, i) =>
      format(addDays(weekStart, i), "yyyy-MM-dd")
    )
  );

  // 주별로 일정을 계산하는 함수
  const getWeekEvents = (
    week: string[],
    schedules: getSchedulesResponse[]
  ): WeekEvent[] => {
    const weekEvents: WeekEvent[] = [];

    // 이 주에 표시되는 실제 날짜들(parseISO로 변환된 날짜 객체들)
    const weekDates = week.map((dateStr) => parseISO(dateStr));

    schedules.forEach((schedule) => {
      const scheduleStart = startOfDay(
        parseISO(schedule.scheduleStartDate ?? "")
      );
      const scheduleEnd = endOfDay(parseISO(schedule.scheduleEndDate ?? ""));

      // 이 주의 시작일과 종료일
      const weekStartDate = weekDates[0];
      const weekEndDate = weekDates[6];

      // 이 일정이 현재 주에 표시되는지 확인 - 실제 날짜를 직접 비교
      let hasOverlap = false;

      // 각 날짜가 일정 기간 내에 있는지 검사
      for (let i = 0; i < weekDates.length; i++) {
        if (
          isWithinInterval(weekDates[i], {
            start: scheduleStart,
            end: scheduleEnd,
          })
        ) {
          hasOverlap = true;
          break;
        }
      }

      // 또는 일정이 이 주 전체를 포함하는 경우
      if (scheduleStart <= weekStartDate && scheduleEnd >= weekEndDate) {
        hasOverlap = true;
      }

      if (hasOverlap) {
        // 해당 주에서 일정의 시작일과 종료일에 해당하는 인덱스 찾기
        let startIdx = -1;
        let endIdx = -1;

        // 각 날짜를 확인하여 일정의 시작일/종료일과 일치하는지 찾기
        for (let i = 0; i < weekDates.length; i++) {
          if (isSameDay(weekDates[i], scheduleStart)) {
            startIdx = i;
          }
          if (isSameDay(weekDates[i], scheduleEnd)) {
            endIdx = i;
          }
        }

        // 일정 시작일이 이 주 이전인 경우
        if (startIdx === -1 && scheduleStart < weekStartDate) {
          startIdx = 0;
        }

        // 일정 종료일이 이 주 이후인 경우
        if (endIdx === -1 && scheduleEnd > weekEndDate) {
          endIdx = 6;
        }

        // 유효한 인덱스가 계산되었으면 이벤트 추가
        if (startIdx !== -1 && endIdx !== -1) {
          weekEvents.push({
            schedule,
            startIdx,
            endIdx,
          });
          // 일정 종료일이 빠른 순으로 정렬
          weekEvents.sort((a, b) => {
            const aEnd = parseISO(a.schedule.scheduleEndDate ?? "").getTime();
            const bEnd = parseISO(b.schedule.scheduleEndDate ?? "").getTime();
            return aEnd - bEnd;
          });
        }
      }
    });

    // row 계산: 겹치지 않는 줄에 배치
    const layers: WeekEvent[][] = [];
    weekEvents.forEach((event) => {
      let placed = false;
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const isConflict = layer.some(
          (existing) =>
            !(
              event.endIdx < existing.startIdx ||
              event.startIdx > existing.endIdx
            )
        );
        if (!isConflict) {
          layer.push(event);
          event.row = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        layers.push([event]);
        event.row = layers.length - 1;
      }
    });

    return weekEvents;
  };

  return (
    <div className="pt-5">
      <div className="flex h-10 items-center justify-between bg-white border border-gray-200 rounded-lg mb-3 px-4">
        {/* 이전 달 */}
        <button
          onClick={() => setCurrentDate(prevMonth)}
          className="text-sm text-gray-600 hover:text-black cursor-pointer"
        >
          {format(prevMonth, "< M월")}
        </button>

        {/* 현재 달 */}
        <h2 className="text-xl font-bold text-center">
          {format(currentDate, "yyyy년 M월")}
        </h2>

        {/* 다음 달 */}
        <button
          onClick={() => setCurrentDate(nextMonth)}
          className="text-sm text-gray-600 hover:text-black cursor-pointer"
        >
          {format(nextMonth, "M월 >")}
        </button>
      </div>

      <div className="grid grid-cols-7 border border-gray-200 rounded bg-white overflow-hidden">
        {/* 요일 */}
        {weekdayLabels.map((day) => (
          <div
            key={day}
            className="h-10 border-r border-b border-gray-200 text-xs font-semibold text-gray-500 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      {weeks.map((week, weekIndex) => {
        // 이 주의 일정 계산
        const weekEvents = getWeekEvents(week, scheduleList);

        return (
          <div key={weekIndex} className="relative">
            {/* 일자 셀 */}
            <div className="h-26 grid grid-cols-7 bg-white border-l">
              {week.map((date) => {
                const dateObj = parseISO(date);
                const isTodayDate = isToday(dateObj);
                const isCurrentMonth = isSameMonth(
                  dateObj,
                  new Date(year, month - 1)
                );

                return (
                  <div
                    key={date}
                    className={`min-h-[60px] border-r border-b border-gray-200 p-1 text-sm flex flex-col ${
                      isTodayDate
                        ? "bg-purple-100 font-bold border-purple-300 border"
                        : ""
                    } ${isCurrentMonth ? "text-gray-800" : "text-gray-300"}`}
                  >
                    <div>{format(dateObj, "d")}</div>
                  </div>
                );
              })}
            </div>

            {/* 일정 바 - 절대 위치로 배치 */}
            <div className="absolute top-0 left-0 w-full h-26 overflow-hidden">
              {weekEvents.map((event, idx) => {
                // 배경색
                const colorClass =
                  statusColorMap[event.schedule.scheduleStatusName] ??
                  "bg-gray-300";
                // 여백
                const gapPx = 2;
                // 가로 길이 계산 (각 셀 너비는 1/7, 시작과 끝 인덱스로 계산)
                const width = `calc(${
                  ((event.endIdx - event.startIdx + 1) / 7) * 100
                }% - ${gapPx * 2}px)`;
                // 시작 위치 계산
                const left = `calc(${
                  (event.startIdx / 7) * 100
                }% + ${gapPx}px)`;
                // 일정이 여러 개 있을 때 겹치지 않도록 세로 위치 조정
                const top = `${25 + (event.row ?? 0) * 26}px`;

                return (
                  // 클릭하면 자기소개서 상세 페이지 모달
                  <button
                    key={`${event.schedule.scheduleId}-week-${weekIndex}-event-${idx}`}
                    className={`absolute rounded-lg ${colorClass} text-[11px] text-left px-3 py-1 rounded whitespace-nowrap overflow-hidden text-ellipsis opacity-70 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={{ left, width, top }}
                    title={event.schedule.scheduleMemo ?? ""}
                  >
                    {event.schedule.scheduleTitle}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Calendar;
