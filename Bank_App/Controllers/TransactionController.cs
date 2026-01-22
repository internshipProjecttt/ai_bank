using Bank_App.Models;
using Bank_App.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
namespace Bank_App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionRepository _transactionRepository;
        public TransactionController(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }
        
        //GET : api/transaction
        [HttpGet]
        public async Task<IActionResult> GetAllTransactions()
        {
            var transactions = await _transactionRepository.getAllTransactionsAsync();
            return Ok(transactions);
        }
        //Task<List<Transaction>> getTransactionbyAccountAsync(int acc_id);
        // GET: api/transaction/account/5
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

        //Task<List<Transaction>> getTransactionByDateAsync(DateTime d , int accoutId);
        // GET: api/transactions/by-date?date=2026-01-21&accountId=3
        [HttpGet("by-date")]
        public async Task<ActionResult<List<Transaction>>> GetTransactionsByDate([FromQuery] DateTime date, [FromQuery] int accountId)
        {
            var transactions = await _transactionRepository.getTransactionByDateAsync(date, accountId);
            if (transactions == null || transactions.Count == 0)
            {
                return NotFound($"No transactions found for Account ID {accountId} on {date.ToShortDateString()}");
            }
            return Ok(transactions);
        }    

        //Task<Transaction?> getTransactionByIdAsync(int id);
        // GET: api/transaction/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransactionById(int id)
        {
            var transaction = await _transactionRepository.getTransactionByIdAsync(id);
            if (transaction == null)
            {
                return NotFound($"Transaction with ID {id} not found"); 
            }
            return Ok(transaction);
        }
        //Task<decimal> getTransactionAmount(int id);
        // GET: api/transaction/amount/5
        [HttpGet("amount/{id}")]
        public async Task<IActionResult> GetTransactionAmount(int id)
        {
            var amount = await _transactionRepository.getTransactionAmount(id);
            return Ok(amount);  
        }

        //Task<decimal> getRemainedAmountbyAccountAsync(int acc_id);
        // GET: api/transaction/remained/5
        [HttpGet("remained/{acc_id}")]
        public async Task<IActionResult> GetRemainedAmountByAccountId(int acc_id)
        {
            var remainedAmount = await _transactionRepository.getRemainedAmountbyAccountAsync(acc_id);
            return Ok(remainedAmount);
        }

        //Task<UserAccount?> getTransactionAccountAsync(int id);
        // GET: api/transaction/account-details/5
        [HttpGet("account-details/{id}")]
        public async Task<IActionResult> GetTransactionAccountDetails(int id)
        {
            var account = await _transactionRepository.getTransactionAccountAsync(id);
            if (account == null)
            {
                return NotFound($"Account for Transaction ID {id} not found"); }
            return Ok(account);
        }

        //Task<String> getTypeOfTransactionAsync(int id);
        // GET: api/transaction/type/5
        [HttpGet("type/{id}")]
        public async Task<IActionResult> GetTypeOfTransaction(int id)
        {
            var type = await _transactionRepository.getTypeOfTransactionAsync(id);
            return Ok(type);
        }

        //Task<Transaction?> addTransactionAsync(Transaction? transaction);
        // POST: api/transaction
        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] Transaction transaction)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var addedTransaction = await _transactionRepository.addTransactionAsync(transaction);
            return CreatedAtAction(nameof(GetTransactionById), new { id = addedTransaction.TransactionId }, addedTransaction);
        }

        //Task<Transaction?> reverseTransactionAsync(int transaction_id);
        // POST: api/transaction/reverse/5
        [HttpPost("reverse/{transaction_id}")]
        public async Task<IActionResult> ReverseTransaction(int transaction_id)
        {
            var reversedTransaction = await _transactionRepository.reverseTransactionAsync(transaction_id);
            if (reversedTransaction == null)
            {
                return NotFound($"Transaction with ID {transaction_id} not found or cannot be reversed");
            }
            return Ok(reversedTransaction);
        }

        //Task<UserAccount?> GetAccountByTransactionIdAsync(int transactionId);
        [HttpGet("account-by-transaction/{transactionId}")]
        public async Task<IActionResult> GetAccountByTransactionId(int transactionId)
        {
            var account = await _transactionRepository.GetAccountByTransactionIdAsync(transactionId);
            if (account == null)
            {
                return NotFound($"Account for Transaction ID {transactionId} not found");
            }
            return Ok(account);
        }

        //Task<List<Transaction>> GetRecentTransactionsByAccountAsync(int accountId, int count);
        [HttpGet("recent/{accountId}/{count}")]
        public async Task<IActionResult> GetRecentTransactionsByAccount(int accountId, int count)
        {
            var transactions = await _transactionRepository.GetRecentTransactionsByAccountAsync(accountId, count);
            if (transactions == null || transactions.Count == 0)
            {
                return NotFound($"No transactions found for Account ID {accountId}");
            }
            return Ok(transactions);
        }
    }
}