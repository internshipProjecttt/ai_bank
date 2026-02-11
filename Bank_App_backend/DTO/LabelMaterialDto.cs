using System.Text.Json.Serialization;

namespace Bank_App.DTO
{
    public class LabelMaterialDto
    {
        [JsonPropertyName("KUMAŞ_KOMPOZİSYONU")]
        public List<string> Fabrics { get; set; }

        [JsonPropertyName("ANA_KUMAŞ")]
        public string MainFabric { get; set; }

    }
}