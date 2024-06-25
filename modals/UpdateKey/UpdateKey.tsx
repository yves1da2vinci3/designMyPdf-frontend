import React from 'react';
import { Modal, ModalProps, Title } from '@mantine/core';
import { UpdateKeyForm } from '@/forms/UpdateKey';
import { KeyDTO, UpdateKeyDto } from '@/api/keyApi'; // Ensure KeyDTO and UpdateKeyDto are imported
import { RequestStatus } from '@/api/request-status.enum';

interface UpdateKeyModalProps extends ModalProps {
  updateKeyHandler: (values: UpdateKeyDto) => void;
  updateKeyStatus: RequestStatus;
  Key?: KeyDTO;
}

const UpdateKeyModal: React.FC<UpdateKeyModalProps> = ({
  onClose,
  updateKeyHandler,
  updateKeyStatus,
  Key,
  ...modalProps
}) => {
  return (
    <Modal
      centered
      onClose={onClose}
      {...modalProps}
      title={
        <Title order={3} my={4}>
          Update a Key
        </Title>
      }
    >
      <UpdateKeyForm
        onClose={onClose}
        onSubmit={updateKeyHandler}
        requestStatus={updateKeyStatus}
        Key={Key}
      />
    </Modal>
  );
};

export default UpdateKeyModal;
