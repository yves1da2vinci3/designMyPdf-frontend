/**
 * Shared PDF pagination: orphan/widow hints + page boundary calculation.
 * Used by preview iframe, export Puppeteer, and applyPdfPageBreakHints.
 */

/** Orphan/widow zone < 20% of content area height → break-before. */
export const ORPHAN_THRESHOLD = 0.2;

export function collectPdfBlocks(container: HTMLElement): HTMLElement[] {
  const direct = Array.from(container.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement,
  );

  if (direct.length === 1) {
    const nested = Array.from(direct[0].children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    if (nested.length > 0) return nested;
  }

  if (direct.length > 0) return direct;

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'section, article, table, [data-pdf-block], .pdf-keep-together',
    ),
  );
}

function shouldAvoidBreakInside(block: HTMLElement, contentAreaHeight: number): boolean {
  if (block.tagName !== 'TABLE' && !block.querySelector('canvas[data-chart-type]')) {
    return false;
  }
  const h = block.getBoundingClientRect().height;
  return h > 0 && h <= contentAreaHeight;
}

/**
 * Applies .pdf-page-break-before and .pdf-avoid-break-inside on measured layout.
 */
export function applyPageBreakHintsToContainer(
  container: HTMLElement,
  contentAreaHeight: number,
  orphanThresholdRatio: number = ORPHAN_THRESHOLD,
): void {
  const blocks = collectPdfBlocks(container);
  const threshold = orphanThresholdRatio * contentAreaHeight;
  const containerTop = container.getBoundingClientRect().top;

  for (const block of blocks) {
    block.classList.remove('pdf-page-break-before', 'pdf-avoid-break-inside');
    if (shouldAvoidBreakInside(block, contentAreaHeight)) {
      block.classList.add('pdf-avoid-break-inside');
    }
  }

  let lastBreakPage = -1;
  for (const block of blocks) {
    const rect = block.getBoundingClientRect();
    if (rect.height <= 0) continue;

    const blockTop = rect.top - containerTop;
    const pageNum = Math.floor(blockTop / contentAreaHeight);
    const posOnPage = blockTop % contentAreaHeight;
    const remaining = contentAreaHeight - posOnPage;

    let needsBreak = false;

    if (
      remaining > 0 &&
      remaining < contentAreaHeight &&
      remaining < threshold &&
      pageNum !== lastBreakPage
    ) {
      needsBreak = true;
    }

    if (!needsBreak && rect.height <= contentAreaHeight) {
      const blockEnd = blockTop + rect.height;
      const pageEnd = (pageNum + 1) * contentAreaHeight;
      if (blockEnd > pageEnd) {
        const overflowTail = blockEnd - pageEnd;
        if (overflowTail > 0 && overflowTail < threshold && pageNum !== lastBreakPage) {
          needsBreak = true;
        }
      }
    }

    if (needsBreak) {
      block.classList.add('pdf-page-break-before');
      lastBreakPage = pageNum;
    }
  }
}

/**
 * Y offsets (px from container top) where each page ends — matches PDF pagination with hints.
 */
export function computePdfPageBoundaries(
  container: HTMLElement,
  contentAreaHeight: number,
): number[] {
  if (contentAreaHeight <= 0) return [];

  const containerTop = container.getBoundingClientRect().top;
  const scrollHeight = container.scrollHeight;

  const forcedBreaks: number[] = [];
  container.querySelectorAll('.pdf-page-break-before').forEach((el) => {
    if (el instanceof HTMLElement) {
      const top = el.getBoundingClientRect().top - containerTop;
      if (top > 0) forcedBreaks.push(top);
    }
  });
  forcedBreaks.sort((a, b) => a - b);

  const boundaries: number[] = [];
  let segmentStart = 0;
  const segmentEnds = [...forcedBreaks, scrollHeight];

  for (const segmentEnd of segmentEnds) {
    let y = segmentStart;
    while (y + contentAreaHeight < segmentEnd - 0.5) {
      y += contentAreaHeight;
      boundaries.push(y);
    }
    segmentStart = segmentEnd;
  }

  return boundaries;
}

