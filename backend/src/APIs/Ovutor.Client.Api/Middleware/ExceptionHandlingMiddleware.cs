using System.Text.Json;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Client.Api.Middleware;

/// <summary>Catches OvutorException and translates it straight into the ApiResponse envelope so every
/// error — expected or not — comes back in the same shape the frontend's httpClient already unwraps.</summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (OvutorException ex)
        {
            logger.LogWarning(ex, "[ExceptionHandlingMiddleware] Handled {StatusCode}: {Message}", ex.StatusCode, ex.Message);
            await WriteResponse(context, ex.StatusCode, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[ExceptionHandlingMiddleware] Unhandled exception");
            await WriteResponse(context, 500, "Something went wrong on our end.");
        }
    }

    private static async Task WriteResponse(HttpContext context, int statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;
        var body = new ApiResponse<object> { Message = message, Code = statusCode };
        await context.Response.WriteAsync(JsonSerializer.Serialize(body, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }
}
