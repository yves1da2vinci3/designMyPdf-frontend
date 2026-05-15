import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Anchor, Box, Button, Group, Stack, Text, Textarea, rem } from '@mantine/core';
import { IconCut, IconTrash, IconArrowBackUp } from '@tabler/icons-react';
import type * as Monaco from 'monaco-editor';
import { insertAtCursor } from '@/utils/monacoInsertAtCursor';
import notificationService from '@/services/NotificationService';

export type ClipPoint = { x: number; y: number };

/** Rectangle plein cadre en % (sens horaire). */
export const DEFAULT_CLIP_RECT_POINTS: ClipPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

function clampPct(n: number): number {
  return Math.min(100, Math.max(0, n));
}

export function clipPointsToPolygonDeclaration(points: ClipPoint[]): string {
  if (points.length < 3) return '';
  const inner = points
    .map((p) => `${clampPct(p.x).toFixed(2)}% ${clampPct(p.y).toFixed(2)}%`)
    .join(', ');
  return `clip-path: polygon(${inner});`;
}

export function clipPointsToPolygonValue(points: ClipPoint[]): string {
  if (points.length < 3) return '';
  const inner = points
    .map((p) => `${clampPct(p.x).toFixed(2)}% ${clampPct(p.y).toFixed(2)}%`)
    .join(', ');
  return `polygon(${inner})`;
}

export interface ClipPathDesignerProps {
  editorRef: React.RefObject<Monaco.editor.IStandaloneCodeEditor | null>;
}

const ClipPathDesigner: React.FC<ClipPathDesignerProps> = ({ editorRef }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<ClipPoint[]>(() => [...DEFAULT_CLIP_RECT_POINTS]);

  const declaration = useMemo(() => clipPointsToPolygonDeclaration(points), [points]);
  const clipValue = useMemo(() => clipPointsToPolygonValue(points), [points]);
  const canInsert = points.length >= 3 && declaration.length > 0;

  const clientToPct = useCallback((clientX: number, clientY: number): ClipPoint | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;
    return {
      x: clampPct(((clientX - rect.left) / rect.width) * 100),
      y: clampPct(((clientY - rect.top) / rect.height) * 100),
    };
  }, []);

  const startVertexDrag = (vertexIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const idx = vertexIndex;
    const onMove = (ev: MouseEvent) => {
      const next = clientToPct(ev.clientX, ev.clientY);
      if (!next) return;
      setPoints((prev) => {
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  };

  const onBoardMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const pct = clientToPct(e.clientX, e.clientY);
    if (!pct) return;
    setPoints((prev) => [...prev, pct]);
  };

  const onVertexDoubleClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setPoints((prev) => {
      if (prev.length <= 3) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const popLast = () => {
    setPoints((prev) => (prev.length > 3 ? prev.slice(0, -1) : prev));
  };

  const resetRect = () => setPoints([...DEFAULT_CLIP_RECT_POINTS]);

  const handleInsert = () => {
    const editor = editorRef.current;
    if (!editor) {
      notificationService.showErrorNotification('Éditeur non prêt — réessayez dans une seconde.');
      return;
    }
    if (!canInsert) {
      notificationService.showErrorNotification(
        'Au moins 3 points sont nécessaires pour un polygone.',
      );
      return;
    }
    const ok = insertAtCursor(editor, declaration, 'clip-path-insert');
    if (!ok) {
      notificationService.showErrorNotification(
        'Impossible d’insérer : curseur ou modèle indisponible.',
      );
    }
  };

  const onDragStartSnippet = (e: React.DragEvent) => {
    if (!canInsert) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', declaration);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Stack id="clip-path-section" gap="sm">
      <Box p="xs">
        <Group gap="xs" mb="xs">
          <IconCut size={18} style={{ color: '#38bdf8' }} />
          <Text size="sm" fw={600} c="white" tt="uppercase">
            clip-path
          </Text>
        </Group>
        <Text size="xs" c="dimmed" mb="sm">
          Polygone en % (comme{' '}
          <Anchor
            href="https://bennettfeely.com/clippy/"
            target="_blank"
            rel="noopener noreferrer"
            size="xs"
            c="dimmed"
          >
            Clippy
          </Anchor>
          ). Clic = ajouter un sommet, glisser un point = déplacer, double-clic sur un point = le
          retirer (min. 3 points).
        </Text>

        <Box
          ref={boardRef}
          onMouseDown={onBoardMouseDown}
          style={{
            position: 'relative',
            height: rem(180),
            width: '100%',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid #373A40',
            cursor: 'crosshair',
            userSelect: 'none',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #1e3a5f 0%, #312e81 40%, #4c1d95 100%)',
              clipPath: clipValue || undefined,
            }}
          />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <polygon
              fill="none"
              stroke="rgba(56, 189, 248, 0.95)"
              strokeWidth={0.35}
              vectorEffect="non-scaling-stroke"
              points={points.map((p) => `${clampPct(p.x)},${clampPct(p.y)}`).join(' ')}
            />
            {points.map((p, i) => (
              <circle
                key={`vertex-${i}`}
                cx={clampPct(p.x)}
                cy={clampPct(p.y)}
                r={1.8}
                fill="#fff"
                stroke="#38bdf8"
                strokeWidth={0.35}
                vectorEffect="non-scaling-stroke"
                style={{ pointerEvents: 'auto', cursor: 'grab' }}
                onMouseDown={(ev) => startVertexDrag(i, ev)}
                onDoubleClick={(ev) => onVertexDoubleClick(ev, i)}
              />
            ))}
          </svg>
        </Box>

        <Textarea
          label="CSS généré"
          size="xs"
          mt="sm"
          readOnly
          value={declaration || '— (ajoutez des points)'}
          autosize
          minRows={2}
          styles={{ input: { fontFamily: 'monospace', fontSize: 11 } }}
        />

        <Group gap="xs" mt="sm" wrap="wrap">
          <Button size="xs" variant="light" disabled={!canInsert} onClick={handleInsert}>
            Insérer au curseur
          </Button>
          <Button
            size="xs"
            variant="default"
            disabled={!canInsert}
            draggable
            onDragStart={onDragStartSnippet}
            style={{ cursor: canInsert ? 'grab' : 'not-allowed' }}
          >
            Glisser vers Monaco
          </Button>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>
          Relâchez le bouton « Glisser » directement dans la zone de code pour coller la
          déclaration.
        </Text>

        <Group gap="xs" mt="sm">
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowBackUp size={14} />}
            onClick={popLast}
          >
            Retirer dernier point
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<IconTrash size={14} />}
            onClick={resetRect}
          >
            Réinitialiser
          </Button>
        </Group>
      </Box>
    </Stack>
  );
};

export default ClipPathDesigner;
