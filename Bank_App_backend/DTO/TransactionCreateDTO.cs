namespace Bank_App.DTOs
{
    public class TransactionCreateDto
    {
        public int AccountId { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; }
        public string Category { get; set; }
    }
}