using Bank_App.Data;
using Bank_App.Models;
using Bank_App.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bank_App.Repositories
{
    public class UserAccountRepository: IUserAccountRepository
    {
        private readonly BankContext _context;

        public UserAccountRepository(BankContext context)
        {
            _context = context;
        }
        
        public async Task<UserAccount?> GetUserAccountByIdAsync(int userAccountId)
        {
            return await _context.UserAccounts.Include(ua => ua.User)
                                              .FirstOrDefaultAsync(ua => ua.UserAccountId == userAccountId);
        }

        public async Task<List<UserAccount>> GetAllAccountsByUserIdAsync(int userId)
        {
            return await _context.UserAccounts.Where(ua => ua.UserId == userId)
                                              .Include(ua => ua.User)
                                              .ToListAsync();
        }
        public async Task<UserAccount> CreateUserAccountAsync(UserAccount account)
        {
            _context.UserAccounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }
        public async Task UpdateUserAccountAsync(UserAccount account)
        {
            _context.UserAccounts.Update(account);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAccountAsync(int userAccountId)
        {
            var account = await _context.UserAccounts.FindAsync(userAccountId);
            if (account != null)
            {
                _context.UserAccounts.Remove(account);
                await _context.SaveChangesAsync();
            }
        }

    }
}