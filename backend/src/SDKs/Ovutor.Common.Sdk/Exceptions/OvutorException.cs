namespace Ovutor.Common.Sdk.Exceptions;

/// <summary>Base for exceptions the ExceptionHandlingMiddleware translates directly into an ApiResponse
/// envelope, instead of a generic 500.</summary>
public class OvutorException(string message, int statusCode = 400) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public class NotFoundException(string message = "We couldn't find what you're looking for.") : OvutorException(message, 404);

public class UnauthorizedException(string message = "You are not authorized to do this.") : OvutorException(message, 401);

public class ConflictException(string message = "This conflicts with existing data.") : OvutorException(message, 409);

public class ForbiddenException(string message = "You don't have permission to do this.") : OvutorException(message, 403);
