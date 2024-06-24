import { RequestStatus } from '@/api/request-status.enum';
import { CreateTemplateDto, templateApi } from '@/api/templateApi';
import { AddTemplateForm } from '@/forms/AddTemplate';
import { Button, Group, Modal, ModalProps, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';

interface AddTemplateModalProps extends ModalProps {
  addTemplateHandler: (values: CreateTemplateDto) => void;
  addTemplateRequestatus: RequestStatus;
}

const AddTemplate: React.FC<AddTemplateModalProps> = ({
  onClose,
  addTemplateHandler,
  addTemplateRequestatus,
  ...modalProps
}) => {
  return (
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
};

export default AddTemplate;
