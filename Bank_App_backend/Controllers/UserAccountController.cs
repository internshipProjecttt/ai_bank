using Bank_App.Models;
using Bank_App.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
namespace Bank_App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserAccountController: ControllerBase
    {
        private readonly IUserAccountRepository _userAccountRepository;
        public UserAccountController(IUserAccountRepository userAccountRepository)
        {
            _userAccountRepository = userAccountRepository;
        }

        // GET: api/useraccount/5
        [HttpGet("{id}")]
         public async Task<IActionResult> GetUserAccountById(int userAccountId)
        {
            var account = await _userAccountRepository.GetUserAccountByIdAsync(userAccountId);
            if (account == null)
            {
                return NotFound($"UserAccount with ID {userAccountId} not found");
            }
            return Ok(account);
        }   
        // GET: api/useraccount/user/5
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetAllAccountByUserId(int userId)
        {
            var accounts = await _userAccountRepository.GetAllAccountsByUserIdAsync(userId);
            if(accounts == null || accounts.Count == 0)
            {
                return NotFound($"No accounts found for User with ID {userId}");
            }
            return Ok(accounts);
        }  
        // POST: api/useraccount
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserAccount account)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _userAccountRepository.CreateUserAccountAsync(account);
            return CreatedAtAction(nameof(GetUserAccountById), new { id = created.UserAccountId }, created);
        }

        // PUT: api/useraccount/5
        [HttpPut("{id}")]
       public async Task<IActionResult> Update(int id, [FromBody] UserAccount account)
        {
            if(id != account.UserAccountId)
                return BadRequest("ID mismatch");
            
            if(!ModelState.IsValid)
                return BadRequest(ModelState);
            
            var existing = await _userAccountRepository.GetUserAccountByIdAsync(id);
            if(existing == null)
                return NotFound($"UserAccount with ID {id} not found");

            await _userAccountRepository.UpdateUserAccountAsync(account);
            return NoContent();
        }

        // DELETE: api/useraccount/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var account = await _userAccountRepository.GetUserAccountByIdAsync(id);
            if(account == null)
                return NotFound($"UserAccount with ID {id} not found");

            await _userAccountRepository.DeleteUserAccountAsync(id);
            return NoContent();
            //okey
        }   
     }
}