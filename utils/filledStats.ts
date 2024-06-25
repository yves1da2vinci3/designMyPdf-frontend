const getFilledStats = (stats: any[], period: string) => {
  const filledStats = [];
  const now = new Date();
  let date;

  switch (period) {
    case 'week':
      for (let i = 0; i < 7; i++) {
        date = new Date(now);
        date.setDate(now.getDate() - i);
        const day = date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
        const stat = stats.find((stat: { date: string }) => stat.date === day) || {
          date: day,
          count: 0,
        };
        filledStats.unshift(stat);
      }
      break;
    case 'month':
      for (let i = 0; i < 30; i++) {
        date = new Date(now);
        date.setDate(now.getDate() - i);
        const day = date.toISOString().split('T')[0];
        const stat = stats.find((stat: { date: string }) => stat.date === day) || {
          date: day,
          count: 0,
        };
        filledStats.unshift(stat);
      }
      break;
    case '3months':
    case '6months':
    case '1year':
      const months = period === '3months' ? 3 : period === '6months' ? 6 : 12;
      for (let i = 0; i < months; i++) {
        date = new Date(now);
        date.setMonth(now.getMonth() - i);
        const month = date.toISOString().split('T')[0].slice(0, 7);
        const stat = stats.find((stat: { date: string }) => stat.date === month) || {
          date: month,
          count: 0,
        };
        filledStats.unshift(stat);
      }
      break;
    default:
      break;
  }

  return filledStats;
};

export default getFilledStats;
