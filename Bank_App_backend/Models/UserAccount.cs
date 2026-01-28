using System.ComponentModel.DataAnnotations;
namespace Bank_App.Models
{
    public class UserAccount
    {
        [Key]
        public int UserAccountId { get; set; }
        public int UserId { get; set; }
        public decimal Balance { get; set; }

        public int BonusPoints { get; set; } = 0;
        public DateTime BonusPointsLastResetDate { get; set; } = DateTime.Now;

        public User User { get; set; }

        public ICollection<Transaction> Transactions { get; set; }
    }
}