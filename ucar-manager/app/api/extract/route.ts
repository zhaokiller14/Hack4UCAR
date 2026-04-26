import { NextRequest, NextResponse } from "next/server";

// Types for the extraction API
export interface ExtractedKpi {
  key: string;
  label: string;
  value: string | number | null;
  unit?: string;
  confidence: number;
  needsReview: boolean;
  domain: string;
}

export interface ExtractionResponse {
  extractedData: ExtractedKpi[];
  fileName: string;
  fileType: string;
  processedAt: string;
}

// KPI definitions by domain
const KPI_DEFINITIONS: Record<
  string,
  Array<{ key: string; label: string; unit?: string; domain: string }>
> = {
  finance: [
    { key: "budget_allocated", label: "Budget Allocated", unit: "TND", domain: "finance" },
    { key: "budget_executed", label: "Budget Executed", unit: "TND", domain: "finance" },
    { key: "execution_rate", label: "Budget Execution Rate", unit: "%", domain: "finance" },
    { key: "revenue", label: "Total Revenue", unit: "TND", domain: "finance" },
    { key: "expenses", label: "Total Expenses", unit: "TND", domain: "finance" },
    { key: "surplus_deficit", label: "Surplus/Deficit", unit: "TND", domain: "finance" },
  ],
  academic: [
    { key: "total_students", label: "Total Students", domain: "academic" },
    { key: "success_rate", label: "Success Rate", unit: "%", domain: "academic" },
    { key: "average_grade", label: "Average Grade", domain: "academic" },
    { key: "dropout_rate", label: "Dropout Rate", unit: "%", domain: "academic" },
    { key: "absenteeism_rate", label: "Absenteeism Rate", unit: "%", domain: "academic" },
    { key: "graduation_rate", label: "Graduation Rate", unit: "%", domain: "academic" },
  ],
  hr: [
    { key: "total_staff", label: "Total Staff", domain: "hr" },
    { key: "faculty_count", label: "Faculty Members", domain: "hr" },
    { key: "admin_staff_count", label: "Administrative Staff", domain: "hr" },
    { key: "staff_turnover", label: "Staff Turnover Rate", unit: "%", domain: "hr" },
    { key: "training_hours", label: "Training Hours", domain: "hr" },
  ],
  infrastructure: [
    { key: "total_classrooms", label: "Total Classrooms", domain: "infrastructure" },
    { key: "lab_count", label: "Laboratories", domain: "infrastructure" },
    { key: "library_books", label: "Library Books", domain: "infrastructure" },
    { key: "computer_count", label: "Computers", domain: "infrastructure" },
    { key: "occupancy_rate", label: "Occupancy Rate", unit: "%", domain: "infrastructure" },
  ],
  research: [
    { key: "publications", label: "Publications", domain: "research" },
    { key: "research_grants", label: "Research Grants", unit: "TND", domain: "research" },
    { key: "phd_students", label: "PhD Students", domain: "research" },
    { key: "citations", label: "Citations", domain: "research" },
  ],
  partnerships: [
    { key: "international_partners", label: "International Partners", domain: "partnerships" },
    { key: "industry_partners", label: "Industry Partners", domain: "partnerships" },
    { key: "exchange_students", label: "Exchange Students", domain: "partnerships" },
    { key: "joint_programs", label: "Joint Programs", domain: "partnerships" },
  ],
  employment: [
    { key: "employment_rate", label: "Employment Rate", unit: "%", domain: "employment" },
    { key: "average_salary", label: "Average Starting Salary", unit: "TND", domain: "employment" },
    { key: "internship_rate", label: "Internship Rate", unit: "%", domain: "employment" },
  ],
  esg: [
    { key: "carbon_footprint", label: "Carbon Footprint", unit: "tCO2e", domain: "esg" },
    { key: "energy_consumption", label: "Energy Consumption", unit: "MWh", domain: "esg" },
    { key: "waste_recycling", label: "Waste Recycling Rate", unit: "%", domain: "esg" },
    { key: "social_impact_score", label: "Social Impact Score", domain: "esg" },
  ],
};

// Simulated AI extraction function
// In production, this would call your OCR/AI pipeline
async function simulateAIExtraction(
  fileName: string,
  fileType: string
): Promise<ExtractedKpi[]> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Detect domain from filename
  const fileNameLower = fileName.toLowerCase();
  let detectedDomain = "finance";

  if (fileNameLower.includes("academic") || fileNameLower.includes("grade") || fileNameLower.includes("student")) {
    detectedDomain = "academic";
  } else if (fileNameLower.includes("hr") || fileNameLower.includes("staff") || fileNameLower.includes("personnel")) {
    detectedDomain = "hr";
  } else if (fileNameLower.includes("infra") || fileNameLower.includes("facility") || fileNameLower.includes("building")) {
    detectedDomain = "infrastructure";
  } else if (fileNameLower.includes("research") || fileNameLower.includes("publication")) {
    detectedDomain = "research";
  } else if (fileNameLower.includes("partner") || fileNameLower.includes("collaboration")) {
    detectedDomain = "partnerships";
  } else if (fileNameLower.includes("employ") || fileNameLower.includes("career")) {
    detectedDomain = "employment";
  } else if (fileNameLower.includes("esg") || fileNameLower.includes("sustainability") || fileNameLower.includes("environment")) {
    detectedDomain = "esg";
  }

  const kpiDefs = KPI_DEFINITIONS[detectedDomain] || KPI_DEFINITIONS.finance;

  // Simulate extraction with varying confidence levels
  // Some fields will have low confidence to demonstrate human-in-the-loop validation
  return kpiDefs.map((kpi, index) => {
    // Simulate some fields being hard to read (low confidence)
    const isLowConfidence = index === 2 || index === 4;
    const confidence = isLowConfidence ? 0.3 + Math.random() * 0.3 : 0.8 + Math.random() * 0.2;

    // Generate mock values
    let value: string | number | null = null;
    if (kpi.unit === "TND") {
      value = Math.floor(Math.random() * 100000) + 10000;
    } else if (kpi.unit === "%") {
      value = Math.floor(Math.random() * 100);
    } else if (kpi.key === "average_grade") {
      value = (10 + Math.random() * 10).toFixed(2);
    } else {
      value = Math.floor(Math.random() * 1000) + 100;
    }

    // Simulate some fields not being found
    if (isLowConfidence && Math.random() > 0.5) {
      value = null;
    }

    return {
      key: kpi.key,
      label: kpi.label,
      value,
      unit: kpi.unit,
      confidence: Math.round(confidence * 100) / 100,
      needsReview: confidence < 0.7 || value === null,
      domain: kpi.domain,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type) && 
        !file.name.endsWith(".pdf") && 
        !file.name.endsWith(".csv") && 
        !file.name.endsWith(".xls") && 
        !file.name.endsWith(".xlsx")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, CSV, or Excel files." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Extract file info
    const fileName = file.name;
    const fileType = file.type || fileName.split(".").pop() || "unknown";

    // Run AI extraction (simulated)
    // In production, this would:
    // 1. Save file to temporary storage
    // 2. Call OCR service (e.g., Tesseract, Google Vision, Azure Form Recognizer)
    // 3. Parse extracted text with NLP/LLM to identify KPIs
    // 4. Return structured data
    const extractedData = await simulateAIExtraction(fileName, fileType);

    const response: ExtractionResponse = {
      extractedData,
      fileName,
      fileType,
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}