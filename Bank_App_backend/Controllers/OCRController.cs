using System.Net.Http.Headers;
using System.Text.Json;
using Bank_App.Data;
using Bank_App.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Bank_App.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OCRController : ControllerBase
    {
        private readonly HttpClient _http;
        private readonly BankContext _db;
        public OCRController(HttpClient http, BankContext db)
        {
            _http = http;
            _http.BaseAddress = new Uri("http://localhost:5001"); // ✅ Base URL
            _db = db;   
        }

        [HttpPost("process-receipt")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ProcessReceipt([FromForm] OcrUploadRequest request)
        {
            try
            {
                var file = request.File;

                if (file == null || file.Length == 0)
                    return BadRequest("File is not found or empty");

                using var content = new MultipartFormDataContent();
                using var stream = file.OpenReadStream();
                
                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

                content.Add(fileContent, "file", file.FileName);

                // Python'a gönder
                var response = await _http.PostAsync("/api/ocr/receipt", content);

                // Response'u kontrol et
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, new 
                    { 
                        error = "Python service error", 
                        details = errorBody 
                    });
                }

                var responseBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Python Response: " + responseBody);

                // JSON'ı parse et
                var ocrResult = JsonSerializer.Deserialize<ReceiptOcrResponse>(
                    responseBody,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                if (ocrResult == null || !ocrResult.success)
                {
                    return BadRequest(new { error = "OCR failed", response = responseBody });
                }

                // Tarihi parse et (örn: "01/01/2024" → DateTime)
                DateTime? parsedDate = null;
                if (!string.IsNullOrEmpty(ocrResult.data.TARIH))
                {
                    if (DateTime.TryParseExact(
                        ocrResult.data.TARIH, 
                        "dd/MM/yyyy", 
                        CultureInfo.InvariantCulture, 
                        DateTimeStyles.None, 
                        out var date))
                    {
                        parsedDate = date;
                    }
                }

                // Tutarı parse et (örn: "150.50" → decimal)
                decimal? parsedAmount = null;
                if (!string.IsNullOrEmpty(ocrResult.data.AMOUNT))
                {
                    if (decimal.TryParse(
                        ocrResult.data.AMOUNT.Replace(",", "."), 
                        NumberStyles.Any, 
                        CultureInfo.InvariantCulture, 
                        out var amount))
                    {
                        parsedAmount = amount;
                    }
                }

                // DB'de kontrol et
                var exists = false;
                if (parsedDate.HasValue && parsedAmount.HasValue)
                {
                    exists = await _db.Transactions.AnyAsync(t => 
                        t.TransactionDate.Date == parsedDate.Value.Date &&
                        t.Amount == parsedAmount.Value
                    );
                }

                return Ok(new
                {
                    ocr = new 
                    {
                        searchedItem = ocrResult.data.SEARCHED_ITEM,
                        date = parsedDate,
                        time = ocrResult.data.SAAT,
                        amount = parsedAmount,
                        rawOcr = ocrResult.data
                    },
                    existsInDb = exists 
                });

            }
            catch (JsonException jsonEx)
            {
                return StatusCode(500, new
                {
                    error = "JSON Parse Error",
                    message = jsonEx.Message,
                    stack = jsonEx.StackTrace
                });
            }
            catch (Exception e)
            {
                return StatusCode(500, new
                {
                    error = e.Message,
                    stack = e.StackTrace
                });
            }
        }

        private static readonly HashSet<string> GreenMaterials = new()
        {
            "COTTON", "PAMUK",
            "WOOL", "YÜN", "YUN",
            "VISCOSE", "VİSKOZ", "VISKOZ"
        };

        private static readonly HashSet<string> YellowMaterials = new()
        {
            "POLYAMIDE", "POLİAMİD"
        };

        private static readonly HashSet<string> RedMaterials = new()
        {
            "POLYESTER", "POLIESTER", "POLİESTER",
            "ELASTANE", "ELASTAN",
            "ACRYLIC", "AKRİLİK", "AKRILIK",
            "NYLON", "NAYLON"
        };

        private int CalculateBonusPoints(LabelMaterialDto materials)
        {
            int bonus=0;
            var main_fabric = materials.MainFabric;
            List<string> fabrics= materials.Fabrics;

            if (GreenMaterials.Contains(main_fabric.ToUpper()))
            {
                bonus+=10;
                foreach(var item in fabrics)
                {
                    if ( !item.Equals(main_fabric) && GreenMaterials.Contains(item.ToUpper()))
                    {
                        bonus+=10;
                    }
                    if ( !item.Equals(main_fabric) && YellowMaterials.Contains(item.ToUpper()))
                    {
                        bonus+=5;
                    }
                }
            } 
            if (YellowMaterials.Contains(main_fabric.ToUpper()))
            {
                bonus+=5;
                foreach(var item in fabrics)
                {
                    if ( !(item.Equals(main_fabric)) && GreenMaterials.Contains(item.ToUpper()))
                    {
                        bonus+=10;
                    }
                    if ( !(item.Equals(main_fabric)) && YellowMaterials.Contains(item.ToUpper()))
                    {
                        bonus+=5;
                    }
                }
            }  
            return bonus;
        }

        [HttpPost("process-label")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ProcessLabel([FromForm] OcrUploadRequest request)
        {
            try
            {
             var file = request.File;

                if (file == null || file.Length == 0)
                    return BadRequest("File is not found or empty");

                using var content = new MultipartFormDataContent();
                using var stream = file.OpenReadStream();
                
                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

                content.Add(fileContent, "file", file.FileName);

                // Python'a gönder
                var response = await _http.PostAsync("/api/ocr/label", content);

                // Response'u kontrol et
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, new 
                    { 
                        error = "Python service error", 
                        details = errorBody 
                    });
                }

                var responseBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Python Response: " + responseBody);
                //Json parse et
                var labelResult = JsonSerializer.Deserialize<LabelOcrResponse>(
                    responseBody,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                if (labelResult == null || !labelResult.success)
                {
                    return BadRequest(new { error = "Label OCR failed", response = responseBody });
                }

                int bonus= CalculateBonusPoints(labelResult.data);

                return Ok(new
                {
                    materials= labelResult.data,
                    bonusPoints= bonus
                });

            }catch(Exception e)
            {
                return StatusCode(500, new{
                    error= e.Message,
                    stack= e.StackTrace //erroru daha detaylı veriyor
                });
            }
        }
        
    }
}