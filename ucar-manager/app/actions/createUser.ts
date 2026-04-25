'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const USER_ROLE_OPTIONS = [
  'super_admin',
  'org_admin',
  'finance_manager',
  'hr_manager',
  'academic_manager',
  'research_manager',
  'partnerships_manager',
  'esg_manager',
  'infrastructure_manager',
  'viewer',
] as const

const SUPER_ADMIN_CREATABLE_ROLES = USER_ROLE_OPTIONS.filter((role) => role !== 'super_admin')
const ORG_ADMIN_CREATABLE_ROLES = USER_ROLE_OPTIONS.filter(
  (role) => role !== 'super_admin' && role !== 'org_admin',
)

type UserRole = (typeof USER_ROLE_OPTIONS)[number]
type BasicOption = { id: string; name: string }
type OperatorContext = {
  role: string
  organization_id: string | null
  institution_id: string | null
}

// Initialize the Admin client using the Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false // Critical: Don't mess up the super-admin's current session
    }
  }
)

async function getCurrentOperator() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, role: null }
  }

  const { data: usersRow } = await supabaseAdmin
    .from('users')
    .select('role, organization_id, institution_id')
    .eq('id', user.id)
    .maybeSingle()

  if (usersRow?.role) {
    return {
      user,
      role: usersRow.role as string,
      organization_id: usersRow.organization_id ?? null,
      institution_id: usersRow.institution_id ?? null,
    }
  }

  const { data: profilesRow } = await supabaseAdmin
    .from('profiles')
    .select('role, organization_id, institution_id')
    .eq('id', user.id)
    .maybeSingle()

  return {
    user,
    role: profilesRow?.role ?? null,
    organization_id: profilesRow?.organization_id ?? null,
    institution_id: profilesRow?.institution_id ?? null,
  }
}

function getCreatableRoles(operatorRole: string | null): readonly UserRole[] {
  if (operatorRole === 'super_admin') {
    return SUPER_ADMIN_CREATABLE_ROLES
  }

  if (operatorRole === 'org_admin') {
    return ORG_ADMIN_CREATABLE_ROLES
  }

  return []
}

function canCreateUsers(operator: OperatorContext) {
  return operator.role === 'super_admin' || operator.role === 'org_admin'
}

export async function getUserCreationFormData() {
  try {
    const { user, role, organization_id, institution_id } = await getCurrentOperator()

    if (!user || !canCreateUsers({ role: role ?? '', organization_id, institution_id })) {
      return {
        success: false,
        error: 'Only super-admin or admin can create users.',
      }
    }

    const roles = getCreatableRoles(role)

    if (role === 'org_admin') {
      let institutionName: string | null = null

      if (institution_id) {
        const { data: institutionRow } = await supabaseAdmin
          .from('institutions')
          .select('name')
          .eq('id', institution_id)
          .maybeSingle()

        institutionName = institutionRow?.name ?? null
      }

      return {
        success: true,
        organizations: [] as BasicOption[],
        institutions: [] as Array<BasicOption & { organization_id: string }>,
        roles,
        operatorRole: role,
        operatorOrganizationId: organization_id,
        operatorInstitutionId: institution_id,
        operatorInstitutionName: institutionName,
      }
    }

    const { data: organizations, error: orgError } = await supabaseAdmin
      .from('organization')
      .select('id, name')
      .order('name', { ascending: true })

    if (orgError) throw new Error(orgError.message)

    const { data: institutions, error: instError } = await supabaseAdmin
      .from('institutions')
      .select('id, name, organization_id')
      .order('name', { ascending: true })

    if (instError) throw new Error(instError.message)

    return {
      success: true,
      organizations: (organizations ?? []) as BasicOption[],
      institutions: (institutions ?? []) as Array<BasicOption & { organization_id: string }>,
      roles,
      operatorRole: role,
      operatorOrganizationId: organization_id,
      operatorInstitutionId: institution_id,
      operatorInstitutionName: null,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? 'Failed to load form data.',
    }
  }
}

export async function createInstitutionUser(formData: FormData) {
  const {
    user,
    role: operatorRole,
    organization_id: operatorOrganizationId,
    institution_id: operatorInstitutionId,
  } = await getCurrentOperator()

  if (!user || !canCreateUsers({ role: operatorRole ?? '', organization_id: operatorOrganizationId, institution_id: operatorInstitutionId })) {
    return { success: false, error: 'Only super-admin or admin can create users.' }
  }

  // 1. Extract data from the form
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const targetRole = formData.get('role') as UserRole

  const roles = getCreatableRoles(operatorRole)

  const orgId = operatorRole === 'org_admin'
    ? operatorOrganizationId
    : (formData.get('organization_id') as string)

  const instId = operatorRole === 'org_admin'
    ? operatorInstitutionId
    : (formData.get('institution_id') as string)

  if (!email || !password || !fullName || !orgId || !targetRole) {
    return { success: false, error: 'Please fill all required fields.' }
  }

  if (!USER_ROLE_OPTIONS.includes(targetRole)) {
    return { success: false, error: 'Role is not valid.' }
  }

  if (!roles.includes(targetRole)) {
    return { success: false, error: 'You are not allowed to create this role.' }
  }

  if (!instId) {
    return { success: false, error: 'Institution is required for this role.' }
  }

  try {
    // 2. Create the user in Supabase Auth (auth.users)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Auto-confirm the email since super-admin is creating it
    })

    if (authError) throw new Error(authError.message)

    const basePayload = {
      id: authData.user.id,
      full_name: fullName,
      role: targetRole,
      organization_id: orgId,
      institution_id: instId ? instId : null,
      is_active: true,
    }

    // 3. Insert the row into your public user table using the generated auth ID
    let profileError: Error | null = null

    const { error: usersInsertError } = await supabaseAdmin
      .from('users')
      .insert(basePayload)

    if (!usersInsertError) {
      return { success: true, message: 'User created successfully!' }
    }

    // Fallback for environments where the rename migration has not been applied yet.
    const { error: profilesInsertError } = await supabaseAdmin
      .from('profiles')
      .insert(basePayload)

    if (profilesInsertError) {
      profileError = new Error(profilesInsertError.message)
    }

    if (profileError) {
      // Optional but recommended: Rollback auth user creation if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(profileError.message)
    }

    return { success: true, message: 'User created successfully!' }
    
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}