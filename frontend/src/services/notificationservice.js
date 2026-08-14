import api from "./api";

export const notificationService = {
  getNotifications: async () => {
    return await api.get("/customer/notifications");
  },

  markAsRead: async (notificationId) => {
    return await api.patch(`/customer/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return await api.patch("/customer/notifications/read-all");
  },
};

export default notificationService;
