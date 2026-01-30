using System;
using System.Collections.Generic;
using System.Text;
using Bank_App.Models;
using Bank_App.Data;
using Bank_App.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bank_App.Repositories
{
    public class NotificationRepository: INotificationRepository
    {
        private readonly BankContext _context;
        private const int MAX_NOT=3;

        public NotificationRepository(BankContext context)
        {
            _context= context;
        }

        public async Task AddNotificationAsync(int UserId, string category)
        {
            var notification = new Notification
            {
                userId=UserId,
                message= "Tebrikler "+category + " kategorisinde harcama yaptınız ve bonus puan kazandınız🥳",
                Category= category,
                isRead= false,
                CreateDate= DateTime.UtcNow
            };

            await _context.Notifications.AddAsync(notification);

            var userNotification = await _context.Notifications
                .Where(n=> n.userId==UserId)
                .OrderByDescending(n=> n.CreateDate)
                .ToListAsync();

            //add yaptı ama saveChange yapamdı o yüzden 3'e eşitliği de kontrol et
            if (userNotification.Count >= MAX_NOT)
            {
                var toDelete = userNotification
                    .Skip(MAX_NOT-1)
                    .ToList();
                
                _context.Notifications.RemoveRange(toDelete);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(int UserId)
        {

            return await _context.Notifications
                .Where(n=> n.userId==UserId)
                .OrderByDescending(n=>n.CreateDate)
                .Take(MAX_NOT)
                .ToListAsync();
        }

    }
}
