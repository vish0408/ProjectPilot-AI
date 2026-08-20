using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ResearchCategoryService : IResearchCategoryService
{
    private static readonly (string Name, string Code, string Description, string DisciplineGroup)[] DefaultCategories =
    {
        // Computer Science & IT
        ("Artificial Intelligence", "AI", "Research in AI systems, reasoning, and autonomy", "Computer Science & IT"),
        ("Machine Learning", "ML", "Supervised, unsupervised and reinforcement learning", "Computer Science & IT"),
        ("Deep Learning", "DL", "Neural networks and deep architectures", "Computer Science & IT"),
        ("Generative AI & Large Language Models", "GENAI", "Generative models and LLM research", "Computer Science & IT"),
        ("Natural Language Processing", "NLP", "Language understanding and generation", "Computer Science & IT"),
        ("Computer Vision", "CV", "Visual perception and image understanding", "Computer Science & IT"),
        ("Data Science", "DS", "Data-driven modelling and analysis", "Computer Science & IT"),
        ("Big Data Analytics", "BDA", "Large-scale data processing and analytics", "Computer Science & IT"),
        ("Cybersecurity", "CSEC", "Security of systems, networks and data", "Computer Science & IT"),
        ("Network Security", "NSEC", "Secure network protocols and defences", "Computer Science & IT"),
        ("Cloud Computing", "CLOUD", "Cloud architectures and services", "Computer Science & IT"),
        ("Edge Computing", "EDGE", "Distributed computing at the edge", "Computer Science & IT"),
        ("Internet of Things (IoT)", "IOT", "Connected devices and embedded sensing", "Computer Science & IT"),
        ("Blockchain", "BLOCKCHAIN", "Distributed ledgers and Web3", "Computer Science & IT"),
        ("Distributed Systems", "DISTSYS", "Concurrent, distributed and parallel systems", "Computer Science & IT"),
        ("Software Engineering", "SE", "Software design, development and quality", "Computer Science & IT"),
        ("Human-Computer Interaction", "HCI", "Interaction design and usability", "Computer Science & IT"),
        ("Robotics", "ROBOTICS", "Robotic systems, control and autonomy", "Computer Science & IT"),
        ("Quantum Computing", "QC", "Quantum algorithms and systems", "Computer Science & IT"),
        ("Bioinformatics", "BIOINF", "Computational analysis of biological data", "Computer Science & IT"),
        ("Computer Networks", "CNET", "Network protocols, architectures and services", "Computer Science & IT"),
        ("Database Systems", "DB", "Data storage, querying and management", "Computer Science & IT"),
        ("Information Retrieval", "IR", "Search, ranking and knowledge retrieval", "Computer Science & IT"),
        ("Web Technologies", "WEB", "Web platforms, APIs and browsers", "Computer Science & IT"),
        ("Mobile Computing", "MOB", "Mobile platforms and pervasive computing", "Computer Science & IT"),
        ("AR / VR / XR", "XR", "Augmented, virtual and extended reality", "Computer Science & IT"),
        ("Digital Forensics", "DFORENSIC", "Forensic investigation of digital evidence", "Computer Science & IT"),
        ("High Performance Computing", "HPC", "Parallel and high-performance computation", "Computer Science & IT"),
        ("Green Computing", "GREEN", "Energy-efficient and sustainable computing", "Computer Science & IT"),

        // Engineering & Technology
        ("Electrical Engineering", "EE", "Electrical systems, circuits and power electronics", "Engineering & Technology"),
        ("Electronics & Communication", "ECE", "Electronic devices, circuits and communications", "Engineering & Technology"),
        ("VLSI & Embedded Systems", "VLSI", "Chip design and embedded computing", "Engineering & Technology"),
        ("Signal Processing", "SP", "Signal analysis and processing algorithms", "Engineering & Technology"),
        ("Power Systems", "PS", "Generation, transmission and distribution of power", "Engineering & Technology"),
        ("Renewable Energy", "RE", "Solar, wind and renewable energy systems", "Engineering & Technology"),
        ("Mechanical Engineering", "ME", "Mechanics, materials and machines", "Engineering & Technology"),
        ("Manufacturing Technology", "MFT", "Manufacturing processes and systems", "Engineering & Technology"),
        ("Mechatronics", "MECHTR", "Integrated mechanical and electronic systems", "Engineering & Technology"),
        ("Automotive Engineering", "AUTO", "Vehicle design and propulsion systems", "Engineering & Technology"),
        ("Civil Engineering", "CE", "Infrastructure, structures and construction", "Engineering & Technology"),
        ("Structural Engineering", "STRUCT", "Analysis and design of structures", "Engineering & Technology"),
        ("Construction Technology", "CONSTRUCT", "Construction methods, materials and management", "Engineering & Technology"),
        ("Environmental Engineering", "ENVENG", "Environmental protection and remediation technologies", "Engineering & Technology"),
        ("Chemical Engineering", "CHEM", "Chemical processes and process design", "Engineering & Technology"),
        ("Materials Science", "MATSCI", "Structure and properties of materials", "Engineering & Technology"),
        ("Nanotechnology", "NANO", "Nanoscale materials and devices", "Engineering & Technology"),
        ("Aerospace Engineering", "AERO", "Aircraft, spacecraft and propulsion", "Engineering & Technology"),
        ("Biomedical Engineering", "BME", "Engineering applied to medicine and biology", "Engineering & Technology"),
        ("Industrial Engineering", "IE", "Optimisation of processes and systems", "Engineering & Technology"),

        // Medical & Health Sciences
        ("Clinical Research", "CLIN", "Clinical trials and patient-based research", "Medical & Health Sciences"),
        ("Public Health", "PH", "Population health and health policy", "Medical & Health Sciences"),
        ("Epidemiology", "EPI", "Distribution and determinants of disease", "Medical & Health Sciences"),
        ("Medical Education", "MEDEDU", "Education and training of health professionals", "Medical & Health Sciences"),
        ("Healthcare Management", "HCM", "Administration and governance of healthcare", "Medical & Health Sciences"),
        ("Pharmacology", "PHARMA", "Drug action and therapeutics", "Medical & Health Sciences"),
        ("Pharmacy", "PHARMACY", "Pharmaceutical sciences and practice", "Medical & Health Sciences"),
        ("Nursing", "NURS", "Nursing science and practice", "Medical & Health Sciences"),
        ("Dentistry", "DENT", "Oral health and dental sciences", "Medical & Health Sciences"),
        ("Physiotherapy", "PHYSO", "Rehabilitation and physical therapy", "Medical & Health Sciences"),
        ("Medical Imaging", "MEDIMG", "Imaging modalities and analysis", "Medical & Health Sciences"),
        ("Pathology", "PATH", "Study and diagnosis of disease", "Medical & Health Sciences"),
        ("Microbiology", "MICRO", "Microorganisms and infectious agents", "Medical & Health Sciences"),
        ("Immunology", "IMM", "Immune system and host defence", "Medical & Health Sciences"),
        ("Oncology", "ONCO", "Cancer biology and treatment", "Medical & Health Sciences"),
        ("Cardiology", "CARDIO", "Heart and cardiovascular system", "Medical & Health Sciences"),
        ("Neurology", "NEURO", "Nervous system and neurological disorders", "Medical & Health Sciences"),
        ("Genetics", "GEN", "Heredity and gene function", "Medical & Health Sciences"),
        ("Molecular Medicine", "MOLMED", "Molecular mechanisms of disease", "Medical & Health Sciences"),
        ("Digital Health", "DIGHEALTH", "Digital technologies in healthcare", "Medical & Health Sciences"),
        ("Health Informatics", "HI", "Information systems for health", "Medical & Health Sciences"),

        // Life Sciences & Biotechnology
        ("Biotechnology", "BIOTECH", "Biological systems for products and processes", "Life Sciences & Biotechnology"),
        ("Molecular Biology", "MOLBIO", "Molecular basis of biological activity", "Life Sciences & Biotechnology"),
        ("Cell Biology", "CELLBIO", "Cell structure, function and physiology", "Life Sciences & Biotechnology"),
        ("Genetics & Genomics", "GENOM", "Genome structure, function and variation", "Life Sciences & Biotechnology"),
        ("Microbiology", "MICROBIO", "Microbial biology and applications", "Life Sciences & Biotechnology"),
        ("Biochemistry", "BIOCHEM", "Chemical processes in living organisms", "Life Sciences & Biotechnology"),
        ("Bioinformatics & Computational Biology", "BIOCOMP", "Computational analysis of biological systems", "Life Sciences & Biotechnology"),
        ("Neuroscience", "NEUROSCI", "Structure and function of the nervous system", "Life Sciences & Biotechnology"),
        ("Ecology", "ECOL", "Interactions between organisms and environment", "Life Sciences & Biotechnology"),
        ("Environmental Biology", "ENVBIO", "Biological responses to environmental change", "Life Sciences & Biotechnology"),
        ("Agricultural Biotechnology", "AGRIBIO", "Biotechnology in agriculture", "Life Sciences & Biotechnology"),
        ("Plant Science", "PLANT", "Plant biology, physiology and breeding", "Life Sciences & Biotechnology"),
        ("Animal Science", "ANIMAL", "Animal biology and production systems", "Life Sciences & Biotechnology"),
        ("Food Science & Technology", "FOOD", "Food composition, safety and processing", "Life Sciences & Biotechnology"),

        // Physical & Mathematical Sciences
        ("Physics", "PHYS", "Fundamental laws of matter and energy", "Physical & Mathematical Sciences"),
        ("Applied Physics", "APHYS", "Physics applied to technology", "Physical & Mathematical Sciences"),
        ("Chemistry", "CHEMSCI", "Composition, structure and reactions of matter", "Physical & Mathematical Sciences"),
        ("Applied Chemistry", "ACHEM", "Chemistry applied to industry and products", "Physical & Mathematical Sciences"),
        ("Mathematics", "MATH", "Pure mathematics and theory", "Physical & Mathematical Sciences"),
        ("Applied Mathematics", "AMATH", "Mathematics applied to real-world problems", "Physical & Mathematical Sciences"),
        ("Statistics", "STAT", "Data collection, analysis and inference", "Physical & Mathematical Sciences"),
        ("Operations Research", "OR", "Optimisation and decision science", "Physical & Mathematical Sciences"),
        ("Computational Science", "COMPS", "Numerical methods and scientific computing", "Physical & Mathematical Sciences"),
        ("Astronomy & Astrophysics", "ASTRO", "Celestial objects and the universe", "Physical & Mathematical Sciences"),
        ("Earth Science", "EARTH", "The solid earth and its processes", "Physical & Mathematical Sciences"),
        ("Environmental Science", "ENVSCI", "Interdisciplinary study of the environment", "Physical & Mathematical Sciences"),

        // Management & Commerce
        ("Business Administration", "BA", "General management and business operations", "Management & Commerce"),
        ("Finance", "FIN", "Financial markets, instruments and decisions", "Management & Commerce"),
        ("Accounting", "ACCT", "Measurement, reporting and assurance of financial information", "Management & Commerce"),
        ("Marketing", "MKT", "Value creation, communication and delivery", "Management & Commerce"),
        ("Human Resource Management", "HRM", "People management and organisational behaviour", "Management & Commerce"),
        ("Operations Management", "OPM", "Design and control of operations", "Management & Commerce"),
        ("Supply Chain Management", "SCM", "Flow of goods, services and information", "Management & Commerce"),
        ("Entrepreneurship", "ENTR", "New venture creation and innovation", "Management & Commerce"),
        ("International Business", "IB", "Cross-border business and global strategy", "Management & Commerce"),
        ("Business Analytics", "BANALYTICS", "Data-driven decision making in business", "Management & Commerce"),
        ("Economics", "ECON", "Production, distribution and consumption", "Management & Commerce"),
        ("Banking & Insurance", "BANKINS", "Financial intermediation and risk transfer", "Management & Commerce"),
        ("E-Commerce", "ECOM", "Online commerce and digital marketplaces", "Management & Commerce"),
        ("Organizational Behaviour", "OB", "Behaviour of individuals and groups in organisations", "Management & Commerce"),

        // Arts, Humanities & Social Sciences
        ("English & Literature", "ENG", "Literary studies and criticism", "Arts, Humanities & Social Sciences"),
        ("Linguistics", "LING", "Structure and use of language", "Arts, Humanities & Social Sciences"),
        ("History", "HIST", "Study of the past", "Arts, Humanities & Social Sciences"),
        ("Geography", "GEOG", "Human and physical geography", "Arts, Humanities & Social Sciences"),
        ("Sociology", "SOC", "Society, social structures and change", "Arts, Humanities & Social Sciences"),
        ("Psychology", "PSY", "Mind, behaviour and cognition", "Arts, Humanities & Social Sciences"),
        ("Political Science", "POLSCI", "Politics, governance and public affairs", "Arts, Humanities & Social Sciences"),
        ("Public Administration", "PUBADM", "Public policy and administration", "Arts, Humanities & Social Sciences"),
        ("Philosophy", "PHIL", "Fundamental questions of knowledge and existence", "Arts, Humanities & Social Sciences"),
        ("Anthropology", "ANTHRO", "Human societies and cultures", "Arts, Humanities & Social Sciences"),
        ("Social Work", "SOCW", "Social welfare and professional practice", "Arts, Humanities & Social Sciences"),
        ("Journalism & Mass Communication", "JMC", "Media, journalism and communication", "Arts, Humanities & Social Sciences"),
        ("Education", "EDUC", "Teaching, learning and educational systems", "Arts, Humanities & Social Sciences"),
        ("Law", "LAW", "Legal systems, rules and justice", "Arts, Humanities & Social Sciences"),
        ("Cultural Studies", "CULT", "Culture, identity and meaning", "Arts, Humanities & Social Sciences"),
        ("Gender Studies", "GENDER", "Gender, sexuality and society", "Arts, Humanities & Social Sciences"),
        ("Development Studies", "DEV", "Economic and social development", "Arts, Humanities & Social Sciences"),

        // Interdisciplinary & Emerging Research
        ("Sustainability", "SUST", "Sustainable development and practices", "Interdisciplinary & Emerging Research"),
        ("Climate Change", "CLIMATE", "Climate science, impacts and adaptation", "Interdisciplinary & Emerging Research"),
        ("Smart Cities", "SMARTCITY", "Urban systems and intelligent infrastructure", "Interdisciplinary & Emerging Research"),
        ("Industry 4.0 / 5.0", "IND40", "Digitised, intelligent and human-centric industry", "Interdisciplinary & Emerging Research"),
        ("Digital Transformation", "DIGITRANS", "Digital adoption across organisations", "Interdisciplinary & Emerging Research"),
        ("AI in Healthcare", "AIHEALTH", "Artificial intelligence for clinical care", "Interdisciplinary & Emerging Research"),
        ("AI in Education", "AIEDU", "Artificial intelligence for learning", "Interdisciplinary & Emerging Research"),
        ("FinTech", "FINTECH", "Technology-enabled financial services", "Interdisciplinary & Emerging Research"),
        ("AgriTech", "AGRITECH", "Technology for agriculture", "Interdisciplinary & Emerging Research"),
        ("EdTech", "EDTECH", "Technology for education", "Interdisciplinary & Emerging Research"),
        ("HealthTech", "HEALTHTECH", "Technology for health and wellbeing", "Interdisciplinary & Emerging Research"),
        ("Computational Social Science", "CSS", "Computational methods for social questions", "Interdisciplinary & Emerging Research"),
        ("Cognitive Science", "COGSCI", "Mind and intelligence across disciplines", "Interdisciplinary & Emerging Research"),
        ("Smart Agriculture", "SMARTAG", "Precision and digital agriculture", "Interdisciplinary & Emerging Research"),
        ("Autonomous Systems", "AUTOSYS", "Self-governing machines and agents", "Interdisciplinary & Emerging Research"),
        ("Renewable & Sustainable Technologies", "RST", "Clean technologies for sustainability", "Interdisciplinary & Emerging Research"),
        ("Other / Interdisciplinary", "OTHER", "Cross-disciplinary or emerging topics", "Interdisciplinary & Emerging Research"),
    };

    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ResearchCategoryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ResearchCategoryResponse>> GetCategoriesAsync()
    {
        await EnsureProvisionedAsync();

        var categories = await _context.Set<ResearchCategory>().AsNoTracking()
            .Include(c => c.ResearchTopics)
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return _mapper.Map<List<ResearchCategoryResponse>>(categories);
    }

    public async Task<ResearchCategoryResponse> CreateCategoryAsync(CreateResearchCategoryRequest request)
    {
        var disciplineGroup = string.IsNullOrWhiteSpace(request.DisciplineGroup) ? "Other / Interdisciplinary" : request.DisciplineGroup.Trim();

        var duplicate = await _context.Set<ResearchCategory>().AsNoTracking()
            .AnyAsync(c => c.Name == request.Name && c.DisciplineGroup == disciplineGroup && !c.IsDeleted);
        if (duplicate)
            throw new InvalidOperationException("A research category with this name already exists in this discipline group");

        var code = string.IsNullOrWhiteSpace(request.Code)
            ? GenerateCode(request.Name)
            : request.Code.Trim();

        var maxSort = await _context.Set<ResearchCategory>().AsNoTracking()
            .Where(c => !c.IsDeleted)
            .MaxAsync(c => (int?)c.SortOrder) ?? 0;

        var category = new ResearchCategory
        {
            Name = request.Name.Trim(),
            Code = code,
            Description = request.Description,
            DisciplineGroup = disciplineGroup,
            SortOrder = request.SortOrder > 0 ? request.SortOrder : maxSort + 1,
        };

        _context.Set<ResearchCategory>().Add(category);
        await _context.SaveChangesAsync();

        return _mapper.Map<ResearchCategoryResponse>(category);
    }

    public async Task<ResearchCategoryResponse> UpdateCategoryAsync(Guid id, UpdateResearchCategoryRequest request)
    {
        var category = await _context.Set<ResearchCategory>()
            .Include(c => c.ResearchTopics)
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Category not found");

        var disciplineGroup = string.IsNullOrWhiteSpace(request.DisciplineGroup) ? "Other / Interdisciplinary" : request.DisciplineGroup.Trim();

        var duplicate = await _context.Set<ResearchCategory>().AsNoTracking()
            .AnyAsync(c => c.Name == request.Name && c.DisciplineGroup == disciplineGroup && c.Id != id && !c.IsDeleted);
        if (duplicate)
            throw new InvalidOperationException("A research category with this name already exists in this discipline group");

        category.Name = request.Name.Trim();
        category.Code = string.IsNullOrWhiteSpace(request.Code) ? GenerateCode(request.Name) : request.Code.Trim();
        category.Description = request.Description;
        category.DisciplineGroup = disciplineGroup;
        category.SortOrder = request.SortOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<ResearchCategoryResponse>(category);
    }

    public async Task EnsureProvisionedAsync()
    {
        var existing = await _context.Set<ResearchCategory>().AsNoTracking()
            .Where(c => !c.IsDeleted)
            .Select(c => new { c.Name, c.DisciplineGroup })
            .ToListAsync();

        var changed = false;
        for (var i = 0; i < DefaultCategories.Length; i++)
        {
            var (name, code, description, disciplineGroup) = DefaultCategories[i];
            if (existing.Any(e => e.Name == name && e.DisciplineGroup == disciplineGroup))
                continue;

            _context.Set<ResearchCategory>().Add(new ResearchCategory
            {
                Name = name,
                Code = code,
                Description = description,
                DisciplineGroup = disciplineGroup,
                SortOrder = i + 1,
            });
            changed = true;
        }

        if (changed)
            await _context.SaveChangesAsync();
    }

    private static string GenerateCode(string name)
    {
        var cleaned = new string(name.Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());
        return cleaned.Length > 24 ? cleaned[..24] : cleaned;
    }
}
