using Microsoft.AspNetCore.Mvc;
using System.IO.Pipelines;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text.Json;
using Bank_App.Repositories.Interfaces;
[ApiController]
[Route("api/[controller]")]
public class RecycleController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IUserAccountRepository _userAccountRepository;
    public RecycleController(IUserAccountRepository userAccountRepository)
    {
        _userAccountRepository = userAccountRepository;
        _httpClient = new HttpClient();
        _httpClient.Timeout = TimeSpan.FromMinutes(5);
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze(IFormFile image, IFormFile video, [FromForm] int userAccountId)
    {
        try
        {
            Console.WriteLine("🔍 C# endpoint'e istek geldi!");
            Console.WriteLine($"📸 Image: {image?.FileName} ({image?.Length} bytes)");
            Console.WriteLine($"🎥 Video: {video?.FileName} ({video?.Length} bytes)");
            Console.WriteLine($"👤 UserAccountId: {userAccountId}");
            if (image == null || video == null)
            {
                Console.WriteLine("❌ Dosya eksik!");
                return BadRequest("Hem image hem video gerekli");
            }

            var url = "http://localhost:5001/analyze";
            Console.WriteLine($"🚀 Python servisine istek gönderiliyor: {url}");

            using var content = new MultipartFormDataContent();

            // Image ekle 
            var imageContent = new StreamContent(image.OpenReadStream());
            imageContent.Headers.ContentType = new MediaTypeHeaderValue(image.ContentType);
            content.Add(imageContent, "image", image.FileName);
            Console.WriteLine($"✅ Image eklendi: {image.FileName}");

            // Video ekle
            var videoContent = new StreamContent(video.OpenReadStream());
            videoContent.Headers.ContentType = new MediaTypeHeaderValue(video.ContentType);
            content.Add(videoContent, "video", video.FileName);
            Console.WriteLine($"✅ Video eklendi: {video.FileName}");

            Console.WriteLine("📤 HTTP POST gönderiliyor...");
            var response = await _httpClient.PostAsync(url, content);
            
            Console.WriteLine($"📥 Response alındı: Status={response.StatusCode}");
            
            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"📄 Response içeriği: {result}");
            
            if (string.IsNullOrEmpty(result))
            {
                Console.WriteLine("⚠️ Response boş!");
            }

            var jsonResponse = JsonDocument.Parse(result);
            int bottleCount = jsonResponse.RootElement.GetProperty("bottle_count").GetInt32();
            Console.WriteLine($"📊 Şişe sayısı: {bottleCount}");

            int bonusPoints = bottleCount * 10;
            Console.WriteLine($"🎁 Bonus puan: {bonusPoints}");
            
            await _userAccountRepository.AddBonusAsync(userAccountId, bonusPoints);

            var userAccount = await _userAccountRepository.GetUserAccountByIdAsync(userAccountId);
            Console.WriteLine($"💰 Güncellenmiş bakiye: {userAccount.Balance}, Bonus puan: {userAccount.BonusPoints}");

            return Ok(new
            {
                bottleCount = bottleCount,
                earnedPoints = bonusPoints,
                totalPoints = userAccount.BonusPoints,
                message = $"Geri dönüşüm tamamlandı! {bottleCount} şişe tanındı, {bonusPoints} bonus puan kazandınız.",
                rawResponse = result
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"💥 HATA: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, ex.Message);
        }
    }
}