using Bank_App.Models;
namespace Bank_App.Repositories.Interfaces
{
   public interface IUserAccountRepository
    {
        Task<UserAccount?> GetUserAccountByIdAsync(int userAccountId);
        Task<List<UserAccount>> GetAllAccountsByUserIdAsync(int userId);
        Task<UserAccount> CreateUserAccountAsync(UserAccount account);
        Task UpdateUserAccountAsync(UserAccount account);
        Task DeleteUserAccountAsync(int userAccountId);
    }
}