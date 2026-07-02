/**
 * i18n dictionary — GAME SCREENS chrome (dashboard, mining, boss, rewards, me).
 * Scope = the app's OWN structural UI labels. Game DATA authored as content
 * (pet/item/boss names, pet quotes, parent-entered task titles) stays as-is —
 * those are proper nouns / user data, not chrome, and translating them would
 * break the pure-function tests that assert Vietnamese flavor.
 */

export const gameDict = {
  vi: {
    // Wallet units
    "game.points": "ĐIỂM",
    "game.coin": "COIN",

    // Stats
    "game.statsTitle": "⚔️ 5 CHỈ SỐ SỨC MẠNH ANH HÙNG",
    "game.stat.strength": "Thể Lực",
    "game.stat.intellect": "Trí Tuệ",
    "game.stat.discipline": "Kỷ Luật",
    "game.stat.creative": "Sáng Tạo",
    "game.stat.help": "Giúp Đỡ",
    "game.stat.connection": "Kết Nối",
    "game.stat.exp": "EXP",

    // Hero card
    "game.hero.myCorner": "🏠 Của Tớ",
    "game.hero.myCornerTitle": "Góc Của Tớ — tùy biến avatar",
    "game.hero.level": "CẤP {n}",
    "game.hero.exp": "EXP: {n}",
    "game.hero.req": "YÊU CẦU: {n}",

    // Level titles
    "game.levelTitle.100": "Anh Hùng Mùa Hè 👑",
    "game.levelTitle.50": "Hiệp Sĩ Ánh Sáng 🌟",
    "game.levelTitle.20": "Thủ Lĩnh Nhỏ 🎯",
    "game.levelTitle.10": "Chiến Binh Kỷ Luật ⚡",
    "game.levelTitle.5": "Người Khám Phá 🗺️",
    "game.levelTitle.1": "Tân Binh Tập Sự 🛡️",

    // Companion
    "game.companion.feed": "Cho ăn 🍖",

    // Status bar titles
    "game.status.pigeonTitle": "Thư động viên từ bố mẹ!",
    "game.status.streakTitle": "Streak {d} ngày — {f} thẻ đóng băng ❄️",
    "game.status.guideTitle": "Cẩm nang chiến binh",

    // Tasks section
    "game.tasks.title": "🎯 Nhiệm Vụ Hôm Nay",
    "game.tasks.progress": "Xong: {done}/{total} ({pct}%)",
    "game.tasks.tipLabel": "Mẹo:",
    "game.tasks.tip": "Hoàn thành từ 3 nhiệm vụ để duy trì ngọn lửa Streak 🔥.",
    "game.tasks.pending": "⏳ {n} nhiệm vụ chờ bố mẹ duyệt điểm ⭐",
    "game.tasks.nudge": "Nhắc bố mẹ 🕊️",
    "game.tasks.giftsTitle": "🎁 Quà Từ Anh Chị Em",
    "game.tasks.gaveYou": "{emoji} {name} đã tặng con {label}!",
    "game.tasks.thanks": "Đã xem, cảm ơn! 💜",
    "game.tasks.empty": "📭 Không có nhiệm vụ nào trong danh mục này!",

    // Toasts
    "game.toast.focusBonus": "Tuyệt vời! Con đã tập trung đủ lâu — nhận thêm điểm thưởng tập trung! 🌳✨",
    "game.toast.photoSaved": "Đã lưu ảnh vào máy (chỉ bố mẹ trên máy này xem được). 📸",
    "game.toast.photoError": "Không đọc được ảnh, con thử lại nhé! 📸",
    "game.toast.nudgeSent": "Đã gửi lời nhắc đến bố mẹ! Bồ câu đang bay đi đây 🕊️",
    "game.toast.nudgeLimit": "Hôm nay con đã nhắc đủ 2 lần rồi — bố mẹ sẽ duyệt sớm thôi! 🌸",

    // Graduation
    "game.grad.instinct": "“{title}” đã trở thành BẢN NĂNG ANH HÙNG!",
    "game.grad.desc": "Con đã tự giác làm việc này {days} ngày liên tục — giờ nó là một phần con người con rồi, không cần điểm thưởng nữa! Huy hiệu vĩnh viễn ở 🏠 Góc Của Tớ.",
    "game.grad.cta": "TUYỆT VỜI! 🙌",

    // Goal bar
    "game.goal.title": "🎯 Mục tiêu lớn",
    "game.goal.remain": "Còn {n} 🪙 nữa — đào mỏ thôi! ⛏️",

    // Family strip
    "game.family.title": "👨‍👩‍👧‍👦 Nhà Mình",
    "game.family.me": "(tớ)",
    "game.family.switchConfirm": "Đổi sang người chơi {name}?",
    "game.family.giftTitle": "Tặng {name} món gì?",
    "game.family.giftFor": "Tặng quà cho {name}",

    // Task card
    "game.task.parentNote": "👨‍👩‍👧 bố mẹ ghi nhận",
    "game.task.mandatory": "Bắt buộc 🔴",
    "game.task.parentAssigned": "Bố mẹ giao 👑",
    "game.task.waiting": "⏳ Chờ duyệt",
    "game.task.minutes": "🌳 {n}p",
    "game.task.focusDone": "XONG ✅",
    "game.task.focusStop": "Dừng",
    "game.task.focusLabel": "Tập trung: {time}",
    "game.task.focusHintA": "🌳 Bật tập trung để nhận ",
    "game.task.focusHintBold": "điểm thưởng",
    "game.task.focusHintB": " (tùy chọn)",
    "game.task.tickHint": "✓ Làm xong thì tích ô bên trên",
    "game.task.startFocus": "🌳 Tập trung",
    "game.task.photoTitle": "Đính ảnh (tùy chọn, lưu trên máy)",

    // Kanban lanes
    "game.lane.doing": "🌳 ĐANG TẬP TRUNG",
    "game.lane.today": "📋 HÔM NAY",
    "game.lane.waiting": "⏳ CHỜ BỐ MẸ DUYỆT",
    "game.lane.done": "✅ HOÀN THÀNH",

    // Filters
    "game.filter.all": "Tất cả",
    "game.filter.discipline": "⚡ Kỷ luật",
    "game.filter.strength": "❤️ Thể lực",
    "game.filter.intellect": "🧠 Trí tuệ",
    "game.filter.creative": "🎨 Sáng tạo",
    "game.filter.help": "🤝 Giúp đỡ",
    "game.filter.connection": "💞 Kết nối",

    // Letter modal
    "game.letter.title": "Thư Từ Bố Mẹ 💌",
    "game.letter.to": "Gửi đến Chiến Binh {name} yêu dấu",
    "game.letter.cta": "CÁM ƠN BỐ MẸ! ❤️",

    // Critical-hit modal
    "game.crit.title": "ĐIỂM MAY MẮN! 🌟",
    "game.crit.sub": "{name} đã kích hoạt Cú Đập Sức Mạnh 💥",
    "game.crit.reward": "Nhận Thưởng Nhiệm Vụ",
    "game.crit.desc": "Đã nhân đôi Điểm Tích Lũy và nhân hệ số Streak! 🎉",
    "game.crit.cta": "QUÁ TUYỆT VỜI! 🚀",

    // Language switcher (parent System tab)
    "game.lang.title": "🌐 Ngôn ngữ",
    "game.lang.desc": "Áp dụng cho toàn bộ màn hình của con và bố mẹ.",
    "game.lang.vi": "🇻🇳 Tiếng Việt",
    "game.lang.en": "🇬🇧 English",

    // Guide modal
    "game.guide.title": "Cẩm Nang Chiến Binh Mùa Hè 📜",
    "game.guide.subtitle": "Bí kíp để thăng cấp và nhận những phần quà xịn nhất!",
    "game.guide.s1.title": "🎯 1. Làm Nhiệm Vụ Hằng Ngày",
    "game.guide.s1.body": "Hoàn thành các nhiệm vụ bố mẹ giao để nhận EXP thăng cấp, Điểm Tích Lũy ⭐ và Tiền Vàng 🪙.",
    "game.guide.s2.title": "🔥 2. Duy Trì Ngọn Lửa Streak",
    "game.guide.s2.body": "Hoàn thành từ 3 nhiệm vụ mỗi ngày để duy trì ngọn lửa Streak 🔥. Streak càng cao, lượng Điểm ⭐ nhận được từ nhiệm vụ tiếp theo càng nhiều!",
    "game.guide.s3.title": "⚡ 3. Điểm May Mắn (Lucky Multiplier)",
    "game.guide.s3.body": "Mỗi khi hoàn thành một nhiệm vụ, dũng sĩ có 15% cơ hội kích hoạt Điểm May Mắn ⚡ giúp nhân đôi lượng Điểm ⭐ nhận được!",
    "game.guide.s4.title": "⛏️ 4. Đào Mỏ & Đổi Quà",
    "game.guide.s4.body": "• Hoàn thành việc tốt nạp Năng Lượng ⚡.|• Đập đá ở Hang Đào Mỏ ⛏️ nhận Hero Coin 🪙.|• Dùng Điểm ⭐ đổi thời gian chơi TV/game; dùng Hero Coin 🪙 đổi quà thực tế lớn (kem, Lego)!",
    "game.guide.s5.title": "🐾 5. Ấp Trứng & Huấn Luyện Thú Cưỡi",
    "game.guide.s5.body": "• Cách có vật phẩm: Đập đá đào mỏ, nhờ bố mẹ tặng thưởng, hoặc dùng Hero Coin 🪙 mua Trứng, Thuốc phép & Combo Thức ăn trong Cửa Hàng 🛒.|• Ấp thú cưng: Kết hợp Trứng & Thuốc ấp phép để nở ra Fox, Cat, Sói, Rồng 🦊.|• Nuôi pet đạt 100% thân mật sẽ tiến hóa thành Thú Cưỡi khổng lồ 🦖, tăng +10% Năng lượng ⚡ khi làm nhiệm vụ và +5% tỷ lệ nổ Cú Đập Sức Mạnh 🔥 khi đào mỏ!",
    "game.guide.s6.title": "🕊️ 6. Bồ Câu Nhận Thư Động Viên",
    "game.guide.s6.body": "• Mỗi ngày bố mẹ sẽ gửi những lời chúc, lời nhắn nhủ yêu thương từ Phòng Quản Trị.|• Nhấp vào chú bồ câu 🕊️ ở góc màn hình để mở thư động viên của bố mẹ nhé!",
    "game.guide.cta": "CON ĐÃ HIỂU, LÊN ĐƯỜNG THÔI! 🚀",
  },

  en: {
    // Wallet units
    "game.points": "PTS",
    "game.coin": "COIN",

    // Stats
    "game.statsTitle": "⚔️ 5 HERO POWER STATS",
    "game.stat.strength": "Strength",
    "game.stat.intellect": "Intellect",
    "game.stat.discipline": "Discipline",
    "game.stat.creative": "Creative",
    "game.stat.help": "Helpfulness",
    "game.stat.connection": "Connection",
    "game.stat.exp": "EXP",

    // Hero card
    "game.hero.myCorner": "🏠 My Corner",
    "game.hero.myCornerTitle": "My Corner — customize avatar",
    "game.hero.level": "LEVEL {n}",
    "game.hero.exp": "XP: {n}",
    "game.hero.req": "NEEDED: {n}",

    // Level titles
    "game.levelTitle.100": "Summer Hero 👑",
    "game.levelTitle.50": "Knight of Light 🌟",
    "game.levelTitle.20": "Little Leader 🎯",
    "game.levelTitle.10": "Disciplined Warrior ⚡",
    "game.levelTitle.5": "Explorer 🗺️",
    "game.levelTitle.1": "Rookie Trainee 🛡️",

    // Companion
    "game.companion.feed": "Feed 🍖",

    // Status bar titles
    "game.status.pigeonTitle": "Encouragement from your parents!",
    "game.status.streakTitle": "Streak {d} days — {f} freeze cards ❄️",
    "game.status.guideTitle": "Warrior handbook",

    // Tasks section
    "game.tasks.title": "🎯 Today's Quests",
    "game.tasks.progress": "Done: {done}/{total} ({pct}%)",
    "game.tasks.tipLabel": "Tip:",
    "game.tasks.tip": "Finish at least 3 quests to keep your Streak flame alive 🔥.",
    "game.tasks.pending": "⏳ {n} quest(s) awaiting parent approval ⭐",
    "game.tasks.nudge": "Remind parents 🕊️",
    "game.tasks.giftsTitle": "🎁 Gifts From Siblings",
    "game.tasks.gaveYou": "{emoji} {name} gave you {label}!",
    "game.tasks.thanks": "Seen it, thanks! 💜",
    "game.tasks.empty": "📭 No quests in this category!",

    // Toasts
    "game.toast.focusBonus": "Awesome! You focused long enough — bonus focus points! 🌳✨",
    "game.toast.photoSaved": "Photo saved on this device (only parents on this device can view it). 📸",
    "game.toast.photoError": "Couldn't read the photo, please try again! 📸",
    "game.toast.nudgeSent": "Reminder sent to your parents! The pigeon is on its way 🕊️",
    "game.toast.nudgeLimit": "You've reminded them twice today — parents will approve soon! 🌸",

    // Graduation
    "game.grad.instinct": "“{title}” has become a HERO INSTINCT!",
    "game.grad.desc": "You did this on your own for {days} days in a row — it's part of who you are now, no more reward points needed! A permanent badge lives in 🏠 My Corner.",
    "game.grad.cta": "AWESOME! 🙌",

    // Goal bar
    "game.goal.title": "🎯 Big goal",
    "game.goal.remain": "{n} 🪙 to go — let's go mining! ⛏️",

    // Family strip
    "game.family.title": "👨‍👩‍👧‍👦 Our Family",
    "game.family.me": "(me)",
    "game.family.switchConfirm": "Switch to player {name}?",
    "game.family.giftTitle": "What to gift {name}?",
    "game.family.giftFor": "Send a gift to {name}",

    // Task card
    "game.task.parentNote": "👨‍👩‍👧 parent-verified",
    "game.task.mandatory": "Required 🔴",
    "game.task.parentAssigned": "Parent-assigned 👑",
    "game.task.waiting": "⏳ Awaiting",
    "game.task.minutes": "🌳 {n}m",
    "game.task.focusDone": "DONE ✅",
    "game.task.focusStop": "Stop",
    "game.task.focusLabel": "Focus: {time}",
    "game.task.focusHintA": "🌳 Start focus to earn ",
    "game.task.focusHintBold": "bonus points",
    "game.task.focusHintB": " (optional)",
    "game.task.tickHint": "✓ Tick the box above when you're done",
    "game.task.startFocus": "🌳 Focus",
    "game.task.photoTitle": "Attach photo (optional, saved on device)",

    // Kanban lanes
    "game.lane.doing": "🌳 FOCUSING",
    "game.lane.today": "📋 TODAY",
    "game.lane.waiting": "⏳ AWAITING PARENT",
    "game.lane.done": "✅ DONE",

    // Filters
    "game.filter.all": "All",
    "game.filter.discipline": "⚡ Discipline",
    "game.filter.strength": "❤️ Strength",
    "game.filter.intellect": "🧠 Intellect",
    "game.filter.creative": "🎨 Creative",
    "game.filter.help": "🤝 Helpfulness",
    "game.filter.connection": "💞 Connection",

    // Letter modal
    "game.letter.title": "Letter From Your Parents 💌",
    "game.letter.to": "To our dear Warrior {name}",
    "game.letter.cta": "THANK YOU! ❤️",

    // Critical-hit modal
    "game.crit.title": "LUCKY POINTS! 🌟",
    "game.crit.sub": "{name} triggered a Power Strike 💥",
    "game.crit.reward": "Quest Reward",
    "game.crit.desc": "Points doubled and multiplied by your Streak! 🎉",
    "game.crit.cta": "AMAZING! 🚀",

    // Language switcher (parent System tab)
    "game.lang.title": "🌐 Language",
    "game.lang.desc": "Applies to every screen for both child and parent.",
    "game.lang.vi": "🇻🇳 Tiếng Việt",
    "game.lang.en": "🇬🇧 English",

    // Guide modal
    "game.guide.title": "Summer Warrior Handbook 📜",
    "game.guide.subtitle": "Tips to level up and earn the coolest rewards!",
    "game.guide.s1.title": "🎯 1. Do Your Daily Quests",
    "game.guide.s1.body": "Finish the quests your parents set to earn XP to level up, Points ⭐ and Hero Coins 🪙.",
    "game.guide.s2.title": "🔥 2. Keep Your Streak Alive",
    "game.guide.s2.body": "Finish at least 3 quests each day to keep your Streak flame 🔥. The higher the Streak, the more Points ⭐ your next quest gives!",
    "game.guide.s3.title": "⚡ 3. Lucky Points (Lucky Multiplier)",
    "game.guide.s3.body": "Every time you finish a quest, you have a 15% chance to trigger Lucky Points ⚡ that double the Points ⭐ you earn!",
    "game.guide.s4.title": "⛏️ 4. Mining & Rewards",
    "game.guide.s4.body": "• Good deeds fill your Energy ⚡.|• Break rocks in the Mining Cave ⛏️ to get Hero Coins 🪙.|• Spend Points ⭐ on TV/game time; spend Hero Coins 🪙 on big real-world rewards (ice cream, Lego)!",
    "game.guide.s5.title": "🐾 5. Hatch Eggs & Train Mounts",
    "game.guide.s5.body": "• Getting items: mine rocks, get gifts from parents, or spend Hero Coins 🪙 on Eggs, Potions & Food Combos in the Shop 🛒.|• Hatching: combine an Egg & a Potion to hatch a Fox, Cat, Wolf, or Dragon 🦊.|• Feed a pet to 100% bond and it evolves into a giant Mount 🦖, giving +10% Energy ⚡ on quests and +5% Power Strike chance 🔥 while mining!",
    "game.guide.s6.title": "🕊️ 6. Pigeon Encouragement Letters",
    "game.guide.s6.body": "• Every day your parents send loving notes from the Parent Room.|• Tap the pigeon 🕊️ in the corner to open their encouragement letter!",
    "game.guide.cta": "GOT IT, LET'S GO! 🚀",
  },
};
