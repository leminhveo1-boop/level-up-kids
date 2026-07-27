/**
 * Demo mode — a pre-built, appealing game state so prospects see the product
 * at its best (leveled hero, pets, coins, history). Never persisted.
 */

import { createInitialState } from "./constants";
import { generateTimetableTasks } from "./timetable";

/** TKB demo: lịch lớp mẫu để khách xem tính năng Thời khóa biểu tự sinh nhiệm vụ. */
const DEMO_TIMETABLE = {
  version: 1,
  enabled: true,
  subjects: {
    toan: { id: "toan", name: "Toán", hasHomework: true, needsPrep: true },
    van: { id: "van", name: "Tiếng Việt", hasHomework: true, needsPrep: false },
    anh: { id: "anh", name: "Tiếng Anh", hasHomework: true, needsPrep: true },
    the: { id: "the", name: "Thể dục", hasHomework: false, needsPrep: false },
    khtn: { id: "khtn", name: "Khoa học", hasHomework: false, needsPrep: true },
  },
  week: {
    mon: ["toan", "van", "the"],
    tue: ["anh", "khtn"],
    wed: ["toan", "van"],
    thu: ["anh", "the"],
    fri: ["toan", "khtn"],
    sat: [],
    sun: [],
  },
};

export const DEMO_CHILD_ID = "__demo__";

export const DEMO_CHILD = {
  id: DEMO_CHILD_ID,
  name: "Bé Demo",
  char_class: "Warrior",
  ui_mode: "kid",
};

