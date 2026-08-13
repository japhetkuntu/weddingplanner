namespace Ovutor.Common.Sdk.Responses;

/// <summary>Every endpoint in both APIs returns this same envelope shape, so the frontend has one
/// place (httpClient.ts) that knows how to unwrap success/failure instead of per-endpoint handling.</summary>
public class ApiResponse<T> : IApiResponse<T>
{
    public required string Message { get; init; }
    public required int Code { get; init; }
    public string SubCode { get; init; } = "0";
    public T? Data { get; init; }
    public IEnumerable<ErrorResponse>? Errors { get; init; }
}
