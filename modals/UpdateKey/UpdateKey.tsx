import React from 'react';
import { Modal, ModalProps, Title } from '@mantine/core';
import UpdateKeyForm from '@/forms/UpdateKey';
import { KeyDTO, UpdateKeyDto } from '@/api/keyApi';
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
}) => (
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
      Key={Key || null}
    />
  </Modal>
);

export default UpdateKeyModal;