/** Self-contained for Puppeteer page.evaluate (no closure over module scope). */
export function pageBreakHintsEvaluate(params: {
  cah: number;
  threshold: number;
  resetExisting: boolean;
}): void {
  const { cah, threshold, resetExisting } = params;

  function collectBlocks(container: Element): Element[] {
    const direct = Array.from(container.children);
    if (direct.length === 1) {
      const nested = Array.from(direct[0].children);
      if (nested.length > 0) return nested;
    }
    return direct.length > 0
      ? direct
      : Array.from(
          container.querySelectorAll(
            'section,article,table,[data-pdf-block],.pdf-keep-together',
          ),
        );
  }

  function shouldAvoid(el: HTMLElement): boolean {
    if (el.tagName !== 'TABLE' && !el.querySelector('canvas[data-chart-type]')) {
      return false;
    }
    const h = el.getBoundingClientRect().height;
    return h > 0 && h <= cah;
  }

  const container = document.querySelector('.content');
  if (!container) return;

  if (resetExisting) {
    container.querySelectorAll('.pdf-page-break-before').forEach((el) => {
      const h = el as HTMLElement;
      h.style.removeProperty('break-before');
      h.style.removeProperty('page-break-before');
      h.classList.remove('pdf-page-break-before');
    });
    container.querySelectorAll('.pdf-avoid-break-inside').forEach((el) => {
      el.classList.remove('pdf-avoid-break-inside');
    });
  }

  const blocks = collectBlocks(container);
  const containerTop = container.getBoundingClientRect().top;
  let lastBreakPage = -1;

  for (const block of blocks) {
    const el = block as HTMLElement;
    el.classList.remove('pdf-avoid-break-inside');
    if (shouldAvoid(el)) {
      el.classList.add('pdf-avoid-break-inside');
    }
  }

  for (const block of blocks) {
    const el = block as HTMLElement;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) continue;

    const blockTop = rect.top - containerTop;
    const pageNum = Math.floor(blockTop / cah);
    const posOnPage = blockTop % cah;
    const remaining = cah - posOnPage;

    let needsBreak = false;

    if (
      remaining > 0 &&
      remaining < cah &&
      remaining < threshold &&
      pageNum !== lastBreakPage
    ) {
      needsBreak = true;
    }

    if (!needsBreak && rect.height <= cah) {
      const blockEnd = blockTop + rect.height;
      const pageEnd = (pageNum + 1) * cah;
      if (blockEnd > pageEnd) {
        const overflowTail = blockEnd - pageEnd;
        if (overflowTail > 0 && overflowTail < threshold && pageNum !== lastBreakPage) {
          needsBreak = true;
        }
      }
    }

    if (needsBreak) {
      el.classList.add('pdf-page-break-before');
      el.style.breakBefore = 'page';
      el.style.pageBreakBefore = 'always';
      lastBreakPage = pageNum;
    }
  }
}

/** Self-contained for preview iframe page delimiter script. */
export function computePageBoundariesEvaluate(contentAreaHeight: number): {
  boundaries: number[];
  pageCount: number;
} {
  const container = document.querySelector('.content');
  if (!container || contentAreaHeight <= 0) {
    return { boundaries: [], pageCount: 1 };
  }

  const containerTop = container.getBoundingClientRect().top;
  const scrollHeight = container.scrollHeight;

  const forcedBreaks: number[] = [];
  container.querySelectorAll('.pdf-page-break-before').forEach((el) => {
    const top = (el as HTMLElement).getBoundingClientRect().top - containerTop;
    if (top > 0) forcedBreaks.push(top);
  });
  forcedBreaks.sort((a, b) => a - b);

  const boundaries: number[] = [];
  let segmentStart = 0;
  const segmentEnds = [...forcedBreaks, scrollHeight];

  for (const segmentEnd of segmentEnds) {
    let y = segmentStart;
    while (y + contentAreaHeight < segmentEnd - 0.5) {
      y += contentAreaHeight;
      boundaries.push(y);
    }
    segmentStart = segmentEnd;
  }

  return { boundaries, pageCount: boundaries.length + 1 };
}
