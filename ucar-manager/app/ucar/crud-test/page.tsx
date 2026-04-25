"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const tableOptions = ["institutions", "students", "staff"] as const;

const samplePayloads: Record<string, string> = {
  institutions: `{
  "organization_id": "00000000-0000-0000-0000-000000000000",
  "name": "Sample Institute",
  "code": "SAMPLE-01",
  "city": "Tunis",
  "president_name": "Dr. Example",
  "contact_email": "contact@example.edu"
}`,
  students: `{
  "institution_id": "00000000-0000-0000-0000-000000000000",
  "full_name": "Sample Student",
  "student_code": "STU-001",
  "email": "student@example.edu",
  "status": "active",
  "current_year": 1,
  "specialization": "Computer Science"
}`,
  staff: `{
  "institution_id": "00000000-0000-0000-0000-000000000000",
  "full_name": "Sample Staff",
  "role_type": "teaching",
  "employee_code": "EMP-001",
  "email": "staff@example.edu",
  "department": "Engineering",
  "contract_type": "permanent"
}`,
};

type ResponseState = {
  status: number;
  ok: boolean;
  durationMs: number;
  body: unknown | null;
};

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const defaultTable = "institutions";

export default function CrudTestPage() {
  const [table, setTable] = React.useState(defaultTable);
  const [recordId, setRecordId] = React.useState("");
  const [select, setSelect] = React.useState("*");
  const [order, setOrder] = React.useState("");
  const [limit, setLimit] = React.useState("25");
  const [offset, setOffset] = React.useState("0");
  const [ascending, setAscending] = React.useState(true);
  const [payload, setPayload] = React.useState(
    samplePayloads[defaultTable] ?? "{}",
  );
  const [lastRequest, setLastRequest] = React.useState<string | null>(null);
  const [response, setResponse] = React.useState<ResponseState | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const setSampleForTable = (nextTable: string) => {
    setTable(nextTable);
    setPayload(samplePayloads[nextTable] ?? "{}\n");
  };

  const buildListUrl = () => {
    const url = new URL(`/api/crud/${table}`, window.location.origin);

    if (select.trim()) {
      url.searchParams.set("select", select.trim());
    }

    if (limit.trim()) {
      url.searchParams.set("limit", limit.trim());
    }

    if (offset.trim()) {
      url.searchParams.set("offset", offset.trim());
    }

    if (order.trim()) {
      url.searchParams.set("order", order.trim());
    }

    if (!ascending) {
      url.searchParams.set("ascending", "false");
    }

    return url;
  };

  const buildItemUrl = (id: string) => {
    const url = new URL(`/api/crud/${table}/${id}`, window.location.origin);

    if (select.trim()) {
      url.searchParams.set("select", select.trim());
    }

    return url;
  };

  const parsePayload = () => {
    if (!payload.trim()) {
      setError("Payload is required for this request.");
      return null;
    }

    try {
      return JSON.parse(payload) as unknown;
    } catch {
      setError("Payload must be valid JSON.");
      return null;
    }
  };

  const sendRequest = async (
    method: HttpMethod,
    url: URL,
    body?: unknown,
  ) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setLastRequest(`${method} ${url.pathname}${url.search}`);

    const options: RequestInit = {
      method,
      credentials: "include",
    };

    if (body !== undefined) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }

    try {
      const start = performance.now();
      const res = await fetch(url.toString(), options);
      const durationMs = Math.round(performance.now() - start);
      const contentType = res.headers.get("content-type") ?? "";
      let bodyData: unknown | null = null;

      if (contentType.includes("application/json")) {
        bodyData = await res.json();
      } else {
        const text = await res.text();
        bodyData = text ? { text } : null;
      }

      setResponse({ status: res.status, ok: res.ok, durationMs, body: bodyData });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Request failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleList = () => sendRequest("GET", buildListUrl());

  const handleGetById = () => {
    const id = recordId.trim();

    if (!id) {
      setError("Record ID is required for GET by id.");
      return;
    }

    sendRequest("GET", buildItemUrl(id));
  };

  const handleCreate = () => {
    const body = parsePayload();

    if (body === null) {
      return;
    }

    const url = new URL(`/api/crud/${table}`, window.location.origin);
    sendRequest("POST", url, body);
  };

  const handleUpdate = () => {
    const id = recordId.trim();

    if (!id) {
      setError("Record ID is required for PATCH.");
      return;
    }

    const body = parsePayload();

    if (body === null) {
      return;
    }

    sendRequest("PATCH", buildItemUrl(id), body);
  };

  const handleDelete = () => {
    const id = recordId.trim();

    if (!id) {
      setError("Record ID is required for DELETE.");
      return;
    }

    sendRequest("DELETE", buildItemUrl(id));
  };

  const responseBody = response?.body
    ? JSON.stringify(response.body, null, 2)
    : "";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>CRUD Test Console</CardTitle>
          <CardDescription>
            Use this page to test the CRUD endpoints at /api/crud. You must be
            signed in and have permission to access the table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Samples include placeholder UUIDs. Replace them with real
            organization or institution IDs before submitting.
          </p>
          <div className="flex flex-wrap gap-2">
            {tableOptions.map((option) => (
              <Button
                key={option}
                type="button"
                variant={table === option ? "default" : "outline"}
                onClick={() => setSampleForTable(option)}
              >
                {option}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPayload("{}\n")}
            >
              Clear payload
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Configure query params and payload.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="table">Table</Label>
              <Input
                id="table"
                value={table}
                onChange={(event) => setTable(event.target.value.trim())}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="record-id">Record ID</Label>
              <Input
                id="record-id"
                placeholder="UUID for GET/PATCH/DELETE"
                value={recordId}
                onChange={(event) => setRecordId(event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="select">Select</Label>
                <Input
                  id="select"
                  placeholder="*"
                  value={select}
                  onChange={(event) => setSelect(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  placeholder="created_at"
                  value={order}
                  onChange={(event) => setOrder(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limit">Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  value={limit}
                  onChange={(event) => setLimit(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="offset">Offset</Label>
                <Input
                  id="offset"
                  type="number"
                  min={0}
                  value={offset}
                  onChange={(event) => setOffset(event.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ascending}
                  onChange={(event) => setAscending(event.target.checked)}
                />
                Ascending
              </label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payload">Payload (JSON)</Label>
              <textarea
                id="payload"
                className="min-h-[220px] w-full rounded-md border border-input bg-transparent p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleList} disabled={isLoading}>
                GET list
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleGetById}
                disabled={isLoading}
              >
                GET by id
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCreate}
                disabled={isLoading}
              >
                POST create
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleUpdate}
                disabled={isLoading}
              >
                PATCH update
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                DELETE
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              Status, timing, and response body from the API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            <div className="space-y-1 text-sm">
              <div className="font-medium">Last request</div>
              <div className="rounded-md border bg-muted/40 px-3 py-2">
                {lastRequest ?? "No requests yet."}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="font-medium">Result</div>
              <div className="rounded-md border bg-muted/40 px-3 py-2">
                {response
                  ? `${response.status} ${response.ok ? "OK" : "Error"} • ${response.durationMs}ms`
                  : "No response yet."}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="font-medium">Body</div>
              <pre className="max-h-[420px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                {responseBody || "No body."}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
