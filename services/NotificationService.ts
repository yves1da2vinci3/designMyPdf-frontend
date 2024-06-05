import { notifications } from "@mantine/notifications";

interface NotificationService {
  showSuccessNotification: (message: string) => void;
  showErrorNotification: (message: string) => void;
  showInformationNotification: (message: string) => void;
}

const notificationService: NotificationService = {
  showSuccessNotification: (message: string) => {
    notifications.show({
      title: "Operation successfully",
      message: message,
      color: "green",
    });
  },
  showErrorNotification: function (message: string): void {
    notifications.show({
      title: "An error occurred",
      message: message,
      color: "red",
    });
  },
  showInformationNotification: function (message: string): void {
    notifications.show({
      title: "Information",
      message: message,
      color: "blue",
    });
  },
};

export default notificationService;
