using System.ComponentModel.DataAnnotations;
namespace Bank_App.Models
{
    public class User
    {
    [Key]
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
       


        public ICollection<UserAccount> UserAccounts { get; set; }
    }
}
