namespace Ovutor.Admin.Api.Models.Requests;

public record SetEnquiryReadRequest(bool IsRead);

public record ReplyToEnquiryRequest(string Subject, string Message);
