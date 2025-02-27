import { notifications } from '@mantine/notifications';

interface NotificationService {
  showSuccessNotification: (message: string) => void;
  showErrorNotification: (message: string) => void;
  showInformationNotification: (message: string) => void;
  showLoading: (message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const notificationService: NotificationService = {
  showSuccessNotification: (message: string) => {
    notifications.show({
      title: 'Operation successfully',
      message: message,
      color: 'green',
    });
  },
  showErrorNotification: function (message: string): void {
    notifications.show({
      title: 'An error occurred',
      message: message,
      color: 'red',
    });
  },
  showInformationNotification: function (message: string): void {
    notifications.show({
      title: 'Information',
      message: message,
      color: 'blue',
    });
  },
  showLoading: function (message: string): void {
    notifications.show({
      title: 'Loading',
      message: message,
      color: 'blue',
      loading: true,
      autoClose: false,
    });
  },
  showSuccess: function (message: string): void {
    notifications.show({
      title: 'Success',
      message: message,
      color: 'green',
    });
  },
  showError: function (message: string): void {
    notifications.show({
      title: 'Error',
      message: message,
      color: 'red',
    });
  },
};

export default notificationService;
