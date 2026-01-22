using System;
using System.Collections.Generic;
using System.Text;
using Bank_App.Models;

namespace Bank_App.Repositories.Interface
{
    public interface IUserRepository
    {
            List<User> GetAll();
            User? GetByID(int id);
            void Add(User user);
    }
}
