namespace Ovutor.Postgres.Sdk.Entities;

/// <summary>A submission from the studio's own public "Connect with Us" enquiry form — distinct
/// from an <see cref="RsvpGuest"/>, which belongs to one couple's wedding. These are studio-wide
/// leads an admin triages from the Admin Portal, not scoped to any <see cref="Client"/>.</summary>
public class MarketingEnquiry : BaseEntity
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? WeddingDate { get; set; }
    public string? Location { get; set; }
    public int? GuestCount { get; set; }
    public string? Budget { get; set; }
    public string? Message { get; set; }
    /// <summary>The second partner's name — <see cref="Name"/> holds the bride-to-be.</summary>
    public string? GroomName { get; set; }
    public string? ContactingFrom { get; set; }
    public bool? IsIntimate { get; set; }
    public bool? WantsConsultation { get; set; }
    public string? ConsultationAt { get; set; }
    public bool IsRead { get; set; }
}
