using Bank_App.Models;
using Bank_App.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Bank_App.DTOs;

namespace Bank_App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IUserAccountRepository _userAccountRepository;
        
        public TransactionController(ITransactionRepository transactionRepository ,
                                     IUserAccountRepository userAccountRepository)
        {
            _transactionRepository = transactionRepository;
            _userAccountRepository = userAccountRepository;
        }

        // -------------------------------------------------------------------------
        // 1. ÖZEL ROTALAR (En Üstte Olmalı)
        // -------------------------------------------------------------------------

        // Bu endpoint: api/transaction/account/1/stats adresini bekler.
        // Eğer Next.js'den accountId gelmezse bu rota çalışmaz, hata almazsın.
        [HttpGet("account/{accountId}/stats")]
        public async Task<IActionResult> GetAccountTransactionStats(int accountId)
        {
            try
            {
                var totalIncome = await _transactionRepository.GetTotalIncomeAsync(accountId);
                var totalExpense = await _transactionRepository.GetTotalExpenseAsync(accountId);
                var totalBalance = await _transactionRepository.GetTotalBalanceAsync(accountId);
                var totalBonusPoints = await _transactionRepository.GetTotalBonusPointsAsync(accountId);
                List<decimal> monthlySummary = await _transactionRepository.GetMonthlySummaryAsync(accountId);
                var bonusChange= await _transactionRepository.GetMonthlyBonusPointsAsync(accountId);

                var stats = new
                {
                    TotalIncome = totalIncome,
                    TotalExpense = totalExpense,
                    TotalBalance = totalBalance,
                    TotalBonusPoints = totalBonusPoints,
                    BonusChange = bonusChange,
                    incomeChange= Math.Round(monthlySummary[0],2),
                    expensesChange= Math.Round(monthlySummary[1],2),
                    balanceChange= Math.Round(monthlySummary[2],2)
                };

                return Ok(stats);
            }
            catch (Exception e)
            {
                return BadRequest($"İstatistik hatası: {e.Message}");
            }
        }

        // -------------------------------------------------------------------------
        // 2. GENEL ROTALAR
        // -------------------------------------------------------------------------

        // GET: api/transaction
        [HttpGet]
        public async Task<IActionResult> GetAllTransactions()
        {
            var transactions = await _transactionRepository.getAllTransactionsAsync();
            return Ok(transactions);
        }

        // GET: api/transaction/account/5
        // DİKKAT: URL "api/transaction/account/stats" olursa, "stats" kelimesi buradaki acc_id yerine geçer ve 400 hatası verir.
        // Bu yüzden yukarıdaki stats rotası tam olarak "account/{id}/stats" formatındadır.
        [HttpGet("account/{acc_id}")]
        public async Task<IActionResult> GetTransactionByAccountId(int acc_id)
        {
            var transactions = await _transactionRepository.getTransactionbyAccountAsync(acc_id);
            if(transactions == null || transactions.Count == 0)
            {
                return NotFound($"No transactions found for Account with ID {acc_id}");
            }
            return Ok(transactions);
        }

        [HttpGet("by-date")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionsByDate([FromQuery] DateTime date, [FromQuery] int accountId)
        {
            var transactions = await _transactionRepository.getTransactionByDateAsync(date, accountId);
            if (transactions == null || transactions.Count == 0)
            {
                return NotFound($"No transactions found");
            }
            return Ok(transactions);
        }    

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransactionById(int id)
        {
            var transaction = await _transactionRepository.getTransactionByIdAsync(id);
            if (transaction == null) return NotFound($"Transaction {id} not found"); 
            return Ok(transaction);
        }

        [HttpGet("amount/{id}")]
        public async Task<IActionResult> GetTransactionAmount(int id)
        {
            var amount = await _transactionRepository.getTransactionAmount(id);
            return Ok(amount);  
        }

        [HttpGet("remained/{acc_id}")]
        public async Task<IActionResult> GetRemainedAmountByAccountId(int acc_id)
        {
            var remainedAmount = await _transactionRepository.getRemainedAmountbyAccountAsync(acc_id);
            return Ok(remainedAmount);
        }

        [HttpGet("account-details/{id}")]
        public async Task<IActionResult> GetTransactionAccountDetails(int id)
        {
            var account = await _transactionRepository.getTransactionAccountAsync(id);
            if (account == null) return NotFound("Account not found");
            return Ok(account);
        }

        [HttpGet("type/{id}")]
        public async Task<IActionResult> GetTypeOfTransaction(int id)
        {
            var type = await _transactionRepository.getTypeOfTransactionAsync(id);
            return Ok(type);
        }

        [HttpPost("reverse/{transaction_id}")]
        public async Task<IActionResult> ReverseTransaction(int transaction_id)
        {
            try {
                var reversed = await _transactionRepository.reverseTransactionAsync(transaction_id);
                return Ok(reversed);
            } catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("account-by-transaction/{transactionId}")]
        public async Task<IActionResult> GetAccountByTransactionId(int transactionId)
        {
            var account = await _transactionRepository.GetAccountByTransactionIdAsync(transactionId);
            if (account == null) return NotFound();
            return Ok(account);
        }

        [HttpGet("recent/{accountId}/updateBalance")]
        public async Task<IActionResult> GetRecentTransactionsByAccount(int accountId)
        {
            await _userAccountRepository.UpdateAccountBalanceAsync(accountId);
            var account = await _userAccountRepository.GetUserAccountByIdAsync(accountId);
            if (account == null) return NotFound("Account not found");
            return Ok(
                account.Transactions
                       .OrderByDescending(t => t.TransactionDate)
                       .Take(5)
                       .ToList()
            );
        }
        [HttpPost("addtransaction")]
        public async Task<IActionResult> AddTransaction([FromBody] TransactionCreateDto dto)
        {
            try
            {
                if (dto.AccountId <= 0)
                    return BadRequest(new { error = "Invalid accountId" });

                if (dto.Amount == 0)
                    return BadRequest(new { error = "Amount cannot be zero" });

                var validTypes = new[] { "Income", "Expense" };
                if (!validTypes.Contains(dto.Type))
                    return BadRequest(new { error = "Type must be 'Income' or 'Expense'" });

                var validCategories = new[]
                {
                    "Eco_Mobility", "Eco_Energy", "Eco_Consumption", "Eco_Social",
                    "Daily", "Shopping", "Housing", "Travel", "Finance", "Other"
                };

                if (!validCategories.Contains(dto.Category))
                    return BadRequest(new { error = "Invalid category" });

                var transaction = new Transaction
                {
                    AccountId = dto.AccountId,
                    Category = dto.Category,
                    Type = dto.Type,
                    TransactionDate = DateTime.UtcNow
                };

                transaction.Amount =
                    dto.Type == "Expense"
                        ? -Math.Abs(dto.Amount)
                        : Math.Abs(dto.Amount);

                var result = await _transactionRepository.addTransactionAsync(transaction);

                if (result == null)
                    return BadRequest(new { error = "Insufficient balance or transaction failed" });

                return Ok(new
                {
                    success = true,
                    transactionId = result.TransactionId,
                    category = result.Category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


    }
}