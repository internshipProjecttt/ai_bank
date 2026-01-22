using System;
using System.Collections.Generic;
using System.Text;
using Bank_App.Data;
using Bank_App.Models;
using Bank_App.Repositories.Interface;

namespace Bank_App.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly BankContext _bankContext;
        public UserRepository(BankContext bankContext)
        {
            _bankContext = bankContext;
        }

        public List<User> GetAll() {
            return _bankContext.Users.ToList();
        }

        public User? GetByID(int id)
        {
            return _bankContext.Users.Find(id);
        }
        public void Add(User user) {
            _bankContext.Users.Add(user);
        }
    }
}
