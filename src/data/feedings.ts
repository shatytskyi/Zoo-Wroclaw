export type Feeding = {
  id: string;
  placeId: string;
  hour: number;
  minute: number;
  days: number[] | "daily";
  weather?: boolean;
  suspended?: boolean;
  note?: { pl: string; ru: string; en: string };
};

/** 0 = Sunday … 6 = Saturday, Europe/Warsaw local time. */
export const FEEDINGS: Feeding[] = [
  {
    id: "okapi-1000",
    placeId: "okapi",
    hour: 10,
    minute: 0,
    days: "daily",
  },
  {
    id: "snow-1030",
    placeId: "snow-leopard",
    hour: 10,
    minute: 30,
    days: [2, 4],
  },
  {
    id: "pallas-1030",
    placeId: "pallas",
    hour: 10,
    minute: 30,
    days: [3],
  },
  {
    id: "camels-1100",
    placeId: "sahara",
    hour: 11,
    minute: 0,
    days: "daily",
  },
  {
    id: "hippo-1100",
    placeId: "hippos",
    hour: 11,
    minute: 0,
    days: "daily",
    note: {
      pl: "Pn–cz przy szybie (−1), pt–nd na wybiegu",
      ru: "Пн–чт у стекла (−1), пт–вс на выгуле",
      en: "Mon–Thu underwater glass, Fri–Sun upper yard",
    },
  },
  {
    id: "rhino-1100",
    placeId: "rhinos",
    hour: 11,
    minute: 0,
    days: [0, 6],
    note: { pl: "Terai", ru: "Тераи", en: "Terai yard" },
  },
  {
    id: "komodo-1100",
    placeId: "komodo",
    hour: 11,
    minute: 0,
    days: [3],
    note: {
      pl: "Pierwsza środa miesiąca, Terrarium",
      ru: "Первая среда месяца, террариум",
      en: "First Wednesday of the month",
    },
  },
  {
    id: "wild-dogs-1200",
    placeId: "wild-dogs",
    hour: 12,
    minute: 0,
    days: [2],
  },
  {
    id: "hornbill-1200",
    placeId: "hornbills",
    hour: 12,
    minute: 0,
    days: [3],
  },
  {
    id: "capybara-1200",
    placeId: "capybaras",
    hour: 12,
    minute: 0,
    days: "daily",
  },
  {
    id: "baboon-1200",
    placeId: "baboons",
    hour: 12,
    minute: 0,
    days: "daily",
    weather: true,
  },
  {
    id: "tortoise-1200",
    placeId: "tortoises",
    hour: 12,
    minute: 0,
    days: "daily",
  },
  {
    id: "fur-1200",
    placeId: "fur-seals",
    hour: 12,
    minute: 0,
    days: "daily",
  },
  {
    id: "kora-1200",
    placeId: "bears-brown",
    hour: 12,
    minute: 0,
    days: [5],
    note: { pl: "Niedźwiedzica Kora, kładka", ru: "Медведица Кора", en: "Bear Kora, bridge" },
  },
  {
    id: "manatee-1230",
    placeId: "manatees",
    hour: 12,
    minute: 30,
    days: "daily",
  },
  {
    id: "meerkat-1245",
    placeId: "meerkats",
    hour: 12,
    minute: 45,
    days: "daily",
  },
  {
    id: "seals-1300",
    placeId: "seals",
    hour: 13,
    minute: 0,
    days: "daily",
  },
  {
    id: "lemur-1300",
    placeId: "lemurs",
    hour: 13,
    minute: 0,
    days: "daily",
  },
  {
    id: "pelican-1300",
    placeId: "pelicans",
    hour: 13,
    minute: 0,
    days: "daily",
    note: {
      pl: "Sezonowo, staw przy altance",
      ru: "Сезонно, пруд у беседки",
      en: "Seasonal, pond by the gazebo",
    },
  },
  {
    id: "parrot-1300",
    placeId: "birds",
    hour: 13,
    minute: 0,
    days: [3],
    note: { pl: "Papugi, Ptaszarnia", ru: "Попугаи, птичник", en: "Parrots, bird house" },
  },
  {
    id: "otter-1315",
    placeId: "otters",
    hour: 13,
    minute: 15,
    days: "daily",
  },
  {
    id: "panda-1330",
    placeId: "red-panda",
    hour: 13,
    minute: 30,
    days: "daily",
  },
  {
    id: "hog-1330",
    placeId: "river-hog",
    hour: 13,
    minute: 30,
    days: "daily",
  },
  {
    id: "shark-1330",
    placeId: "sharks",
    hour: 13,
    minute: 30,
    days: [1, 3, 5],
  },
  {
    id: "giraffe-1400",
    placeId: "savannah",
    hour: 14,
    minute: 0,
    days: "daily",
    weather: true,
  },
  {
    id: "kora-1400",
    placeId: "bears-brown",
    hour: 14,
    minute: 0,
    days: [1],
    note: { pl: "Niedźwiedzica Kora, kładka", ru: "Медведица Кора", en: "Bear Kora, bridge" },
  },
  {
    id: "penguin-1400",
    placeId: "penguins",
    hour: 14,
    minute: 0,
    days: "daily",
  },
  {
    id: "pallas-1400",
    placeId: "pallas",
    hour: 14,
    minute: 0,
    days: [5],
  },
  {
    id: "reindeer-1400",
    placeId: "reindeer",
    hour: 14,
    minute: 0,
    days: "daily",
    suspended: true,
  },
  {
    id: "elephant-1430",
    placeId: "elephants",
    hour: 14,
    minute: 30,
    days: [0, 6],
    weather: true,
  },
  {
    id: "fur-1500",
    placeId: "fur-seals",
    hour: 15,
    minute: 0,
    days: "daily",
  },
  {
    id: "piranha-1500",
    placeId: "piranhas",
    hour: 15,
    minute: 0,
    days: [0],
  },
  {
    id: "rusty-1630",
    placeId: "rusty-cat",
    hour: 16,
    minute: 30,
    days: [4],
  },
];

