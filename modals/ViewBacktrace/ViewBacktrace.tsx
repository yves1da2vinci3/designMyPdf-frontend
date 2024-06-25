import { LogDTO } from '@/api/logApi';
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  ModalProps,
  Stack,
  Text,
  Title,
  rem,
} from '@mantine/core';
import { Editor } from '@monaco-editor/react';
import { HttpStatusCode } from 'axios';
import React from 'react';

interface ViewBacktraceModalProps extends ModalProps {
  Log: LogDTO;
}

const ViewBacktrace: React.FC<ViewBacktraceModalProps> = ({ onClose, Log, ...modalProps }) => {
  return (
    <Modal
      centered
      onClose={onClose}
      size="lg"
      {...modalProps}
      title={
        <Title order={3} my={4}>
          Backtrace
        </Title>
      }
    >
      <Stack h={rem(500)}>
        <Group>
          {Log.status_code === HttpStatusCode.Ok ? (
            <Badge color="green">success</Badge>
          ) : (
            <Badge color="red">failed</Badge>
          )}
          <Text c="gray">ID: {Math.random()}</Text>
        </Group>
        {/* Request */}
        <Text fw="bold">Request</Text>
        <Box flex={1}>
          <Editor
            options={{ readOnly: true, lineNumbers: 'off', minimap: { enabled: false } }}
            theme="vs-dark"
            value={JSON.stringify(Log.request_body, null, 2)}
            height="100%"
            defaultLanguage="json"
          />
        </Box>
        {/* Response */}
        <Text fw="bold">Response</Text>
        <Box h={rem(80)}>
          <Editor
            options={{ readOnly: true, lineNumbers: 'off', minimap: { enabled: false } }}
            theme="vs-dark"
            value={JSON.stringify(Log.response_body, null, 2)}
            height="100%"
            defaultLanguage="json"
          />
        </Box>
        {/* Print generated document */}
        {Log.status_code === HttpStatusCode.Ok && (
          <Button
            onClick={() => window.open(Log.response_body.path, '_blank')}
            style={{ alignSelf: 'flex-end' }}
            size="xs"
            w={rem(200)}
          >
            Open generated document
          </Button>
        )}
      </Stack>
    </Modal>
  );
};

export default ViewBacktrace;
