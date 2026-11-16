export function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

export function parseGuestsCsv(csv: string) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) throw new Error("CSV cần có dòng tiêu đề và ít nhất một khách.");
  const headers = parseCsvLine(lines[0]).map(header => header.toLowerCase().trim());
  const aliases: Record<string, string[]> = {
    name: ["name", "tên"],
    salutation: ["salutation", "xưng hô", "danh xưng"],
    group: ["group", "nhóm"],
    contact: ["contact", "liên hệ"],
    personal_note: ["personal_note", "lời nhắn"],
  };
  const column = (field: string) => aliases[field].map(alias => headers.indexOf(alias)).find(index => index >= 0) ?? -1;
  const required = ["name", "salutation", "group", "contact", "personal_note"];
  if (required.some(header => column(header) < 0)) throw new Error("CSV phải có các cột: name/tên, salutation/xưng hô, group/nhóm, contact/liên hệ, personal_note/lời nhắn.");
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const get = (field: string) => values[column(field)] || "";
    if (!get("name")) {
      throw new Error(`Dòng ${index + 2} không hợp lệ.`);
    }
    const group = get("group") || "Khác";
    if (!["Gia đình", "Bạn bè", "Khác"].includes(group)) {
      throw new Error(`Dòng ${index + 2} không hợp lệ: nhóm chỉ được là Gia đình, Bạn bè hoặc Khác.`);
    }
    return {
      name: get("name"),
      salutation: get("salutation") || "Chưa bổ sung",
      group: group as "Gia đình" | "Bạn bè" | "Khác",
      contact: get("contact") || null,
      personalNote: get("personal_note") || null,
    };
  });
}
