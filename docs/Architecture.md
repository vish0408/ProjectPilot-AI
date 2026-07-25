# ResearchHub AI — Architecture

## Overview

ResearchHub AI is a research management platform built with a **React (Vite) + ASP.NET Core 10** stack. It follows Clean Architecture with Domain, Application, Infrastructure, and API layers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Recharts |
| Backend | ASP.NET Core 10, Entity Framework Core 10 |
| Database | SQL Server (via EF Core) |
| Auth | JWT (Bearer tokens) |
| ORM | AutoMapper 12, EF Core 10 |
| AI | Multi-provider (OpenAI, Anthropic, Gemini) — excluded from current scope |

## Project Structure

```
backend/
  TechGalaxySolutions.ResearchHub.Domain/       — Entities, enums (no dependencies)
  TechGalaxySolutions.ResearchHub.Application/   — DTOs, interfaces, mapping profiles
  TechGalaxySolutions.ResearchHub.Infrastructure/— EF Core, services, AI providers
  TechGalaxySolutions.ResearchHub.Api/           — Controllers, middleware, Program.cs

frontend/
  ResearchHubAI-refactored/src/
    pages/              — Route-level page components (admin/, student/, hod/, guide/)
    components/         — Shared UI components (Card, Badge, StatCard, etc.)
    services/           — API client classes per domain
    types/              — TypeScript interfaces
    hooks/              — Custom React hooks
    context/            — React context (AppContext for auth state)
    routes/             — Per-role routing (AdminRouter, StudentRouter, etc.)
    utils/              — Navigation config, helpers
```

## Architecture Decisions

1. **Screen-based routing** (no URL router) — Navigation is driven by role + screen state
2. **Service layer pattern** — All API calls go through service classes, not direct fetch
3. **AutoMapper** for entity-to-DTO mapping (backend)
4. **AsNoTracking()** on all read queries for performance
5. **Soft deletes** via `IsDeleted` flag on all entities (inherited from BaseEntity)
6. **JWT auth** with role-based authorization on all controllers

## Roles

- **Super Admin** (superset of Admin)
- **Admin** — System-wide management (users, colleges, departments, settings)
- **HOD** — Department-level management (guides, students, reports)
- **Guide** — Student supervision, reviews, chapter comments
- **Student** — Project management, submissions, AI features
