using Bank_App.Models;
using Bank_App.Repositories.Interface;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    // GET: api/User
    [HttpGet]
    public IActionResult GetAllUsers()
    {
        var users = _userRepository.GetAll();

        if (users == null || !users.Any())
        {
            return NotFound("Kullanıcı bulunamadı");
        }

        return Ok(users);
    }

    // GET: api/User/5
    [HttpGet("{id}")]
    public IActionResult GetUserById(int id)
    {
        var user = _userRepository.GetByID(id);

        if (user == null)
        {
            return NotFound($"Id={id} olan kullanıcı bulunamadı");
        }

        return Ok(user);
    }

    // POST: api/User
    [HttpPost]
    public IActionResult CreateUser([FromBody] User user)
    {
        _userRepository.Add(user);
        return CreatedAtAction(
            nameof(GetUserById),
            new { id = user.UserId },
            user
        );
    }
}
