import { CreateNamespaceDto, namespaceApi } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import { AddNamespaceForm } from '@/forms/AddNamespace';
import {  Modal, ModalProps, Title } from '@mantine/core';
import React from 'react';

interface AddNamespaceModalProps extends ModalProps {}

const AddNamespace: React.FC<AddNamespaceModalProps> = ({ onClose, ...modalProps }) => {
  const addTemplateHandler = (values: CreateNamespaceDto) => {
    namespaceApi.createNamespace(values);
  };
  const [addNamespaceRequestatus, setAddNamespaceRequestatatus] = React.useState(
    RequestStatus.NotStated
  );
  return (
    <Modal
      centered
      onClose={onClose}
      {...modalProps}
      title={
        <Title order={3} my={4}>
          Create a new namespace
        </Title>
      }
    >
      <AddNamespaceForm
        onClose={onClose}
        onSubmit={addTemplateHandler}
        requestStatus={addNamespaceRequestatus}
      />
    </Modal>
  );
};

export default AddNamespace;
