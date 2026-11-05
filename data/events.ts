import type { PALETTES } from "@/components/ColorFlow";

// Upcoming events on /events and /events/[slug]. Dates are DD.MM. capacity is the number of guests the
// sign-up accepts (counted in the "Регистрации" sheet); time and address go into the confirmation email
// and show as "уточняется" until filled in.
export type Event = {
  slug: string;
  date: string;
  title: string;
  city: string;
  capacity: number;
  time?: string;
  address?: string;
  palette: keyof typeof PALETTES;
};

export const events: Event[] = [
  {
    slug: "bar-x-krasnodar",
    date: "05.12, суббота",
    title: "Бар X",
    city: "Краснодар",
    time: "20:00",
    address: "уточняется",
    capacity: 80,
    palette: "hero",
  },
  {
    slug: "bar-spb",
    date: "20.12, пятница",
    title: "Ночной клуб",
    city: "Санкт-Петербург",
    time: "20:00",
    address: "уточняется",
    capacity: 80,
    palette: "contact",
  },
];

export const getEvent = (slug: string) => events.find((e) => e.slug === slug);

const seatsWord = (n: number) => {
  const d = n % 10,
    h = n % 100;
  return d === 1 && h !== 11
    ? "место"
    : d >= 2 && d <= 4 && (h < 12 || h > 14)
      ? "места"
      : "мест";
};

/** Seats still open, or null when the count is unknown (Sheets not configured or unreachable). */
export const seatsLeft = (e: Event, taken: Record<string, number> | null) =>
  taken ? Math.max(0, e.capacity - (taken[e.slug] ?? 0)) : null;

/** Card / page status: sold out, "only N left" once few remain, otherwise open. */
export function seatsStatus(left: number | null) {
  if (left === 0) return "Мест нет";
  if (left !== null && left <= 15) return `Осталось ${left} ${seatsWord(left)}`;
  return "Запись открыта";
}
