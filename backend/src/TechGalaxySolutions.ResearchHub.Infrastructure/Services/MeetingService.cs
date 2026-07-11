using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Meeting;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class MeetingService : IMeetingService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public MeetingService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<MeetingResponse>> GetMyMeetingsAsync(Guid userId)
    {
        var meetings = await _context.Set<Meeting>().AsNoTracking()
            .Include(m => m.Guide)
            .Include(m => m.Participants).ThenInclude(p => p.User)
            .Where(m => (m.GuideId == userId || m.Participants.Any(p => p.UserId == userId)) && !m.IsDeleted)
            .OrderByDescending(m => m.ScheduledAt)
            .ToListAsync();

        return _mapper.Map<List<MeetingResponse>>(meetings);
    }

    public async Task<MeetingResponse> GetByIdAsync(Guid meetingId)
    {
        var meeting = await _context.Set<Meeting>().AsNoTracking()
            .Include(m => m.Guide)
            .Include(m => m.Participants).ThenInclude(p => p.User)
            .FirstOrDefaultAsync(m => m.Id == meetingId && !m.IsDeleted)
            ?? throw new KeyNotFoundException("Meeting not found");

        return _mapper.Map<MeetingResponse>(meeting);
    }

    public async Task<MeetingResponse> CreateAsync(Guid guideId, CreateMeetingRequest request)
    {
        var meeting = new Meeting
        {
            GuideId = guideId,
            Title = request.Title,
            Description = request.Description,
            ScheduledAt = request.ScheduledAt,
            DurationMinutes = request.DurationMinutes,
            Agenda = request.Agenda,
            MeetingLink = request.MeetingLink,
            Status = MeetingStatus.Scheduled,
        };

        _context.Set<Meeting>().Add(meeting);

        foreach (var participantId in request.ParticipantIds)
        {
            _context.Set<MeetingParticipant>().Add(new MeetingParticipant
            {
                MeetingId = meeting.Id,
                UserId = participantId,
            });
        }

        await _context.SaveChangesAsync();

        return await GetByIdAsync(meeting.Id);
    }

    public async Task<MeetingResponse> UpdateAsync(Guid meetingId, Guid userId, UpdateMeetingRequest request)
    {
        var meeting = await _context.Set<Meeting>()
            .Include(m => m.Guide)
            .Include(m => m.Participants).ThenInclude(p => p.User)
            .FirstOrDefaultAsync(m => m.Id == meetingId && !m.IsDeleted)
            ?? throw new KeyNotFoundException("Meeting not found");

        if (meeting.GuideId != userId)
            throw new UnauthorizedAccessException("Only the meeting organizer can update");

        meeting.Title = request.Title;
        meeting.Description = request.Description;
        meeting.ScheduledAt = request.ScheduledAt;
        meeting.DurationMinutes = request.DurationMinutes;
        meeting.Agenda = request.Agenda;
        meeting.MeetingNotes = request.MeetingNotes;
        meeting.MeetingLink = request.MeetingLink;
        meeting.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(request.Status))
            meeting.Status = Enum.Parse<MeetingStatus>(request.Status);

        await _context.SaveChangesAsync();

        return _mapper.Map<MeetingResponse>(meeting);
    }

    public async Task DeleteAsync(Guid meetingId, Guid userId)
    {
        var meeting = await _context.Set<Meeting>()
            .FirstOrDefaultAsync(m => m.Id == meetingId && !m.IsDeleted)
            ?? throw new KeyNotFoundException("Meeting not found");

        if (meeting.GuideId != userId)
            throw new UnauthorizedAccessException("Only the meeting organizer can delete");

        meeting.IsDeleted = true;
        meeting.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
