"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RawUploadCardProps = {
  institutionId: string;
  defaultDomain?: string;
};

type UploadApiResponse = {
  data?: {
    raw_upload?: {
      id?: string;
      storage_path?: string;
    };
  };
  error?: string;
};

type ExtractApiResponse = {
  data?: {
    status?: string;
    message?: string;
  };
  error?: string;
};

async function uploadRawFile(params: {
  file: File;
  institutionId: string;
  domain: string;
}) {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("institution_id", params.institutionId);
  formData.append("domain", params.domain);

  const response = await fetch("/api/uploads/raw", {
    method: "POST",
    body: formData,
  });

  const json = (await response.json()) as UploadApiResponse;

  if (!response.ok) {
    throw new Error(json.error ?? "Upload failed.");
  }

  const rawUploadId = json.data?.raw_upload?.id;
  if (!rawUploadId) {
    throw new Error("Upload succeeded but raw_upload id is missing.");
  }

  return {
    rawUploadId,
    storagePath: json.data?.raw_upload?.storage_path ?? null,
  };
}

async function queueExtraction(rawUploadId: string) {
  const response = await fetch("/api/ai/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw_upload_id: rawUploadId }),
  });

  const json = (await response.json()) as ExtractApiResponse;

  if (!response.ok) {
    throw new Error(json.error ?? "Failed to queue extraction.");
  }

  return {
    status: json.data?.status ?? "queued",
    message: json.data?.message ?? "Extraction queued.",
  };
}

export default function RawUploadCard({
  institutionId,
  defaultDomain = "research",
}: RawUploadCardProps) {
  const [domain, setDomain] = useState(defaultDomain);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const hasInstitutionId = institutionId.trim().length > 0;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    if (!hasInstitutionId) {
      setError("Missing institution context for this user.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadResult = await uploadRawFile({
        file,
        institutionId,
        domain,
      });

      const extractResult = await queueExtraction(uploadResult.rawUploadId);

      setSuccess(
        `File uploaded (id: ${uploadResult.rawUploadId}) and extraction ${extractResult.status}. ${extractResult.message}`,
      );
      setFile(null);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unexpected upload error.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Source File</CardTitle>
        <CardDescription>
          Upload to S3-backed storage, persist metadata in raw_uploads, then queue AI extraction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="institution-id">Institution ID</Label>
            <Input id="institution-id" value={institutionId} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="research"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-file">File</Label>
            <Input
              id="source-file"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}
          {!hasInstitutionId ? (
            <p className="text-sm text-red-600">
              Upload is disabled: no institution_id is associated with your account.
            </p>
          ) : null}

          <Button disabled={isSubmitting || !hasInstitutionId} type="submit">
            {isSubmitting ? "Uploading..." : "Upload and Queue Extraction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
