export const formatDate = (timestamp: string | number) => {
  const date = new Date(timestamp);
  const today = new Date();

  // 날짜만 비교하기 위해 시간 부분 초기화
  const dateWithoutTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const todayWithoutTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // 밀리초 차이를 일수로 변환
  const diffTime = todayWithoutTime.getTime() - dateWithoutTime.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  return `${diffDays}일 전`;
};
