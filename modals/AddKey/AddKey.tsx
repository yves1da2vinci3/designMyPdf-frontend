import { CreateKeyDto, keyApi } from '@/api/keyApi';
import { RequestStatus } from '@/api/request-status.enum';
import { AddKeyForm } from '@/forms/AddKey';
import { Modal, ModalProps, Title } from '@mantine/core';
import React from 'react';

interface AddKeyModalProps extends ModalProps {}

const AddKeyModal: React.FC<AddKeyModalProps> = ({ onClose, ...modalProps }) => {
  const addKeyHandler = (values: CreateKeyDto) => {
    keyApi.createKey(values);
  };
  const [addKeyRequestatus, setAddKeyRequestatatus] = React.useState(RequestStatus.NotStated);
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
