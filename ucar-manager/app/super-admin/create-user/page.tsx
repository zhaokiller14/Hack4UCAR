"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createInstitutionUser,
  getUserCreationFormData,
} from "@/app/actions/createUser";

type Role =
  | "super_admin"
  | "institution_admin"
  | "finance_manager"
  | "hr_manager"
  | "academic_manager"
  | "research_manager"
  | "partnerships_manager"
  | "esg_manager"
  | "infrastructure_manager"
  | "viewer";

type Organization = { id: string; name: string };
type Institution = { id: string; name: string; organization_id: string };

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  institution_admin: "Institution Admin",
  finance_manager: "Finance Manager",
  hr_manager: "HR Manager",
  academic_manager: "Academic Manager",
  research_manager: "Research Manager",
  partnerships_manager: "Partnerships Manager",
  esg_manager: "ESG Manager",
  infrastructure_manager: "Infrastructure Manager",
  viewer: "Viewer",
};

export default function CreateUserPage() {
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("viewer");

  const filteredInstitutions = useMemo(
    () =>
      institutions.filter(
        (institution) => institution.organization_id === selectedOrganizationId,
      ),
    [institutions, selectedOrganizationId],
  );

  useEffect(() => {
    const loadFormData = async () => {
      const result = await getUserCreationFormData();

      if (!result.success) {
        setStatus({
          type: "error",
          message: result.error || "Unable to load creation form data.",
        });
        setIsLoadingForm(false);
        return;
      }

      const orgs = result.organizations ?? [];
      setOrganizations(orgs);
      setInstitutions(result.institutions ?? []);
      const availableRoles = [...(result.roles ?? [])] as Role[];
      setRoles(availableRoles);
      setSelectedRole(availableRoles[0] ?? "viewer");
      setSelectedOrganizationId(orgs[0]?.id ?? "");
      setIsLoadingForm(false);
    };

    loadFormData();
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsCreating(true);
    setStatus({ type: null, message: "" });

    const result = await createInstitutionUser(formData);

    if (result.success) {
      setStatus({
        type: "success",
        message: result.message || "User created successfully!",
      });
    } else {
      setStatus({
        type: "error",
        message: result.error || "An error occurred",
      });
    }
    setIsCreating(false);
  }

  const institutionRequired = true;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100 mt-10">
      <h1 className="text-3xl font-bold text-[#1B4F6B] mb-6">
        Create Institution User
      </h1>

      {status.type === "success" && (
        <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-md">
          {status.message}
        </div>
      )}
      {status.type === "error" && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md">
          {status.message}
        </div>
      )}

      {isLoadingForm && (
        <div className="p-4 mb-6 bg-[#F7F6F3] text-[#0D2B3E] rounded-md">
          Loading form data...
        </div>
      )}

      {!isLoadingForm && (
        <form action={handleSubmit} className="space-y-4">
          {/* Auth Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1B4F6B] mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1B4F6B] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]"
              />
            </div>
          </div>

          {/* Profile Info matching your schema */}
          <div>
            <label className="block text-sm font-medium text-[#1B4F6B] mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              required
              className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1B4F6B] mb-1">
                Role
              </label>
              <select
                name="role"
                required
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1B4F6B] mb-1">
                Organization
              </label>
              <select
                name="organization_id"
                required
                value={selectedOrganizationId}
                onChange={(e) => setSelectedOrganizationId(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]"
              >
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B4F6B] mb-1">
              Institution
            </label>
            <select
              name="institution_id"
              required={institutionRequired}
              className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]"
              defaultValue=""
            >
              <option value="">Select institution</option>
              {filteredInstitutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full mt-6 px-6 py-3 bg-[#1B4F6B] text-white font-medium rounded hover:bg-[#153e54] disabled:opacity-50 transition-colors"
          >
            {isCreating ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
