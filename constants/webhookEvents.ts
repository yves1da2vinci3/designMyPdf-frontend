export const EVENT_LABELS: Record<string, string> = {
  PdfJobQueued: 'job.created',
  PdfJobCompleted: 'job.completed',
  PdfJobFailed: 'job.failed',
};

export const EVENT_COLORS: Record<string, string> = {
  PdfJobQueued: 'blue',
  PdfJobCompleted: 'teal',
  PdfJobFailed: 'red',
};

export function eventLabel(name: string): string {
  return EVENT_LABELS[name] ?? name;
}

export function eventColor(name: string): string {
  return EVENT_COLORS[name] ?? 'gray';
}
