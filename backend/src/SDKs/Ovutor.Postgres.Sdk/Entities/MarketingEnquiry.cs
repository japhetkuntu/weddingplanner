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
    public bool IsRead { get; set; }
}
