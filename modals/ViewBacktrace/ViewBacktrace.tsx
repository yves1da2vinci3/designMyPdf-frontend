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
import React from 'react';

const DEFAULT_REQUEST = `{
    "templateId": "665b016e8a2657e4e40e4012",
    "variables": {
      "fromCompany": {
        "name": "Transactional",
        "street": "PDF Street",
        "country": "France",
        "city": "Paris",
        "zip": "75000"
      },
      "toCompany": {
        "name": "Another Company",
        "street": "1 Kangaroo Street",
        "country": "Austria",
        "city": "Sidney",
        "zip": ""
      },
      "invoiceNumber": "#0001",
      "issueDate": "2024-01-01",
      "dueDate": "2024-01-01",
      "items": [
        {
          "name": "Servers",
          "quantity": 42,
          "taxes": "$0.00",
          "price": "$69.00"
        },
        {
          "name": "Installation Fees",
          "quantity": 1,
          "taxes": "$0.00",
          "price": "$0.00"
        }
      ],
      "prices": {
        "subtotal": "$69.00",
        "discount": "$0.00",
        "taxes": "$10.00",
        "total": "$69.00"
      },
      "showTerms": true
    }
  }`
interface ViewBacktraceModalProps extends ModalProps {
 
}

const ViewBacktrace: React.FC<ViewBacktraceModalProps> = ({
  onClose,
  ...modalProps
}) => {
  
  return (
    <Modal
      centered
      onClose={onClose}
      size={'lg'}
      {...modalProps}
      title={
        <Title order={3} my={4}>
          Bracktrace
        </Title>
      }
    >
      <Stack h={rem(500)}>
        <Group>
          <Badge bg={'green'}>success</Badge>
          <Text c={'gray'}>ID: 665b2bba3001999fea7a67ef</Text>
        </Group>
        {/* Request */}
        <Text fw={'bold'}>Request</Text>
        <Box flex={1}>
          <Editor
            options={{ readOnly: true, lineNumbers: 'off', minimap: { enabled: false } }}
            theme="vs-dark"
            value={DEFAULT_REQUEST}
            height="100%"
            defaultLanguage="json"
          />
        </Box>
        {/* Response */}
        <Text fw={'bold'}>Response</Text>
        <Box h={rem(80)}>
          <Editor
            options={{ readOnly: true, lineNumbers: 'off', minimap: { enabled: false } }}
            theme="vs-dark"
            value={`{
                "requestId": "665b2bba3001999fea7a67ef",
                "path": "https://d2t3dpwh2k1aak.cloudfront.net/documents/665b016e8a2657e4e40e4012/1717251002212-f1b59eb65c1d1f75ac28.pdf"
              }`}
            height="100%"
            defaultLanguage="json"
          />
        </Box>
        {/* print generated document */}
        <Button style={{ alignSelf: 'flex-end' }}  size="xs" w={rem(200)}>
          open generated document
        </Button>
      </Stack>
    </Modal>
  );
};

export default ViewBacktrace;
