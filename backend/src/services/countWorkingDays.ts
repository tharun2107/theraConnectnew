import { add, getDay, isBefore } from 'date-fns';

export function countWorkingDays(startDateStr: string) {
  const startDate = new Date(startDateStr);
  const endDate = add(startDate, { months: 1 });

  let count = 0;

  for (let d = new Date(startDate); isBefore(d, endDate); d.setDate(d.getDate() + 1)) {
    const day = getDay(d);
    if (day !== 0 && day !== 6) {
      count++;
    }
  }

  return {
    startDate: startDate,
    endDate: endDate,
    workingDays: count
  };
}