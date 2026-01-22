using System;
using System.Collections.Generic;
using System.Text;
using Bank_App.Models;
using Bank_App.Data;

namespace Bank_App.Repositories.Interfaces
{
    public interface ITransactionRepository
    {
        Task<List<Transaction>> getAllTransactionsAsync();
        Task<List<Transaction>> getTransactionbyAccountAsync(int acc_id);
        Task<List<Transaction>> getTransactionByDateAsync(DateTime d, int acc_id);
        Task<Transaction?> getTransactionByIdAsync(int id);
        Task<decimal> getTransactionAmount(int id);
        Task<decimal> getRemainedAmountbyAccountAsync(int acc_id);
        Task<UserAccount?> getTransactionAccountAsync(int id);
        Task<String> getTypeOfTransactionAsync(int id);
        Task<Transaction?> addTransactionAsync(Transaction? transaction);
        //Hatalı işlem düzeltme
        Task<Transaction?> reverseTransactionAsync(int transaction_id);
        Task<UserAccount?> GetAccountByTransactionIdAsync(int transactionId);
        Task<List<Transaction>> GetRecentTransactionsByAccountAsync(int accountId, int count);
    }
}
