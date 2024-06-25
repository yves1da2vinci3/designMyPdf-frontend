import { CreateKeyDto, keyApi } from '@/api/keyApi';
import { RequestStatus } from '@/api/request-status.enum';
import { AddKeyForm } from '@/forms/AddKey';
import { Modal, ModalProps, Title } from '@mantine/core';
import React from 'react';

interface AddKeyModalProps extends ModalProps {
  addKeyHandler: (values: CreateKeyDto) => void;
  addKeyRequestatus: RequestStatus;
}

const AddKeyModal: React.FC<AddKeyModalProps> = ({
  onClose,
  addKeyHandler,
  addKeyRequestatus,
  ...modalProps
}) => {
  return (
    <Modal
      centered
      onClose={onClose}
      {...modalProps}
      title={
        <Title order={3} my={4}>
          Create a new Key
        </Title>
      }
    >
      <AddKeyForm onClose={onClose} onSubmit={addKeyHandler} requestStatus={addKeyRequestatus} />
    </Modal>
  );
};

export default AddKeyModal;
