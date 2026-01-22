using Bank_App.Data;
using Bank_App.Models;
using Bank_App.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bank_App.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly BankContext _context;
        
        public UserRepository(BankContext context)
        {
            _context = context;
        }

        // ✅ async/await ekledik
        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<User> AddUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user; // ✅ Eklenen user'ı döndür
        }

        // ✅ UPDATE ekledik
        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        // ✅ DELETE ekledik
        public async Task DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}