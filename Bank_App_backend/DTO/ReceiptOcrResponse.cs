// ReceiptOcrResponse.cs
namespace Bank_App.DTO
{
    public class ReceiptOcrResponse
    {
        public bool success { get; set; }
        public ReceiptData data { get; set; }
    }

    public class ReceiptData
    {
        public string SEARCHED_ITEM { get; set; }  // ✅ Python'dan gelen key
        public string TARIH { get; set; }          // ✅ String (örn: "01/01/2024")
        public string SAAT { get; set; }           // ✅ String (örn: "15:30")
        public string AMOUNT { get; set; }         // ✅ String (örn: "150.50")
    }
}