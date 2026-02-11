using System.Text.Json.Serialization;

namespace Bank_App.DTO
{
    public class FabricMaterial
    {
        [JsonPropertyName("ORAN")]
        public string Percentage { get; set; }
        
        [JsonPropertyName("MALZEME")]
        public string Material { get; set; }
    }

    public class LabelMaterialDto
    {
        [JsonPropertyName("KUMAŞ_KOMPOZİSYONU")]
        public List<FabricMaterial> Fabrics { get; set; }

        [JsonPropertyName("ANA_KUMAŞ")]
        public FabricMaterial MainFabric { get; set; }
    }
}