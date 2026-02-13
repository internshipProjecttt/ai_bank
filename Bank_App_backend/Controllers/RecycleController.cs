using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
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

    [HttpPost("check-recycle-bin")]
    public async Task<IActionResult> CheckRecycleBin(IFormFile image)
    {
        try
        {
            Console.WriteLine("Geri dönüşüm kutusu kontrol ediliyor...");

            if (image == null)
            {
                Console.WriteLine ("Fotoğraf eklenmedi.");
                return BadRequest("Fotoğraf eklenmedi.");
            }

            Console.WriteLine($"Image: {image.FileName}({image.Length} bytes)");

            var url = "http://localhost:5001/check-recycle-bin";
            Console.WriteLine($"Python servisine istek gönderiliyor: {url}");

            using var content = new MultipartFormDataContent();
            var imageContent = new StreamContent(image.OpenReadStream());
            imageContent.Headers.ContentType = new MediaTypeHeaderValue(image.ContentType);
            content.Add(imageContent, "image", image.FileName);

            Console.WriteLine("Http isteği gönderiliyor...");
            var response = await _httpClient.PostAsync(url, content);

            Console.WriteLine($"Response alındı: Status: {response.StatusCode}");

            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Response içeriği: {result}");

            if(string.IsNullOrEmpty(result))
            {
                Console.WriteLine("Python servisinden geçerli bir yanıt alınamadı.");
                return StatusCode(500, "Python servisinden geçerli bir yanıt alınamadı.");
            }

            var jsonResponse = JsonDocument.Parse(result);
            bool isRecycleBin = jsonResponse.RootElement.GetProperty("isRecycleBin").GetBoolean();
            string message = jsonResponse.RootElement.GetProperty("message").GetString();

            Console.WriteLine($"Sonuç: {(isRecycleBin ? "Geri dönüşüm kutusu bulundu." : "Geri dönüşüm kutusu bulunamadı.")}");
            Console.WriteLine($"Mesaj: {message}");

            return Ok(new
            {
                IsRecycleBin = isRecycleBin,
                Message = message
            });
        }

        catch (JsonException ex)
        {
            Console.WriteLine($"JSON işleme hatası: {ex.Message}");
            return StatusCode(500, $"JSON işleme hatası: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Hata oluştu: {ex.Message}");
            return StatusCode(500, $"Hata oluştu: {ex.Message}");
        }

    }

    //video ile şişe sayma
    [HttpPost("count-bottles")]
    public async Task<IActionResult> CountBottles(IFormFile video, [FromForm] int userAccountId)
    {
        try
        {
            Console.WriteLine("🍾 Şişe sayımı başladı!");
            Console.WriteLine($"🎥 Video: {video?.FileName} ({video?.Length} bytes)");
            Console.WriteLine($"👤 UserAccountId: {userAccountId}");

            if (video == null)
            {
                Console.WriteLine("❌ Video eklenmedi.");
                return BadRequest("Video eklenmedi.");
            }

            var url = "http://localhost:5001/count-bottles";
            Console.WriteLine($"🔗 Python servisine istek gönderiliyor: {url}");

            using var content = new MultipartFormDataContent();

            var videoContent = new StreamContent(video.OpenReadStream());
            videoContent.Headers.ContentType = new MediaTypeHeaderValue(video.ContentType);
            content.Add(videoContent, "video", video.FileName);
            Console.WriteLine($"video eklendi: {video.FileName}");

            Console.WriteLine("📤 Http isteği gönderiliyor...");
            var response = await _httpClient.PostAsync(url, content);

            Console.WriteLine($"📥 Response alındı: Status: {response.StatusCode}");

            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"📄 Response içeriği: {result}");

            if(string.IsNullOrEmpty(result))
            {
                Console.WriteLine("Response boş!");
                return BadRequest("Python servisinden geçerli bir yanıt alınamadı.");
            }

            var jsonResponse = JsonDocument.Parse(result);
            int bottleCount = jsonResponse.RootElement.GetProperty("bottleCount").GetInt32();
            Console.WriteLine($"Şişe sayısı: {bottleCount}");

            int bonusPoints = bottleCount * 10;
            Console.WriteLine($"Bonus puan: {bonusPoints}");

            //database'e kaydet
            await _userAccountRepository.AddBonusAsync(userAccountId, bonusPoints);

            var userAccount = await _userAccountRepository.GetUserAccountByIdAsync(userAccountId);
            Console.WriteLine($"Toplam Bonus Puan: {userAccount.BonusPoints}");

            return Ok(new
            {
                bottleCount = bottleCount,
                earnedPoints = bonusPoints,
                TotalBonusPoints = userAccount.BonusPoints,
                Message = $"Tebrikler! {bottleCount} şişe tespit edildi, {bonusPoints} bonus puan kazandınız!"

            });
        }
            catch (JsonException ex)
            {
                Console.WriteLine($"💥 JSON Parse Hatası: {ex.Message}");
                return StatusCode(500, "Python servisinden gelen yanıt işlenemedi");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 HATA: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, ex.Message);
            }
    }


}