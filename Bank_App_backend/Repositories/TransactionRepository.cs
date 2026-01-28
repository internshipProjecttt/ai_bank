using System;
using System.Collections.Generic;
using System.Text;
using Bank_App.Models;
using Bank_App.Data;
using Bank_App.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bank_App.Repositories
{
    public class TransactionRepository: ITransactionRepository
    {
        private readonly BankContext _transactionRepo;

        public TransactionRepository(BankContext Context) {
            _transactionRepo = Context;
        }
        public async Task<List<Transaction>> getAllTransactionsAsync() {
            return await _transactionRepo.Transactions
                .Include(t=> t.UserAccount)
                .OrderByDescending(t=> t.TransactionDate)
                .ToListAsync();

        }
        public async Task<List<Transaction>> getTransactionbyAccountAsync(int acc_id) {
            return await _transactionRepo.Transactions
                .Where(t => t.AccountId == acc_id)
                .Include(t => t.UserAccount)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }
        public async Task<List<Transaction>> getTransactionByDateAsync(DateTime d, int acc_id) {
            return await _transactionRepo.Transactions
                .Where(t => t.TransactionDate == d)
                .Where(t => t.AccountId == acc_id)
                .Include(t => t.UserAccount)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }
        public async Task<Transaction?> getTransactionByIdAsync(int id) {
            return await _transactionRepo.Transactions.FindAsync(id);
        }
        public async Task<decimal> getTransactionAmount(int id) {
            return await _transactionRepo.Transactions
                .Where(t => t.TransactionId == id)
                .Select(t => t.Amount)
                .FirstOrDefaultAsync();
        }
        public async Task<decimal> getRemainedAmountbyAccountAsync(int acc_id) {
            var userAccount = await _transactionRepo.UserAccounts.FirstOrDefaultAsync(ua=> ua.UserAccountId==acc_id);
            if (userAccount == null) throw new Exception($"Transaction with account ID {acc_id} could not be found");

            var transactionAmount = await _transactionRepo.Transactions
                .Where(t => t.AccountId == acc_id)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => t.Amount)
                .FirstOrDefaultAsync();
            return userAccount.Balance - transactionAmount;
        }
        public async Task<UserAccount?> getTransactionAccountAsync(int id) { 
            return await _transactionRepo.Transactions
                .Where(t=> t.TransactionId==id)
                .Select(t=> t.UserAccount)
                .FirstOrDefaultAsync();
        }
        public async Task<String> getTypeOfTransactionAsync(int id) { 
            return await _transactionRepo.Transactions
                .Where(t => t.TransactionId == id)
                .Select(t => t.Type)
                .FirstOrDefaultAsync();
        }
        public async Task<Transaction?> addTransactionAsync(Transaction? transaction) {
            decimal amount = transaction.Amount;
            var user= await _transactionRepo.UserAccounts
                .FirstOrDefaultAsync(ua => ua.UserAccountId == transaction.AccountId);
            if (user == null) throw new Exception($"Transaction with Account ID {user.UserAccountId} could not be found");
            else if (amount > user.Balance) return null;
            await _transactionRepo.Transactions.AddAsync(transaction);
            await _transactionRepo.SaveChangesAsync();

            return transaction;
        }
        //Hatalı işlem düzeltme
        public async Task<Transaction?> reverseTransactionAsync(int transaction_id) {
            //Original transactionı bul
            var originalTransaction = await _transactionRepo.Transactions
                .Include(t => t.UserAccount)
                .FirstOrDefaultAsync(t => t.TransactionId == transaction_id);
            if (originalTransaction == null) throw new Exception($"Transacction with ID {transaction_id} could not be found");

            //Öncesinde Reverse edilmiş mi diye kkontrol et
            var alreadyReversed = await _transactionRepo.Transactions
                .AnyAsync(t=> t.Category==$"REVERSAL_{transaction_id}");
            if (alreadyReversed) throw new Exception($"Transaction {transaction_id} has already been reversed.");

            var reversaltransaction = new Transaction {
                AccountId= originalTransaction.AccountId,
                Amount= -originalTransaction.Amount,
                TransactionDate= DateTime.Now,
                UserAccount= originalTransaction.UserAccount,
                Category=$"REVERSAL_{transaction_id}",
                Type= originalTransaction.Type=="DEBIT" ? "CREDIT": "DEBIT" //Ters tipi işaretle
            };

            _transactionRepo.Transactions.Add(reversaltransaction);
            await _transactionRepo.SaveChangesAsync();
            return reversaltransaction;
        }
        public async Task<UserAccount?> GetAccountByTransactionIdAsync(int transactionId) {
            return await _transactionRepo.Transactions
                .Where(t=> t.TransactionId==transactionId)
                .Include(t=> t.UserAccount)
                .Select(t=> t.UserAccount)
                .FirstOrDefaultAsync();
        }
        public async Task<List<Transaction>> GetRecentTransactionsByAccountAsync(int accountId, int count) { 
            return await _transactionRepo.Transactions
                .Where(t => t.AccountId == accountId)
                .Include(t => t.UserAccount)
                .OrderByDescending(t => t.TransactionDate)
                .Take(count)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalIncomeAsync(int accountId) {
            return await _transactionRepo.Transactions
                .Where(t=> t.AccountId == accountId && t.Type=="Income")
                .SumAsync(t=> t.Amount);
        }  
        public async Task<decimal> GetTotalExpenseAsync(int accountId)
        {
            return await _transactionRepo.Transactions
                .Where(t=> t.AccountId == accountId && t.Type == "Expense")
                .SumAsync(t=> t.Amount);
        }

        public async Task<decimal> GetTotalBalanceAsync(int accountId)
        {
            var totalExpense= await GetTotalExpenseAsync(accountId);
            var totalIncome= await GetTotalIncomeAsync(accountId);
            return totalIncome + totalExpense;
        }

        public async Task<int> GetTotalBonusPointsAsync(int accountId)
        {
            var userAccount = await _transactionRepo.UserAccounts
                .FirstOrDefaultAsync(ua=> ua.UserAccountId==accountId);
            if(userAccount==null) throw new Exception($"Account with ID {accountId} could not be found");
            //Son sıfırlama tarihini kontrol et ve gerekiyorsa sıfırla
            if(userAccount.BonusPointsLastResetDate.Year < DateTime.Now.Year){
                userAccount.BonusPoints = 0;
                userAccount.BonusPointsLastResetDate = DateTime.Now;
                await _transactionRepo.SaveChangesAsync();
            }
            return userAccount.BonusPoints;
        }

        public async Task<List<decimal>> GetMonthlySummaryAsync(int accountId){
            var now=DateTime.Now;

            var currentMonthStart= new DateTime(now.Year, now.Month,1);
            var previousMonthStart= currentMonthStart.AddMonths(-1);
            var previousMonthEnd= currentMonthStart.AddDays(-1);

            var currentMonthTransactions= _transactionRepo.Transactions
                .Where(t=> t.AccountId== accountId && t.TransactionDate >= currentMonthStart);

            var currentMonthIncome = await currentMonthTransactions
                .Where(t => t.Type == "Income")
                .SumAsync(t => t.Amount);

            var currentMonthExpense = await currentMonthTransactions
                .Where(t => t.Type == "Expense")
                .SumAsync(t => t.Amount);
            
            var currentMonthBalance = currentMonthIncome - currentMonthExpense;

            var previousMonthTransactions= _transactionRepo.Transactions
                .Where(t=> t.AccountId== accountId && t.TransactionDate >= previousMonthStart && t.TransactionDate <= previousMonthEnd);

            var previousMonthIncome = await previousMonthTransactions
                .Where(t => t.Type == "Income")
                .SumAsync(t => t.Amount);

            var previousMonthExpense = await previousMonthTransactions
                .Where(t => t.Type == "Expense")
                .SumAsync(t => t.Amount);

            var previousMonthBalance = previousMonthIncome - previousMonthExpense; 

            decimal incomeChange=  previousMonthIncome == 0
            ? 0
            : ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;

            decimal expenseChange=  previousMonthExpense == 0
            ? 0
            : ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100;

            decimal balanceChange=  previousMonthBalance == 0
            ? 0
            : ((currentMonthBalance - previousMonthBalance) / previousMonthBalance) * 100;

            return new List<decimal> { 
                incomeChange,
                expenseChange,
                balanceChange
             };
        }

        public async Task<int> GetMonthlyBonusPointsAsync(int accountId){
            var now= DateTime.Now;
            var userAccount = await _transactionRepo.UserAccounts
                .FirstOrDefaultAsync(ua=> ua.UserAccountId==accountId);
            if(userAccount==null) throw new Exception($"Account with ID {accountId} could not be found");

            var currentMonthStart= new DateTime(now.Year, now.Month,1);
            var previousMonthStart= currentMonthStart.AddMonths(-1);
            var previousMonthEnd= currentMonthStart.AddDays(-1);

            var currentMonthBonusPoints= await _transactionRepo.UserAccounts
                .Where(ua=> ua.UserAccountId== accountId && ua.BonusPointsLastResetDate >= currentMonthStart)
                .SumAsync(ua=> ua.BonusPoints);

            var previousMonthBonusPoints= await _transactionRepo.UserAccounts
                .Where(ua=> ua.UserAccountId== accountId && ua.BonusPointsLastResetDate >= previousMonthStart && ua.BonusPointsLastResetDate <= previousMonthEnd)
                .SumAsync(ua=> ua.BonusPoints);

            var bonusChange= previousMonthBonusPoints == 0
            ? 0
            : ((currentMonthBonusPoints - previousMonthBonusPoints) / previousMonthBonusPoints) * 100;
            return (int)bonusChange;
            
        }
    }
}
