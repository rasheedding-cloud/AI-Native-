import React, { useEffect, useRef } from 'react';
import dayjs from 'dayjs';

const WeekViewSimple: React.FC<{
  selectedDate: dayjs.Dayjs;
  onDateSelect: (date: dayjs.Dayjs) => void;
  calendarBlocks: any[];
}> = ({ selectedDate, onDateSelect, calendarBlocks }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const startOfWeek = selectedDate.startOf('week');
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(startOfWeek.add(i, 'day'));
  }

  // 固定时间格子高度
  const timeSlotHeight = 60;

  // 宽度计算 - 最终完美适配确保周六完全在1280px视窗内可见
  const timeAxisWidth = 34; // 最终时间轴宽度
  const dayColumnWidth = 73; // 最终列宽，确保周六完全可见
  const totalWidth = timeAxisWidth + dayColumnWidth * 7; // 总宽度545px，完美适配1280px屏幕

  // 生成时间轴（早九点到晚九点，每小时一行）
  const timeSlots = [];
  for (let hour = 9; hour <= 21; hour++) {
    const hourStr = hour < 10 ? '0' + hour : hour.toString();
    timeSlots.push({
      time: `${hourStr}:00`,
      hour,
      minute: 0
    });
  }

  // 自动滚动到合适位置，确保周五周六可见
  useEffect(() => {
    const timer = setTimeout(() => {
      if (gridRef.current && headerRef.current) {
        const gridContainer = gridRef.current;
        const headerContainer = headerRef.current;
        const containerWidth = gridContainer.clientWidth;
        const totalWidth = timeAxisWidth + dayColumnWidth * 7;

        // 如果总宽度超过容器宽度，计算合适的滚动位置
        if (totalWidth > containerWidth) {
          // 计算让周四到周六在可视区域内的滚动位置
          const thursdayPosition = timeAxisWidth + dayColumnWidth * 4; // 周四的位置
          const targetScroll = Math.max(0, thursdayPosition - containerWidth / 2);

          gridContainer.scrollLeft = targetScroll;
          headerContainer.scrollLeft = targetScroll;
        } else {
          // 如果总宽度不超过容器宽度，居中显示
          const targetScroll = (containerWidth - totalWidth) / 2;
          gridContainer.scrollLeft = targetScroll;
          headerContainer.scrollLeft = targetScroll;
        }
      }
    }, 200); // 延迟200ms确保DOM完全渲染

    return () => clearTimeout(timer);
  }, [selectedDate, timeAxisWidth, dayColumnWidth]);

  // 同步滚动
  const handleGridScroll = () => {
    if (gridRef.current && headerRef.current) {
      headerRef.current.scrollLeft = gridRef.current.scrollLeft;
    }
  };

  const handleHeaderScroll = () => {
    if (gridRef.current && headerRef.current) {
      gridRef.current.scrollLeft = headerRef.current.scrollLeft;
    }
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#fafafa',
      padding: '16px',
      borderRadius: '8px',
      minWidth: 'fit-content'
    }}>
      <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
        📅 周视图 - {selectedDate.format('YYYY年MM月DD日')}
      </div>

      {/* 日期头部 - 支持横向滚动 */}
      <div
        ref={headerRef}
        onScroll={handleHeaderScroll}
        style={{
          display: 'flex',
          marginBottom: '12px',
          backgroundColor: 'white',
          borderRadius: '6px',
          overflowX: 'auto',
          minWidth: 'fit-content'
        }}
      >
        <div style={{ width: `${timeAxisWidth}px`, flexShrink: 0 }}></div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            style={{
              width: `${dayColumnWidth}px`,
              flexShrink: 0,
              textAlign: 'center',
              padding: '10px 8px',
              backgroundColor: day.isSame(selectedDate, 'day') ? '#e6f7ff' : 'white',
              cursor: 'pointer',
              borderLeft: index > 0 ? '1px solid #f0f0f0' : 'none'
            }}
            onClick={() => onDateSelect(day)}
          >
            <div style={{ fontSize: '10px', color: '#666', fontWeight: '500' }}>
              {day.format('ddd')}
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: day.isSame(selectedDate, 'day') ? 'bold' : '600',
              color: day.isSame(selectedDate, 'day') ? '#1890ff' : '#333'
            }}>
              {day.date()}
            </div>
          </div>
        ))}
      </div>

      {/* 时间轴网格 - 支持横向滚动 */}
      <div
        ref={gridRef}
        onScroll={handleGridScroll}
        style={{
          height: `${timeSlotHeight * 13}px`,
          overflow: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: '6px',
          backgroundColor: 'white'
        }}
      >
        <div style={{ display: 'flex', minWidth: `${totalWidth}px` }}>
          {/* 时间轴 */}
          <div style={{
            width: `${timeAxisWidth}px`,
            flexShrink: 0,
            backgroundColor: '#fafafa'
          }}>
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                style={{
                  height: `${timeSlotHeight}px`,
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: '#666',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                }}
              >
                {slot.time}
              </div>
            ))}
          </div>

          {/* 日期列 */}
          <div style={{ display: 'flex' }}>
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                style={{
                  width: `${dayColumnWidth}px`,
                  flexShrink: 0,
                  borderLeft: dayIndex > 0 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                {timeSlots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    style={{
                      height: `${timeSlotHeight}px`,
                      borderBottom: '1px solid #f0f0f0',
                      borderRight: '1px solid #f0f0f0',
                      backgroundColor: day.isSame(selectedDate, 'day') ? '#f0f8ff' : (slotIndex % 2 === 0 ? '#fafafa' : 'white'),
                      cursor: 'pointer'
                    }}
                    onClick={() => onDateSelect(day)}
                  >
                    {/* 这里可以添加事件显示 */}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 时间轴说明 */}
      <div style={{
        textAlign: 'center',
        marginTop: '12px',
        fontSize: '10px',
        color: '#999',
        padding: '8px',
        backgroundColor: 'white',
        borderRadius: '4px',
        border: '1px solid #f0f0f0'
      }}>
        <div>🕐 时间轴：早九点到晚九点（共13小时）</div>
        <div>⏱️ 每小时显示，支持横向滚动查看所有日期</div>
        <div>📅 显示完整7天：{weekDays.map(day => day.format('ddd')).join(', ')}</div>
      </div>
    </div>
  );
};

export default WeekViewSimple;