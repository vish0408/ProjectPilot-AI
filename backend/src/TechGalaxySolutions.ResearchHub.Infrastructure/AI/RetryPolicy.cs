using Microsoft.Extensions.Logging;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.AI;

internal static class RetryPolicy
{
    public static async Task<T> ExecuteWithRetryAsync<T>(
        Func<Task<T>> operation,
        int maxRetries,
        ILogger logger,
        string operationName,
        CancellationToken cancellationToken = default)
    {
        var attempt = 0;
        while (true)
        {
            try
            {
                cancellationToken.ThrowIfCancellationRequested();
                return await operation();
            }
            catch (OperationCanceledException)
            {
                logger.LogWarning("{OperationName} was cancelled", operationName);
                throw;
            }
            catch (HttpRequestException ex) when (attempt < maxRetries)
            {
                attempt++;
                logger.LogWarning(ex,
                    "{OperationName} failed (attempt {Attempt}/{MaxRetries}), retrying...",
                    operationName, attempt, maxRetries);

                if (attempt < maxRetries)
                {
                    var delay = TimeSpan.FromMilliseconds(Math.Pow(2, attempt) * 200);
                    await Task.Delay(delay, cancellationToken);
                }
            }
        }
    }
}
