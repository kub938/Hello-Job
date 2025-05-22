export const timeParser = (time: string): string => {
  const currentTime = new Date();
  const targetTime = new Date(time);

  // 밀리초 단위의 시간 차이
  const diffInMs = currentTime.getTime() - targetTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // 1분 이내: '방금 전'
  if (diffInMinutes < 1) {
    return "방금 전";
  }

  // 1시간 이내: 'n분 전'
  if (diffInHours < 1) {
    return `${diffInMinutes}분 전`;
  }

  // 하루 이내: 'n시간 전전' 형식
  if (diffInDays < 1) {
    return `${diffInHours}시간 전`;
  }

  // 어제 표기
  if (diffInDays < 2) {
    const target_month = targetTime.getMonth();
    const current_month = currentTime.getMonth();
    const target_day = targetTime.getDay();
    const current_day = currentTime.getDay();

    if (target_month > current_month || target_day < current_day) {
      return "어제";
    }
  }

  // 하루 이상: 'YYYY. MM. DD.' 형식 (toLocaleDateString 사용)
  return targetTime.toLocaleDateString();
};
