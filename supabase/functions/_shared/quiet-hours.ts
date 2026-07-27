const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

function vietnamHour(date: Date) {
  const value = new Intl.DateTimeFormat("en-GB", {
    timeZone: VIETNAM_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return Number(value);
}

/** Không gửi thông báo gia đình trong khung ngủ 22:00–07:00 giờ Việt Nam. */
export function isNotificationQuietTime(date = new Date()) {
  const hour = vietnamHour(date);
  return hour >= 22 || hour < 7;
}