export function feedingMinutes(f: Feeding): number {
  return f.hour * 60 + f.minute;
}

export function happensOn(f: Feeding, weekday: number, date?: Date): boolean {
  if (f.suspended) return false;
  if (f.id === "komodo-1100" && date && date.getDate() > 7) return false;
  if (f.days === "daily") return true;
  return f.days.includes(weekday);
}

export type FeedingEvent = Feeding & { at: Date };

export function warsawNow(from = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(from);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return new Date(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
}

function atDay(base: Date, addDays: number, hour: number, minute: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + addDays, hour, minute, 0);
}

export function todaysFeedings(now = warsawNow()): Feeding[] {
  const wd = now.getDay();
  return FEEDINGS.filter((f) => happensOn(f, wd, now)).sort(
    (a, b) => feedingMinutes(a) - feedingMinutes(b),
  );
}

export function upcomingFeedings(now = warsawNow(), limit = 8): FeedingEvent[] {
  const out: FeedingEvent[] = [];
  for (let d = 0; d < 8 && out.length < limit; d++) {
    const day = atDay(now, d, 0, 0);
    const wd = day.getDay();
    const list = FEEDINGS.filter((f) => happensOn(f, wd, day)).sort(
      (a, b) => feedingMinutes(a) - feedingMinutes(b),
    );
    for (const f of list) {
      const at = atDay(now, d, f.hour, f.minute);
      if (at.getTime() + 20 * 60 * 1000 < now.getTime()) continue;
      out.push({ ...f, at });
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function formatClock(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatCountdown(ms: number, lang: "pl" | "ru" | "en"): string {
  if (ms <= 0) {
    if (lang === "ru") return "сейчас";
    if (lang === "pl") return "trwa";
    return "now";
  }
  const min = Math.round(ms / 60000);
  if (min < 60) {
    if (lang === "ru") return `через ${min} мин`;
    if (lang === "pl") return `za ${min} min`;
    return `in ${min} min`;
  }
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (lang === "ru") return `через ${h} ч ${m} мин`;
  if (lang === "pl") return `za ${h} godz. ${m} min`;
  return `in ${h}h ${m}m`;
}

export function isZooOpen(now = warsawNow()): { open: boolean; closeH: number; ticketH: number } {
  const wd = now.getDay();
  const weekendish = wd === 0 || wd === 5 || wd === 6;
  const closeH = weekendish ? 19 : 18;
  const ticketH = weekendish ? 18 : 17;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return { open: minutes >= 9 * 60 && minutes < closeH * 60, closeH, ticketH };
}

export function japanGateOpen(now = warsawNow()): boolean {
  const m = now.getMonth() + 1;
  return m >= 4 && m <= 9;
}
