using Bank_App.Models;
using Bank_App.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Bank_App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        
        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // GET: api/user
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync(); // ✅ async
            return Ok(users);
        }

        // GET: api/user/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }
            return Ok(user);
        }

        // POST: api/user
        //jdjdndjdjdjd
        [HttpPost]
        public async Task<IActionResult> AddUser([FromBody] User user)
        {
            if (!ModelState.IsValid) // ✅ Validation
            {
                return BadRequest(ModelState);
            }

            var created = await _userRepository.AddUserAsync(user);
            
            // ✅ CreatedAtAction (201 status + location header)
            return CreatedAtAction(nameof(GetUserById), new { id = created.UserId }, created);
        }

        // PUT: api/user/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User user)
        {
            if (id != user.UserId) // ✅ ID eşleşme kontrolü
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existing = await _userRepository.GetUserByIdAsync(id);
            if (existing == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            await _userRepository.UpdateUserAsync(user);
            return NoContent(); // ✅ 204 No Content (standart)
        }

        // DELETE: api/user/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            await _userRepository.DeleteUserAsync(id);
            return NoContent(); // ✅ 204 No Content
        }
    }
    //okey
}