namespace TechGalaxySolutions.ResearchHub.Infrastructure.AI;

public static class PromptBuilder
{
    private static readonly Dictionary<string, string> DepartmentContexts = new()
    {
        ["Engineering"] = "Focus on innovative engineering solutions, systematic design, and quantitative analysis.",
        ["Computer Science"] = "Emphasize software development, algorithmic thinking, data structures, and computational models.",
        ["IT"] = "Focus on information technology systems, network infrastructure, cybersecurity, and enterprise solutions.",
        ["ECE"] = "Cover electronic circuits, communication systems, embedded systems, and signal processing.",
        ["EEE"] = "Address electrical power systems, renewable energy, control systems, and electrical machines.",
        ["Mechanical"] = "Include thermodynamics, fluid mechanics, solid mechanics, manufacturing processes, and design.",
        ["Civil"] = "Cover structural engineering, construction materials, geotechnical engineering, and transportation.",
        ["MBA"] = "Focus on business strategy, management theory, market analysis, and organizational behavior.",
        ["Medical"] = "Address clinical research, patient care, biomedical sciences, and healthcare delivery.",
        ["Dental"] = "Cover oral health, dental procedures, maxillofacial surgery, and dental materials.",
        ["Nursing"] = "Focus on patient care, nursing practice, healthcare systems, and health promotion.",
        ["Law"] = "Address legal theory, case analysis, statutory interpretation, and justice systems.",
        ["Arts"] = "Focus on creative expression, cultural theory, visual arts, and humanities research.",
    };

    private static readonly Dictionary<string, string> DifficultyContexts = new()
    {
        ["Beginner"] = "Foundation-level research suitable for undergraduate students.",
        ["Intermediate"] = "Moderate complexity suitable for graduate-level exploration.",
        ["Advanced"] = "High complexity requiring deep domain expertise and advanced methods.",
    };

    public static string BuildGeneratePrompt(GenerateContext ctx)
    {
        var deptContext = DepartmentContexts.GetValueOrDefault(ctx.ResearchArea, "");
        var diffContext = DifficultyContexts.GetValueOrDefault(ctx.Difficulty, "");

        return $@"You are a research proposal expert. Generate a comprehensive research proposal.

RESEARCH AREA: {ctx.ResearchArea}
KEYWORDS: {ctx.Keywords}
DIFFICULTY: {ctx.Difficulty} - {diffContext}
DURATION: {ctx.Duration}
{(string.IsNullOrEmpty(ctx.AdditionalContext) ? "" : $"ADDITIONAL CONTEXT: {ctx.AdditionalContext}")}

CONTEXT: {deptContext}

Generate the following sections with professional academic writing:

1. RESEARCH TITLE - A concise, descriptive title
2. ABSTRACT - 150-250 words summarizing the entire proposal
3. OBJECTIVES - 3-5 clear, measurable research objectives
4. PROBLEM STATEMENT - The research gap and why it matters
5. SCOPE - Boundaries and focus areas of the research
6. LITERATURE REVIEW - Key theories and existing work in the field
7. METHODOLOGY - Research approach, tools, techniques, and data collection
8. EXPECTED OUTCOME - What the research will produce
9. TIMELINE - Phased timeline matching the {ctx.Duration} duration
10. REQUIRED TOOLS - Software, hardware, and resources needed
11. EXPECTED RESULT - Specific deliverables and success criteria
12. FUTURE SCOPE - Extensions and further research directions
13. REFERENCES - 5-7 academic references in APA format

Format the response with clear section headers using ### markers. Each section should be 2-4 paragraphs of substantive academic content.";
    }

    public static string BuildImprovePrompt(string sectionName, string content, string improvementType, string researchArea)
    {
        var instruction = improvementType switch
        {
            "Improve" => "Improve the following section to be more academically rigorous, well-structured, and professionally written.",
            "Shorten" => "Condense the following section while preserving all key points. Make it more concise.",
            "Expand" => "Expand the following section with more detail, examples, and academic depth. Add 2-3 more paragraphs.",
            "RewriteAcademically" => "Rewrite the following section in formal academic language with proper scholarly tone.",
            "Grammar" => "Correct all grammar, spelling, and punctuation errors in the following section. Preserve the content.",
            "Citation" => "Add appropriate academic citation suggestions in [Author, Year] format throughout the text.",
            _ => "Improve the following section to be more academically rigorous."
        };

        return $@"You are an academic writing assistant for {researchArea} research.

{instruction}

SECTION: {sectionName}
RESEARCH AREA: {researchArea}

CONTENT TO IMPROVE:
{content}

Return only the improved version of the content. Maintain the same section header.";
    }

    public static string BuildRegeneratePrompt(string sectionName, string researchArea, string keywords)
    {
        return $@"You are a research proposal expert specializing in {researchArea}.

Regenerate the following section of a research proposal with completely new content:

SECTION: {sectionName}
RESEARCH AREA: {researchArea}
KEYWORDS: {keywords}

Write 2-4 paragraphs of substantive academic content for this section. Make it unique and not generic.
Return only the section content.";
    }
}

public class GenerateContext
{
    public string ResearchArea { get; set; } = string.Empty;
    public string Keywords { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "Medium";
    public string Duration { get; set; } = "6 Months";
    public string? AdditionalContext { get; set; }
}
