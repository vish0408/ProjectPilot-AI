using TechGalaxySolutions.ResearchHub.Application.DTOs.Task;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface ITaskService
{
    Task<List<TaskItemResponse>> GetProjectTasksAsync(Guid projectId, Guid userId);
    Task<TaskItemResponse> GetByIdAsync(Guid taskId, Guid userId);
    Task<TaskItemResponse> CreateAsync(Guid projectId, Guid userId, CreateTaskItemRequest request);
    Task<TaskItemResponse> UpdateAsync(Guid taskId, Guid userId, UpdateTaskItemRequest request);
    Task DeleteAsync(Guid taskId, Guid userId);
}
