using System.ComponentModel.DataAnnotations;
namespace Bank_App.Models
{
    public class Transaction
    {
        [Key]
        public int TransactionId { get; set; }
        public int AccountId { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public UserAccount UserAccount { get; set; }
        public string Category { get; set; }
        public string Type { get; set; } 

    }
}