namespace Ovutor.Cache.Sdk.Services;

public interface ICacheService
{
    Task SetAsync(string key, object value, TimeSpan? expiration = null);

    Task<T?> GetAsync<T>(string key);

    Task RemoveAsync(string key);

    Task<bool> ExistsAsync(string key);
}
