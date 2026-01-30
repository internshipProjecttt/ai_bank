using Bank_App.Models;

namespace Bank_App.Repositories.Interfaces
{
    public interface INotificationRepository{
        Task AddNotificationAsync(int userId, string category);
        Task<List<Notification>> GetUserNotificationsAsync(int userId);
    }
}