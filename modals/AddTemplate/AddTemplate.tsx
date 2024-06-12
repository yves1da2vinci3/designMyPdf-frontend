import { RequestStatus } from '@/api/request-status.enum';
import { CreateTemplateDto, templateApi } from '@/api/templateApi';
import { AddTemplateForm } from '@/forms/AddTemplate';
import { Button, Group, Modal, ModalProps, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';

interface AddTemplateModalProps extends ModalProps {}

const AddTemplate: React.FC<AddTemplateModalProps> = ({ onClose, ...modalProps }) => {
  const router = useRouter()
  const addTemplateHandler = (values: CreateTemplateDto) => {
    templateApi.createTemplate(values);
    router.push('/dashboard/templates/create')

  };
  const [addTemplateRequestatus, setAddTemplateRequestatatus] = React.useState(
    RequestStatus.NotStated
  );
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
