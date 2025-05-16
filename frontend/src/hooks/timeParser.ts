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

  // 하루 이내: 'HH:MM' 형식
  if (diffInDays < 1) {
    const hours = targetTime.getHours().toString().padStart(2, "0");
    const minutes = targetTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // 하루 이상: 'YYYY. MM. DD.' 형식 (toLocaleDateString 사용)
  return targetTime.toLocaleDateString();
};
