using System.Reflection.Metadata;
using Bank_App.Models;
using Microsoft.EntityFrameworkCore;
namespace Bank_App.Data
{

    public class BankContext : DbContext
    {
         public BankContext(DbContextOptions<BankContext> options) : base(options)
        {
        }

        public DbSet<UserAccount> UserAccounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        public DbSet<User> Users { get; set; }
        public DbSet<Notification> Notifications{get; set;}

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(
                "Server=192.168.1.215;Database=BankDB2;User Id=sa;Password=Test1234!;Encrypt=false;TrustServerCertificate=True;"
            );
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Transaction -> UserAccount ilişkisi
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.UserAccount)
                .WithMany(ua => ua.Transactions)
                .HasForeignKey(t => t.AccountId);

            // UserAccount -> User ilişkisi
            modelBuilder.Entity<UserAccount>()
                .HasOne(ua => ua.User)
                .WithMany(u => u.UserAccounts)
                .HasForeignKey(ua => ua.UserId);

            //User-Notification ilişkisi
            modelBuilder.Entity<Notification>()
                .HasOne(n=> n.user)//bir notification bir kullanıya ait
                .WithMany(u=> u.Notifications)//bir user birden çok notificationa sahip
                .HasForeignKey(n=>n.userId)
                .OnDelete(DeleteBehavior.Cascade); //kullanıcı gidince bildirimleri de gider

            //Index ekeme (Performansa iyi geliyormuş)
            modelBuilder.Entity<Notification>()
                .HasIndex(n=> new{n.userId, n.CreateDate});                
        }
    }
}