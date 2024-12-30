import { Question } from '@prisma/client';
import { startOfWeek, getWeek, isLastDayOfMonth, endOfMonth } from 'date-fns';

export function shouldShowQuestion(question: Question, date: Date): boolean {
  if (question.frequency === 'DAILY') return true;

  if (question.frequency === 'WEEKLY' && question.dayOfWeek !== null) {
    // Get the start of the week for the given date
    const weekNumber = getWeek(date, { weekStartsOn: 0 });

    // Check if this week matches the frequency interval
    console.log(weekNumber);
    const isMatchingWeek = weekNumber % (question.frequencyInterval || 1) === 0;
    console.log(isMatchingWeek);

    // Check if today is the configured day of the week
    const isMatchingDay = date.getDay() === question.dayOfWeek;

    return isMatchingWeek && isMatchingDay;
  }

  if (question.frequency === 'MONTHLY' && question.monthlyTrigger) {
    if (question.monthlyTrigger.match(/^\d+$/)) {
      // If monthlyTrigger is a number, check if it matches the day of month
      return date.getDate() === parseInt(question.monthlyTrigger);
    }

    // Handle relative patterns
    switch (question.monthlyTrigger) {
      case 'LAST_DAY':
        return isLastDayOfMonth(date);
      case 'FIRST_MONDAY':
      case 'FIRST_TUESDAY':
      case 'FIRST_WEDNESDAY':
      case 'FIRST_THURSDAY':
      case 'FIRST_FRIDAY':
      case 'FIRST_SATURDAY':
      case 'FIRST_SUNDAY': {
        const dayIndex = [
          'SUNDAY',
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ].indexOf(question.monthlyTrigger.split('_')[1]);
        return date.getDate() <= 7 && date.getDay() === dayIndex;
      }
      case 'LAST_MONDAY':
      case 'LAST_TUESDAY':
      case 'LAST_WEDNESDAY':
      case 'LAST_THURSDAY':
      case 'LAST_FRIDAY':
      case 'LAST_SATURDAY':
      case 'LAST_SUNDAY': {
        const dayIndex = [
          'SUNDAY',
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ].indexOf(question.monthlyTrigger.split('_')[1]);
        const lastDayOfMonth = endOfMonth(date);
        const daysUntilEnd = lastDayOfMonth.getDate() - date.getDate();
        return daysUntilEnd < 7 && date.getDay() === dayIndex;
      }
    }
  }

  return false;
}
