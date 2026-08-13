namespace Ovutor.Common.Sdk.Security;

public static class CredentialGenerator
{
    private static readonly string[] Words = ["Garden", "Harbor", "Meadow", "Amber", "Willow", "Compass", "Lantern", "Orchard", "Sail", "Cedar"];
    private static readonly Random Random = new();

    /// <summary>Mock stand-in for a real backend generating a fresh temporary password on reset —
    /// same shape the frontend used to fabricate client-side.</summary>
    public static string GeneratePassword()
    {
        var word = Words[Random.Next(Words.Length)];
        var digits = Random.Next(100, 1000);
        return $"{word}!{digits}";
    }

    public static string Slugify(string partnerA, string partnerB)
    {
        var a = FirstNameSlug(partnerA);
        var b = FirstNameSlug(partnerB);
        return $"{a}-{b}";
    }

    private static string FirstNameSlug(string fullName)
    {
        var first = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "guest";
        return new string(first.ToLowerInvariant().Where(c => char.IsLetterOrDigit(c)).ToArray());
    }
}
