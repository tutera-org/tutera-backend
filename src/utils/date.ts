export const addDays = (date: Date, days: number): Date => {
  const result: Date = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const isExpired = (date: Date): boolean => {
  return date < new Date();
};

export const getSubscriptionEndDate = (
  subscriptionType: string,
  startDate: Date = new Date()
): Date => {
  switch (subscriptionType) {
    case 'monthly':
      return addMonths(startDate, 1);
    case 'quarterly':
      return addMonths(startDate, 3);
    case 'semi_annual':
      return addMonths(startDate, 6);
    case 'annual':
      return addMonths(startDate, 12);
    default:
      return addMonths(startDate, 1);
  }
};
