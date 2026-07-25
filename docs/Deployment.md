# ResearchHub AI — Deployment

## Prerequisites

- .NET 10 SDK
- Node.js 20+
- SQL Server 2022+ (or Azure SQL)
- IIS / Azure App Service / Docker

## Build

### Backend
```bash
cd backend
dotnet restore
dotnet build
dotnet publish -c Release -o ./publish
```

### Frontend
```bash
cd frontend/ResearchHubAI-refactored
npm install
npm run build
# Output: dist/
```

## Configuration

### appsettings.json (backend)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ResearchHubDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "your-256-bit-secret",
    "Issuer": "ResearchHubAI",
    "Audience": "ResearchHubAIClient",
    "ExpiryMinutes": 60
  },
  "AI": {
    "OpenAiKey": "",
    "AnthropicKey": "",
    "GeminiKey": ""
  }
}
```

### Database Migrations
```bash
# Apply migrations on deploy
dotnet ef database update --project src/TechGalaxySolutions.ResearchHub.Infrastructure --startup-project src/TechGalaxySolutions.ResearchHub.Api
```

Or set `DbInitializer.SeedAsync` to auto-migrate on startup (already in Program.cs).

## Deployment Checklist

- [ ] Connection string points to production SQL Server
- [ ] JWT secret is a strong, unique value (not default)
- [ ] JWT secret stored in Key Vault or environment variable
- [ ] CORS origin points to production frontend URL
- [ ] HTTPS enforced (already in non-Development config)
- [ ] AutoMapper vulnerability (NU1903) resolved by upgrading to 13.x+
- [ ] Database firewall allows app IP
- [ ] Backup directory has write permissions for the app pool
- [ ] Frontend env variables set (VITE_API_URL)
