import type { LogDTO } from '@/api/logApi';

/** Cutoff dates aligned with dmd_backend/pkg/logs/repository.go GetLogStats */
export function getLogStatsPeriodCutoff(apiPeriod: string): Date {
  const d = new Date();
  switch (apiPeriod) {
    case 'day':
      d.setDate(d.getDate() - 1);
      break;
    case 'week':
      d.setDate(d.getDate() - 7);
      break;
    case 'month':
      d.setMonth(d.getMonth() - 1);
      break;
    case '3months':
      d.setMonth(d.getMonth() - 3);
      break;
    case '6months':
      d.setMonth(d.getMonth() - 6);
      break;
    case '1year':
      d.setFullYear(d.getFullYear() - 1);
      break;
    default:
      d.setDate(d.getDate() - 7);
  }
  return d;
}

export function filterLogsByApiPeriod(logs: LogDTO[], apiPeriod: string): LogDTO[] {
  const cutoff = getLogStatsPeriodCutoff(apiPeriod);
  return logs.filter((l) => {
    const t = new Date(l.called_at).getTime();
    return t >= cutoff.getTime();
  });
}
