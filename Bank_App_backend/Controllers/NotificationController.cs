using Microsoft.AspNetCore.Mvc;
using Bank_App.Data;
using Bank_App.Models;
using Bank_App.Repositories;
using Bank_App.Repositories.Interfaces;

namespace Bank_App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController: ControllerBase
    {
        private readonly INotificationRepository _notificationRepo;

        public NotificationController(INotificationRepository notificationRepository)
        {
            _notificationRepo= notificationRepository;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetNotificationsAsync(int userId)
        {
            try
            {
               var notification= await _notificationRepo.GetUserNotificationsAsync(userId);

               if(notification==null || !notification.Any()) 
                    return Ok(new{message="No notifications found", data = new List<object>()});

                return Ok(notification.Select(n=> new
                {
                    message = n.message,
                    CreateDate = n.CreateDate,
                    Category = n.Category,
                    isRead = n.isRead
                })); 
            }catch(Exception e)
            {
                return StatusCode(500, new{error=e.Message});
            }
            
        }
    }
}