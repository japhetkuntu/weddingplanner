namespace Ovutor.Common.Sdk.Responses;

public interface IApiResponse<out T>
{
    string Message { get; }
    int Code { get; }
    string SubCode { get; }
    T? Data { get; }
    IEnumerable<ErrorResponse>? Errors { get; }
}
