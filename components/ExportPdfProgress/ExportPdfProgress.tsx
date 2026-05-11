import React from 'react';
import { Paper, Text, Button, Stack, rem, Loader, Box, Group } from '@mantine/core';
import {
  IconFileText,
  IconFileTypePdf,
  IconDownload,
  IconCircleCheck,
  IconAlertCircle,
} from '@tabler/icons-react';

export type ExportPdfProgressStep = 0 | 1 | 2 | 3;

export interface ExportPdfProgressProps {
  opened: boolean;
  /** 0 préparation HTML, 1 génération PDF serveur, 2 enregistrement navigateur, 3 terminé */
  activeStep: ExportPdfProgressStep;
  error: string | null;
  onDismiss: () => void;
}

const STEP_TITLES = [
  'Préparation du document',
  'Création du fichier PDF',
  'Enregistrement sur votre appareil',
] as const;

const IDLE_ICONS = [
  <IconFileText key="0" size={14} stroke={1.5} color="#868e96" />,
  <IconFileTypePdf key="1" size={14} stroke={1.5} color="#868e96" />,
  <IconDownload key="2" size={14} stroke={1.5} color="#868e96" />,
];

function stepStatus(
  index: 0 | 1 | 2,
  activeStep: ExportPdfProgressStep,
): 'pending' | 'loading' | 'done' {
  if (activeStep === 3) {
    return 'done';
  }
  if (index < activeStep) {
    return 'done';
  }
  if (index === activeStep) {
    return 'loading';
  }
  return 'pending';
}

function StepRow({
  index,
  activeStep,
  isLast,
}: {
  index: 0 | 1 | 2;
  activeStep: ExportPdfProgressStep;
  isLast: boolean;
}) {
  const status = stepStatus(index, activeStep);
  const bullet =
    status === 'loading' ? (
      <Loader size={18} color="blue" />
    ) : status === 'done' ? (
      <IconCircleCheck size={18} stroke={1.5} color="#12b886" />
    ) : (
      IDLE_ICONS[index]
    );

  return (
    <Group wrap="nowrap" align="stretch" gap={rem(10)} style={{ minHeight: rem(28) }}>
      <Stack gap={0} align="center" style={{ width: rem(28), flexShrink: 0 }}>
        <Box
          style={{
            width: rem(28),
            height: rem(28),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border:
              status === 'loading'
                ? '2px solid #228be6'
                : status === 'done'
                  ? '2px solid #12b886'
                  : '2px solid #dee2e6',
            backgroundColor: '#fff',
          }}
        >
          {bullet}
        </Box>
        {!isLast ? (
          <Box
            style={{
              width: 2,
              flex: 1,
              minHeight: rem(12),
              backgroundColor: status === 'done' ? '#74c0fc' : '#dee2e6',
            }}
          />
        ) : null}
      </Stack>
      <Text size="sm" fw={500} c="dark.6" style={{ paddingTop: rem(4), flex: 1 }}>
        {STEP_TITLES[index]}
      </Text>
    </Group>
  );
}

/**
 * Panneau vertical d’étapes export PDF (statuts explicites, sans Timeline Mantine).
 */
const ExportPdfProgress: React.FC<ExportPdfProgressProps> = ({
  opened,
  activeStep,
  error,
  onDismiss,
}) => {
  if (!opened) return null;

  return (
    <Paper
      shadow="md"
      p="md"
      radius="md"
      withBorder
      style={{
        position: 'absolute',
        bottom: rem(16),
        right: rem(16),
        zIndex: 200,
        maxWidth: rem(380),
        width: 'min(100%, 380px)',
        backgroundColor: '#fff',
        borderColor: '#e9ecef',
      }}
    >
      <Stack gap="sm">
        <Text size="sm" fw={600} c="dark.7">
          Export PDF
        </Text>

        {error ? (
          <Stack gap="xs">
            <Text size="xs" c="red.7" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <IconAlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              {error}
            </Text>
            <Button size="xs" variant="light" color="gray" onClick={onDismiss}>
              Fermer
            </Button>
          </Stack>
        ) : (
          <>
            <Stack gap={0}>
              <StepRow index={0} activeStep={activeStep} isLast={false} />
              <StepRow index={1} activeStep={activeStep} isLast={false} />
              <StepRow index={2} activeStep={activeStep} isLast />
            </Stack>
            {activeStep >= 3 ? (
              <Text size="xs" c="teal.7" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconCircleCheck size={16} />
                Votre fichier est prêt.
              </Text>
            ) : null}
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default ExportPdfProgress;
