const BANGKOK_TIME_OFFSET_MS = 7 * 60 * 60 * 1000;

function validDateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > daysInMonth) {
    return null;
  }
  return { year, month, day };
}

function bangkokMidnightUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day) - BANGKOK_TIME_OFFSET_MS);
}

export function parseTransactionDateRange(startValue: string, endValue: string) {
  const startParts = validDateParts(startValue);
  const endParts = validDateParts(endValue);
  if (!startParts || !endParts) return null;

  const start = bangkokMidnightUtc(
    startParts.year,
    startParts.month,
    startParts.day,
  );
  const endStart = bangkokMidnightUtc(
    endParts.year,
    endParts.month,
    endParts.day,
  );
  if (start > endStart) return null;

  return {
    start,
    endExclusive: new Date(endStart.getTime() + 24 * 60 * 60 * 1000),
  };
}

export function parseTransactionMonth(monthValue: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthValue);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 2000 || month < 1 || month > 12) return null;

  const start = bangkokMidnightUtc(year, month, 1);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const endExclusive = bangkokMidnightUtc(nextYear, nextMonth, 1);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    start,
    endExclusive,
    startValue: `${monthValue}-01`,
    endValue: `${monthValue}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function currentBangkokMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}
