import { Box, Container } from '@mantine/core';
import { NextPage } from 'next';
import { WebhookManager } from '../../components/Webhook/WebhookManager';

const WebhookPage: NextPage = () => {
  return (
    <Container size="lg">
      <Box p={4}>
        <WebhookManager />
      </Box>
    </Container>
  );
};

export default WebhookPage;
