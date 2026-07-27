import { describe, test, expect } from "vitest";
import { buildTodayScheduleText } from "@/lib/game/caregiverShare";

const mandatory = (id, title) => ({ id, title, completed: false, isMandatory: true });
const normal = (id, title) => ({ id, title, completed: false, isMandatory: false });

describe("buildTodayScheduleText — C2.4 luồng ông bà", () => {
  test("liệt kê việc chưa xong, việc cần-làm xếp trước và có nhãn", () => {
    const text = buildTodayScheduleText({
      charName: "Khoa",
      dateLabel: "28/07",
      tasks: [
        normal("t1", "Đọc sách 15 phút"),
        mandatory("t2", "Làm bài tập Toán"),
      ],
    });

    // tên + ngày ở tiêu đề
    expect(text).toContain("Khoa");
    expect(text).toContain("28/07");
    // việc cần-làm (mandatory) đứng trước việc thường
    expect(text.indexOf("Toán")).toBeLessThan(text.indexOf("Đọc sách"));
    // mandatory được đánh dấu để ông bà biết ưu tiên
    expect(text).toContain("cần làm");
  });

  test("bỏ qua việc đã xong và việc đang chờ duyệt", () => {
    const text = buildTodayScheduleText({
      charName: "Khoa",
      dateLabel: "28/07",
      tasks: [
        { id: "d1", title: "Việc đã xong", completed: true, isMandatory: false },
        { id: "d2", title: "Đang chờ duyệt", completed: true, approval: "pending", isMandatory: false },
        normal("d3", "Còn phải làm"),
      ],
    });

    expect(text).toContain("Còn phải làm");
    expect(text).not.toContain("Việc đã xong");
    expect(text).not.toContain("Đang chờ duyệt");
  });

  test("khi đã xong hết việc — câu thông báo tích cực, không danh sách rỗng", () => {
    const text = buildTodayScheduleText({
      charName: "Khoa",
      dateLabel: "28/07",
      tasks: [{ id: "d1", title: "Xong rồi", completed: true, isMandatory: false }],
    });

    expect(text).toContain("Khoa");
    expect(text.toLowerCase()).toContain("xong hết");
    expect(text).not.toContain("•");
  });

  test("có lời nhờ ông bà + trấn an trẻ tự tick (không cần cài app)", () => {
    const text = buildTodayScheduleText({
      charName: "Khoa",
      dateLabel: "28/07",
      tasks: [normal("t1", "Đọc sách")],
    });

    expect(text.toLowerCase()).toContain("ông");
    expect(text.toLowerCase()).toContain("tick");
  });

  test("giới hạn số dòng, việc dư gộp thành 'và N việc khác'", () => {
    const tasks = Array.from({ length: 12 }, (_, i) => normal(`t${i}`, `Việc ${i}`));
    const text = buildTodayScheduleText({ charName: "Khoa", dateLabel: "28/07", tasks });

    const bulletCount = (text.match(/•/g) || []).length;
    expect(bulletCount).toBeLessThanOrEqual(8);
    expect(text).toContain("việc khác");
  });

  test("mặc định tên là 'con' khi thiếu charName", () => {
    const text = buildTodayScheduleText({ tasks: [normal("t1", "Đọc sách")] });
    expect(text).toContain("con");
  });
});
