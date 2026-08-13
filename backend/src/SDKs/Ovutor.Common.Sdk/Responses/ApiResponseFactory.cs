namespace Ovutor.Common.Sdk.Responses;

public static class ApiResponseFactory
{
    public static ApiResponse<T> Ok<T>(T data, string message = "Request completed successfully.") =>
        new() { Message = message, Code = 200, Data = data };

    public static ApiResponse<T> Created<T>(T data, string message = "Created successfully.") =>
        new() { Message = message, Code = 201, Data = data };

    public static ApiResponse<T> BadRequest<T>(string message = "The request was invalid.") =>
        new() { Message = message, Code = 400 };

    public static ApiResponse<T> Unauthorized<T>(string message = "You are not authorized to do this.") =>
        new() { Message = message, Code = 401 };

    public static ApiResponse<T> Forbidden<T>(string message = "You don't have permission to do this.") =>
        new() { Message = message, Code = 403 };

    public static ApiResponse<T> NotFound<T>(string message = "We couldn't find what you're looking for.") =>
        new() { Message = message, Code = 404 };

    public static ApiResponse<T> Conflict<T>(string message = "This conflicts with existing data.") =>
        new() { Message = message, Code = 409 };

    public static ApiResponse<T> ValidationFail<T>(IEnumerable<ErrorResponse> errors, string message = "Please fix the highlighted fields.") =>
        new() { Message = message, Code = 422, Errors = errors };

    public static ApiResponse<T> InternalError<T>(string message = "Something went wrong on our end.") =>
        new() { Message = message, Code = 500 };
}

public static class ApiResponseExtensions
{
    public static ApiResponse<T> ToOkApiResponse<T>(this T data, string message = "Request completed successfully.") =>
        ApiResponseFactory.Ok(data, message);

    public static ApiResponse<T> ToCreatedApiResponse<T>(this T data, string message = "Created successfully.") =>
        ApiResponseFactory.Created(data, message);
}
