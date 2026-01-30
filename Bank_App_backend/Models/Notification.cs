using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Bank_App.Models
{
    public class Notification
    {
        [Key]
        public int notificationId {get; set;}
        public int userId {get; set;}

        [Required]
        [MaxLength(100)] //max message length
        public string message{get;set;}
        public DateTime CreateDate {get;set;}
        public bool isRead {get; set;}=false;
        public String Category {get; set;}

        [ForeignKey("userId")]
        public User user {get;set;}
    }

}