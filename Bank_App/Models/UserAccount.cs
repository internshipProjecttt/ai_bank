using System.ComponentModel.DataAnnotations;
namespace Bank_App.Models
{
    public class UserAccount
    {
        [Key]
        public int UserAccountId { get; set; }
        public int UserId { get; set; }
        public decimal Balance { get; set; }

        public User User { get; set; }

        public ICollection<Transaction> Transactions { get; set; }
    }
}