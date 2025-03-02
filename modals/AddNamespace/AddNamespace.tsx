import { Modal, ModalProps, Title } from '@mantine/core';
import React from 'react';
import { CreateNamespaceDto } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import AddNamespaceForm from '@/forms/AddNamespace';

interface AddNamespaceModalProps extends ModalProps {
  addNamespaceHandler: (values: CreateNamespaceDto) => void;
  addNamespaceRequestatus: RequestStatus;
}

const AddNamespace: React.FC<AddNamespaceModalProps> = ({
  onClose,
  addNamespaceHandler,
  addNamespaceRequestatus,
  ...modalProps
}) => (
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
      onSubmit={addNamespaceHandler}
      requestStatus={addNamespaceRequestatus}
    />
  </Modal>
);

export default AddNamespace;
