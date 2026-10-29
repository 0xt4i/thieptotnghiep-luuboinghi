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
  const headers = parseCsvLine(lines[0]).map(header => header.toLowerCase());
  const required = ["name", "salutation", "group", "contact", "max_guests", "personal_note"];
  if (required.some(header => !headers.includes(header))) throw new Error("CSV phải có đủ cột: name, salutation, group, contact, max_guests, personal_note.");
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const get = (header: string) => values[headers.indexOf(header)] || "";
    const maxGuests = Number(get("max_guests"));
    if (!get("name") || !get("salutation") || !get("group") || !Number.isInteger(maxGuests) || maxGuests < 0 || maxGuests > 20) {
      throw new Error(`Dòng ${index + 2} không hợp lệ.`);
    }
    return { name: get("name"), salutation: get("salutation"), group: get("group"), contact: get("contact") || null, maxGuests, personalNote: get("personal_note") || null };
  });
}
