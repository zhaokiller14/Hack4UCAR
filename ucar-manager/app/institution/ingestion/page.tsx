"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Stepper } from "@/components/ui/stepper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiReviewForm } from "@/components/ingestion/KpiReviewForm";
import { SuccessScreen } from "@/components/ingestion/SuccessScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import type { ExtractedKpi } from "@/app/api/extract/route";

// Step definitions
const STEPS = [
  { step: 1, title: "Upload File", description: "Select your document" },
  { step: 2, title: "Configure", description: "Set period details" },
  { step: 3, title: "AI Processing", description: "Extract data" },
  { step: 4, title: "Review", description: "Validate extracted data" },
  { step: 5, title: "Commit", description: "Save to database" },
];

// Mock institution ID - in production, get from auth context
const MOCK_INSTITUTION_ID = "inst_001";

type PeriodType = "monthly" | "quarterly" | "annual";

export default function IngestionPage() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractedData, setExtractedData] = React.useState<ExtractedKpi[]>([]);
  const [validatedData, setValidatedData] = React.useState<ExtractedKpi[]>([]);
  const [isCommitting, setIsCommitting] = React.useState(false);
  const [ingestionComplete, setIngestionComplete] = React.useState(false);
  const [extractionError, setExtractionError] = React.useState<string | null>(null);

  // Period configuration state
  const [periodType, setPeriodType] = React.useState<PeriodType>("monthly");
  const [periodStart, setPeriodStart] = React.useState("");
  const [periodEnd, setPeriodEnd] = React.useState("");
  const [academicYear, setAcademicYear] = React.useState("");
  const [fiscalYear, setFiscalYear] = React.useState("");

  // Success data
  const [successData, setSuccessData] = React.useState({
    fileName: "",
    domainsUpdated: [] as string[],
    totalKpis: 0,
  });

  // Reset all state
  const resetIngestion = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setUploadError(null);
    setIsExtracting(false);
    setExtractedData([]);
    setValidatedData([]);
    setIsCommitting(false);
    setIngestionComplete(false);
    setExtractionError(null);
    setPeriodType("monthly");
    setPeriodStart("");
    setPeriodEnd("");
    setAcademicYear("");
    setFiscalYear("");
    setSuccessData({
      fileName: "",
      domainsUpdated: [],
      totalKpis: 0,
    });
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  // Navigate to step 2 (configure period)
  const handleNextToConfig = () => {
    if (selectedFile) {
      setCurrentStep(2);
    }
  };

  // Start AI extraction
  const handleStartExtraction = async () => {
    if (!selectedFile || !periodStart || !periodEnd) {
      setUploadError("Please fill in all required fields.");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setCurrentStep(3);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Extraction failed");
      }

      const { extractedData: data } = result.data;
      setExtractedData(data);
      setValidatedData([...data]); // Initialize validated data with extracted data

      // Move to review step after a brief delay to show processing completion
      setTimeout(() => {
        setIsExtracting(false);
        setCurrentStep(4);
      }, 1000);
    } catch (error) {
      setIsExtracting(false);
      setExtractionError(error instanceof Error ? error.message : "An error occurred during extraction");
      setCurrentStep(2); // Go back to config step
    }
  };

  // Handle KPI value changes in review form
  const handleKpiValueChange = (key: string, value: string | number | null) => {
    setValidatedData((prev) =>
      prev.map((kpi) => (kpi.key === key ? { ...kpi, value } : kpi))
    );
  };

  // Commit data to database
  const handleCommit = async () => {
    setIsCommitting(true);
    setCurrentStep(5);

    try {
      const response = await fetch("/api/ingest-commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer mock-token`, // In production, use real auth token
        },
        body: JSON.stringify({
          extractedData: validatedData,
          fileName: selectedFile?.name || "",
          periodStart,
          periodEnd,
          periodType,
          academicYear: academicYear || undefined,
          fiscalYear: fiscalYear || undefined,
          institutionId: MOCK_INSTITUTION_ID,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Commit failed");
      }

      setSuccessData({
        fileName: selectedFile?.name || "",
        domainsUpdated: result.domainsUpdated,
        totalKpis: result.totalKpis,
      });

      setIngestionComplete(true);
    } catch (error) {
      setExtractionError(error instanceof Error ? error.message : "An error occurred during commit");
      setCurrentStep(4); // Go back to review step
    } finally {
      setIsCommitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#0D2B3E] mb-2">
                Upload Your Document
              </h2>
              <p className="text-gray-600">
                Drag and drop your PDF, CSV, or Excel file containing KPI data.
              </p>
            </div>

            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              error={uploadError}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleNextToConfig}
                disabled={!selectedFile}
                className="gap-2 bg-[#1B4F6B] hover:bg-[#153e54]"
              >
                Next: Configure Period
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#0D2B3E] mb-2">
                Configure Period Details
              </h2>
              <p className="text-gray-600">
                Specify the time period for this data ingestion.
              </p>
            </div>

            {/* File preview */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1B4F6B]/5 border border-[#1B4F6B]/20">
              <FileText className="w-5 h-5 text-[#1B4F6B]" />
              <span className="text-sm font-medium text-[#0D2B3E]">
                {selectedFile?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="ml-auto text-gray-500"
              >
                Change file
              </Button>
            </div>

            {/* Period configuration form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Period Configuration</CardTitle>
                <CardDescription>
                  Define the reporting period for your KPI data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="periodType">Period Type *</Label>
                    <select
                      id="periodType"
                      value={periodType}
                      onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      placeholder="e.g., 2024-2025"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="periodStart">Period Start Date *</Label>
                    <Input
                      id="periodStart"
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="periodEnd">Period End Date *</Label>
                    <Input
                      id="periodEnd"
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fiscalYear">Fiscal Year</Label>
                    <Input
                      id="fiscalYear"
                      placeholder="e.g., 2024"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value)}
                    />
                  </div>
                </div>

                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleStartExtraction}
                disabled={!periodStart || !periodEnd}
                className="gap-2 bg-[#1B4F6B] hover:bg-[#153e54]"
              >
                Start AI Extraction
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <Loader2 className="w-16 h-16 text-[#1B4F6B]" />
              </motion.div>

              <h2 className="text-2xl font-bold text-[#0D2B3E] mb-2">
                Processing Your Document
              </h2>
              <p className="text-gray-600 mb-6">
                Our AI is extracting KPIs from your file. This may take a moment.
              </p>

              {/* Processing animation */}
              <div className="w-full max-w-md mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#1B4F6B]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Analyzing document structure...
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#0D2B3E] mb-2">
                Review Extracted Data
              </h2>
              <p className="text-gray-600">
                Verify the AI-extracted values and make corrections if needed.
              </p>
            </div>

            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1B4F6B]/5 border border-[#1B4F6B]/20">
              <FileText className="w-5 h-5 text-[#1B4F6B]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0D2B3E]">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {periodType} • {periodStart} to {periodEnd}
                </p>
              </div>
            </div>

            {/* KPI Review Form */}
            <Card>
              <CardContent className="pt-6">
                <KpiReviewForm
                  extractedData={extractedData}
                  onValueChange={handleKpiValueChange}
                />
              </CardContent>
            </Card>

            {extractionError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{extractionError}</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                disabled={isCommitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleCommit}
                disabled={isCommitting}
                className="gap-2 bg-[#1B4F6B] hover:bg-[#153e54]"
              >
                {isCommitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Committing...
                  </>
                ) : (
                  <>
                    Insert into Database
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mb-6"
              >
                <Loader2 className="w-16 h-16 text-green-500" />
              </motion.div>

              <h2 className="text-2xl font-bold text-[#0D2B3E] mb-2">
                Saving to Database
              </h2>
              <p className="text-gray-600">
                Your validated data is being committed to the database...
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // If ingestion is complete, show success screen
  if (ingestionComplete) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-6 md:p-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <SuccessScreen
              fileName={successData.fileName}
              domainsUpdated={successData.domainsUpdated}
              totalKpis={successData.totalKpis}
              onNewIngestion={resetIngestion}
              institutionId={MOCK_INSTITUTION_ID}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#0D2B3E] mb-2">
            Data Ingestion
          </h1>
          <p className="text-gray-600">
            Upload and process your institutional data for KPI tracking.
          </p>
        </motion.div>

        {/* Stepper */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Stepper steps={STEPS} currentStep={currentStep} />
          </CardContent>
        </Card>

        {/* Main content */}
        <AnimatePresence mode="wait">
          <Card>
            <CardContent className="pt-6">
              {renderStepContent()}
            </CardContent>
          </Card>
        </AnimatePresence>
      </div>
    </div>
  );
}