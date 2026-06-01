import type { ServerResponse } from 'http';
import type { AiStreamEvent } from './types';

export function initSseResponse(res: ServerResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
}

export function writeSseEvent(res: ServerResponse, event: AiStreamEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function endSse(res: ServerResponse): void {
  res.end();
}
