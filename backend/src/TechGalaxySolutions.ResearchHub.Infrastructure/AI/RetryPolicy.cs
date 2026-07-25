using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.Exceptions;

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
            catch (AiRateLimitException) when (attempt < maxRetries)
            {
                attempt++;
                logger.LogWarning(
                    "{OperationName} rate limited (429), retrying ({Attempt}/{MaxRetries})...",
                    operationName, attempt, maxRetries);
                if (attempt < maxRetries)
                {
                    var delay = TimeSpan.FromMilliseconds(Math.Pow(2, attempt) * 500);
                    await Task.Delay(delay, cancellationToken);
                }
            }
            catch (AiException ex) when (attempt < maxRetries && IsServerError(ex.HttpStatusCode))
            {
                attempt++;
                logger.LogWarning(
                    "{OperationName} server error {Status}, retrying ({Attempt}/{MaxRetries})...",
                    operationName, ex.HttpStatusCode, attempt, maxRetries);
                if (attempt < maxRetries)
                {
                    var delay = TimeSpan.FromMilliseconds(Math.Pow(2, attempt) * 200);
                    await Task.Delay(delay, cancellationToken);
                }
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

    private static bool IsServerError(int? statusCode) => statusCode switch
    {
        500 or 502 or 503 or 504 => true,
        _ => false,
    };
}
