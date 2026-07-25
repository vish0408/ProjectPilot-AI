using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using UglyToad.PdfPig;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public static class LiteratureDocumentParser
{
    public static DocumentParseResult Parse(string content, string fileName, string fileType)
    {
        var result = new DocumentParseResult
        {
            FileName = fileName,
            FileType = fileType,
            ExtractedText = content,
        };

        var lowerType = fileType?.ToLowerInvariant() ?? "";
        var lowerName = fileName?.ToLowerInvariant() ?? "";

        if (lowerType.Contains("pdf") || lowerName.EndsWith(".pdf"))
        {
            result.ExtractedText = ExtractTextFromPdf(content);
        }
        else if (lowerType.Contains("docx") || lowerName.EndsWith(".docx"))
        {
            result.ExtractedText = ExtractTextFromDocx(content);
        }

        if (string.IsNullOrWhiteSpace(result.ExtractedText))
            return result;

        ParseMetadata(result, result.ExtractedText);
        return result;
    }

    private static string ExtractTextFromPdf(string base64OrRawContent)
    {
        try
        {
            byte[] bytes;
            if (IsBase64String(base64OrRawContent))
                bytes = Convert.FromBase64String(base64OrRawContent);
            else
                bytes = Encoding.UTF8.GetBytes(base64OrRawContent);

            using var pdf = PdfDocument.Open(bytes);
            var sb = new StringBuilder();
            foreach (var page in pdf.GetPages())
            {
                sb.AppendLine(page.Text);
            }
            return sb.ToString();
        }
        catch
        {
            return base64OrRawContent;
        }
    }

    private static string ExtractTextFromDocx(string base64OrRawContent)
    {
        try
        {
            byte[] bytes;
            if (IsBase64String(base64OrRawContent))
                bytes = Convert.FromBase64String(base64OrRawContent);
            else
                bytes = Encoding.UTF8.GetBytes(base64OrRawContent);

            using var stream = new MemoryStream(bytes);
            using var package = DocumentFormat.OpenXml.Packaging.WordprocessingDocument.Open(stream, false);
            var body = package.MainDocumentPart?.Document?.Body;
            if (body is null) return base64OrRawContent;

            var sb = new StringBuilder();
            foreach (var para in body.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>())
            {
                sb.AppendLine(para.InnerText);
            }
            return sb.ToString();
        }
        catch
        {
            return base64OrRawContent;
        }
    }

    private static void ParseMetadata(DocumentParseResult result, string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return;

        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (trimmed.Length > 10 && trimmed.Length < 300 && !trimmed.StartsWith('#'))
            {
                result.Title = trimmed.TrimStart('#', ' ', '\t');
                break;
            }
        }

        var doiMatch = Regex.Match(text, @"10\.\d{4,}/[-._;()/:A-Za-z0-9]+", RegexOptions.IgnoreCase);
        if (doiMatch.Success) result.Doi = doiMatch.Value;

        var yearMatch = Regex.Match(text, @"\b(19|20)\d{2}\b");
        if (yearMatch.Success) result.PublicationYear = int.Parse(yearMatch.Value);

        var lowerText = text.ToLowerInvariant();
        var abstractMatch = Regex.Match(lowerText, @"abstract[:\s]*(.*?)(?=\n\s*(?:introduction|keywords|1\.|i\.|##))", RegexOptions.Singleline);
        if (abstractMatch.Success) result.Abstract = abstractMatch.Groups[1].Value.Trim();

        var refIndex = lowerText.LastIndexOf("references");
        if (refIndex >= 0)
        {
            var refContent = text[(refIndex + 10)..].Trim();
            result.References = refContent.Length > 5000 ? refContent[..5000] : refContent;
        }

        if (Regex.IsMatch(text, @"(proceedings|conference|symposium|workshop)", RegexOptions.IgnoreCase))
            result.Conference = ExtractNearMatch(text, "proceedings|conference|symposium|workshop");

        var journalMatch = Regex.Match(text, @"(journal|transactions|annals|review|quarterly)\s+of\s+[A-Z][a-z]+", RegexOptions.IgnoreCase);
        if (journalMatch.Success) result.Journal = journalMatch.Value;

        var authorPattern = @"([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)\s*(?:,|\band\b)";
        var authorMatches = Regex.Matches(text, authorPattern);
        if (authorMatches.Count > 0)
        {
            var authors = authorMatches.Select(m => m.Groups[1].Value).Distinct().Take(5);
            result.Authors = string.Join(", ", authors);
        }

        var sectionMatches = Regex.Matches(text, @"^#{1,3}\s+(.+)$|^([A-Z][A-Z\s]+)$", RegexOptions.Multiline);
        if (sectionMatches.Count > 0)
        {
            var sections = sectionMatches
                .Select(m => (m.Groups[1].Success ? m.Groups[1].Value : m.Groups[2].Value).Trim())
                .Where(s => s.Length > 2).Distinct().ToList();
            result.Sections = string.Join("\n", sections);
        }
    }

    private static string ExtractNearMatch(string content, string pattern)
    {
        var match = Regex.Match(content, pattern, RegexOptions.IgnoreCase);
        if (!match.Success) return string.Empty;
        var start = Math.Max(0, match.Index - 50);
        var end = Math.Min(content.Length, match.Index + match.Length + 100);
        return content[start..end].Trim();
    }

    private static bool IsBase64String(string value)
    {
        if (string.IsNullOrEmpty(value) || value.Length % 4 != 0) return false;
        try { Convert.FromBase64String(value); return true; }
        catch { return false; }
    }
}

public class DocumentParseResult
{
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string ExtractedText { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Authors { get; set; }
    public string? Abstract { get; set; }
    public string? Sections { get; set; }
    public string? References { get; set; }
    public string? Doi { get; set; }
    public int? PublicationYear { get; set; }
    public string? Conference { get; set; }
    public string? Journal { get; set; }
}
