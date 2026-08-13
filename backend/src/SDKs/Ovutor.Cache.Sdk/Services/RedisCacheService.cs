using System.Text.Json;
using StackExchange.Redis;

namespace Ovutor.Cache.Sdk.Services;

public class RedisCacheService(IConnectionMultiplexer connectionMultiplexer) : ICacheService
{
    private IDatabase Database => connectionMultiplexer.GetDatabase();

    public Task SetAsync(string key, object value, TimeSpan? expiration = null) =>
        Database.StringSetAsync(key, JsonSerializer.Serialize(value), expiration);

    public async Task<T?> GetAsync<T>(string key)
    {
        var value = await Database.StringGetAsync(key);
        return value.HasValue ? JsonSerializer.Deserialize<T>(value!) : default;
    }

    public Task RemoveAsync(string key) => Database.KeyDeleteAsync(key);

    public Task<bool> ExistsAsync(string key) => Database.KeyExistsAsync(key);
}