/** @returns {object} full game state showcasing the product */
export function createDemoState() {
  const base = createInitialState({ name: DEMO_CHILD.name, charClass: "Warrior" });
  const now = Date.now();

  const demoPetMount = {
    id: "pet_demo_mount",
    name: "Hỏa Long Vương",
    type: "Dragon",
    element: "fire",
    emoji: "🐉",
    feedProgress: 100,
    isMount: true,
    eggType: "dragon",
    potionType: "fire",
  };
  const demoPet = {
    id: "pet_demo_fox",
    name: "Cáo Lửa Đỏ",
    type: "Fox",
    element: "fire",
    emoji: "🦊",
    feedProgress: 45,
    isMount: false,
    eggType: "base",
    potionType: "fire",
  };

  // 13 closed days with an upward trend so the D8 "vs last week 📈" headline
  // and share-card brag line light up in demo (best-foot-forward)
  const dayMs = 24 * 60 * 60 * 1000;
  const history = Array.from({ length: 13 }, (_, i) => ({
    date: new Date(now - (13 - i) * dayMs).toLocaleDateString("vi-VN"),
    completed: i < 7 ? 3 : 4,
    total: 11,
    mandatoryDone: 4,
    mandatoryTotal: 4,
    screenMinutes: 25,
    trustScore: 80 + i,
    streak: i,
    // C2.2: tín hiệu North Star để phòng phụ huynh khoe insight điểm-mạnh đầy đủ
    // (demo best-foot-forward, không persist). Tuần gần đây con tự giác + tự lập kế hoạch.
    remindersNeeded: 0,
    importantDone: 4,
    importantTotal: 4,
    plannedLastNight: i >= 6,
    reviewed: i >= 6,
    reviewMood: i >= 6 ? "good" : null,
  }));

  // Kế hoạch ngày mai (yyyy-mm-dd) để card "Ngày mai đã sẵn sàng" hiện ở tab Duyệt.
  const pad = (n) => String(n).padStart(2, "0");
  const tmr = new Date(now + dayMs);
  const tomorrowKey = `${tmr.getFullYear()}-${pad(tmr.getMonth() + 1)}-${pad(tmr.getDate())}`;
  const demoTomorrowPlan = {
    targetDate: tomorrowKey,
    items: [
      { taskId: "d_read", title: "Đọc sách 15 phút", isMandatory: false },
      { taskId: "d_room", title: "Dọn bàn học", isMandatory: false },
      { taskId: "d_exercise", title: "Tập thể dục buổi sáng", isMandatory: false },
      { taskId: "d_math", title: "Làm bài tập Toán", isMandatory: true },
    ],
    focusTaskId: "d_math",
    firstStep: "Mở sách trang đang đọc dở",
    anchor: "Sau bữa tối",
    createdAt: now,
  };

  return {
    ...base,
    level: 5,
    exp: 320,
    streak: 6,
    energy: 72,
    heroCoins: 180,
    points: 96,
    trustScore: 88, // Uy Tín cao → demo khoe luôn auto-duyệt thông minh
    treeGrowth: 175, // D5: demo tree già dặn (giai đoạn "Cây Nhỏ") để khoe sứ mệnh chung
    history,
    tomorrowPlan: demoTomorrowPlan,
    stats: { strength: 24, intellect: 19, discipline: 22, creative: 15, help: 18 },
    bossHp: 34,
    // 🛤️ B-lite: mid-journey week 2 so the JourneyCard + parent tip show live
    journey: {
      id: "reading_79",
      title: "Mê đọc sách 15 phút",
      icon: "📚",
      startedAt: now - 10 * dayMs,
      seed: "demo",
      stage: 1,
      dayInStage: 3,
      successDays: 8,
      totalDays: 10,
      stageSuccessDays: 2,
    },
    journeysCompleted: [
      {
        id: "school_bag_79",
        title: "Tự soạn cặp sách",
        icon: "🎒",
        completedAt: now - 12 * dayMs,
        successDays: 17,
        totalDays: 21,
        weeks: 3,
      },
    ],
    tasks: [
      ...base.tasks.map((t, i) =>
        // a few tasks already ticked so buffs light up
        ["t2", "t3"].includes(t.id) ? { ...t, completed: true, earnedPoints: t.points, earnedEnergy: t.energy } : t
      ),
      {
        id: "j_reading_79_s1_0_demo",
        title: "📚 Tự đọc sách 10 phút",
        exp: 18,
        points: 18,
        energy: 12,
        category: "intellect",
        completed: false,
        statKey: "intellect",
        statVal: 2,
        custom: true,
        isMandatory: false,
        verifyType: "focus",
        durationMin: 10,
        journeyId: "reading_79",
        journeyStage: 1,
      },
      // 📅 nhiệm vụ học tự sinh từ Thời khóa biểu (hôm nay + soạn cho mai)
      ...generateTimetableTasks(DEMO_TIMETABLE, new Date()),
    ],
    timetable: DEMO_TIMETABLE,
    inventory: {
      eggs: { base: 1, dragon: 0, wolf: 1 },
      potions: { fire: 1, ice: 2, magic: 0 },
      foods: { meat: 4, candy: 2, leaf: 3 },
    },
    pets: [demoPetMount, demoPet],
    activeMount: demoPetMount.id,
    activePet: null,
    miningHistory: [
      { id: "mh1", title: "🌟 RƯƠNG BÁU THẦN THOẠI 🌟", coins: 12, rarity: "legendary", rarityText: "Huyền Thoại ⚡", isCritical: true, timestamp: now - 60_000 },
      { id: "mh2", title: "👑 Hũ Xu Vàng Khổng Lồ 👑", coins: 6, rarity: "epic", rarityText: "Sử Thi 👑", isCritical: false, timestamp: now - 180_000 },
      { id: "mh3", title: "🥚 Nhận 1 Trứng hiếm: 🐺 Trứng Sói", coins: 0, rarity: "legendary", rarityText: "Trứng Thú Cưng 🥚", isCritical: false, isMaterial: true, timestamp: now - 400_000 },
      { id: "mh4", title: "🔷 Quặng Bạc Lấp Lánh 🔷", coins: 3, rarity: "rare", rarityText: "Hiếm 🔷", isCritical: false, timestamp: now - 700_000 },
    ],
    encouragements: [
      { id: "demo_msg", text: "Bố mẹ rất tự hào về con! Cố lên nhé chiến binh nhỏ! 💪❤️", read: false },
    ],
    lastResetDate: new Date().toLocaleDateString("vi-VN"),
  };
}
