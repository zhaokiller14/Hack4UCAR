'use client'

import { useEffect, useState } from 'react'
import { createInstitutionUser, getUserCreationFormData } from '@/app/actions/createUser'

type Role =
  | 'super_admin'
  | 'org_admin'
  | 'finance_manager'
  | 'hr_manager'
  | 'academic_manager'
  | 'research_manager'
  | 'partnerships_manager'
  | 'esg_manager'
  | 'infrastructure_manager'
  | 'viewer'

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Organization Admin',
  finance_manager: 'Finance Manager',
  hr_manager: 'HR Manager',
  academic_manager: 'Academic Manager',
  research_manager: 'Research Manager',
  partnerships_manager: 'Partnerships Manager',
  esg_manager: 'ESG Manager',
  infrastructure_manager: 'Infrastructure Manager',
  viewer: 'Viewer',
}

export default function CreateUserPage() {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingForm, setIsLoadingForm] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role>('viewer')
  const [operatorInstitutionName, setOperatorInstitutionName] = useState<string | null>(null)

  useEffect(() => {
    const loadFormData = async () => {
      const result = await getUserCreationFormData()

      if (!result.success) {
        setStatus({
          type: 'error',
          message: result.error || 'Unable to load creation form data.',
        })
        setIsLoadingForm(false)
        return
      }

      const availableRoles = [...(result.roles ?? [])] as Role[]
      setRoles(availableRoles)
      setSelectedRole(availableRoles[0] ?? 'viewer')
      setOperatorInstitutionName((result as any).operatorInstitutionName ?? null)
      setIsLoadingForm(false)
    }

    loadFormData()
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsCreating(true)
    setStatus({ type: null, message: '' })
    
    const result = await createInstitutionUser(formData)
    
    if (result.success) {
      setStatus({ type: 'success', message: result.message || 'User created successfully!' })
    } else {
      setStatus({ type: 'error', message: result.error || 'An error occurred' })
    }
    setIsCreating(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100 mt-10">
      <h1 className="text-3xl font-bold text-[#1B4F6B] mb-6">Create Institution User</h1>
      
      {status.type === 'success' && <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-md">{status.message}</div>}
      {status.type === 'error' && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md">{status.message}</div>}

      {isLoadingForm && <div className="p-4 mb-6 bg-[#F7F6F3] text-[#0D2B3E] rounded-md">Loading form data...</div>}

      {!isLoadingForm && (
      <form action={handleSubmit} className="space-y-4">
        {/* Auth Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1B4F6B] mb-1">Email</label>
            <input type="email" name="email" required className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B4F6B] mb-1">Password</label>
            <input type="password" name="password" required className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]" />
          </div>
        </div>

        {/* Profile Info matching your schema */}
        <div>
          <label className="block text-sm font-medium text-[#1B4F6B] mb-1">Full Name</label>
          <input type="text" name="full_name" required className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]" />
        </div>

        <div>
          <div>
            <label className="block text-sm font-medium text-[#1B4F6B] mb-1">Role</label>
            <select
              name="role"
              required
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="w-full p-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E]"
            >
              {roles.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B4F6B] mb-1">Institution</label>
          <div className="w-full p-2.5 bg-[#F7F6F3] rounded-md text-[#0D2B3E]">
            {operatorInstitutionName ?? 'Same institution as your account'}
          </div>
          <p className="mt-1 text-xs text-[#1B4F6B]">Created users are automatically assigned to your institution.</p>
        </div>

        <button 
          type="submit" 
          disabled={isCreating}
          className="w-full mt-6 px-6 py-3 bg-[#1B4F6B] text-white font-medium rounded hover:bg-[#153e54] disabled:opacity-50 transition-colors"
        >
          {isCreating ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      )}
    </div>
  )
}