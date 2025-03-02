import { Modal, ModalProps, Title } from '@mantine/core';
import React from 'react';
import { RequestStatus } from '@/api/request-status.enum';
import { CreateTemplateDto } from '@/api/templateApi';

import AddTemplateForm from '@/forms/AddTemplate';

interface AddTemplateModalProps extends ModalProps {
  addTemplateHandler: (values: CreateTemplateDto) => void;
  addTemplateRequestatus: RequestStatus;
}

const AddTemplate: React.FC<AddTemplateModalProps> = ({
  onClose,
  addTemplateHandler,
  addTemplateRequestatus,
  ...modalProps
}) => (
  <Modal
    centered
    onClose={onClose}
    {...modalProps}
    title={
      <Title order={3} my={4}>
        Create a new template
      </Title>
    }
  >
    <AddTemplateForm
      onClose={onClose}
      onSubmit={addTemplateHandler}
      requestStatus={addTemplateRequestatus}
    />
  </Modal>
);

export default AddTemplate;
