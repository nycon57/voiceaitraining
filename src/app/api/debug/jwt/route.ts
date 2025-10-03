import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface DebugStep {
  step: number
  name: string
  status: 'success' | 'failed' | 'not_found'
  data?: unknown
  params?: unknown
  query?: unknown
  recordCount?: number
  error?: unknown
  message?: string
}

interface DebugInfo {
  timestamp: string
  steps: DebugStep[]
}

/**
 * Debug endpoint to inspect JWT claims and RLS context
 *
 * This endpoint tests:
 * 1. Clerk authentication and user retrieval
 * 2. Supabase RPC call to set_user_and_org_claims
 * 3. User enrollments query with RLS
 * 4. Published scenarios query with RLS
 *
 * Usage: GET /api/debug/jwt
 */
export async function GET() {
  const debugInfo: DebugInfo = {
    timestamp: new Date().toISOString(),
    steps: [],
  }

  try {
    // Step 1: Get current user from Clerk
    console.log('[DEBUG] Debug endpoint - Step 1: Getting current user')
    const user = await getCurrentUser()

    if (!user) {
      debugInfo.steps = [
        {
          step: 1,
          name: 'getCurrentUser',
          status: 'failed',
          error: 'No authenticated user found',
        },
      ]
      return NextResponse.json({ success: false, ...debugInfo }, { status: 401 })
    }

    debugInfo.steps = [
      {
        step: 1,
        name: 'getCurrentUser',
        status: 'success',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          orgId: user.orgId,
          isPersonalOrg: user.isPersonalOrg,
          plan: user.plan,
        },
      },
    ]

    console.log('[DEBUG] Debug endpoint - User found:', user.id)

    // Step 2: Try to call set_user_and_org_claims RPC
    if (!user.orgId) {
      debugInfo.steps.push({
        step: 2,
        name: 'validateOrgId',
        status: 'failed',
        error: 'User has no orgId',
      })
      return NextResponse.json({ success: false, ...debugInfo }, { status: 400 })
    }

    console.log('[DEBUG] Debug endpoint - Step 2: Calling set_user_and_org_claims RPC')
    const supabase = await createClient()

    const rpcParams = {
      p_user_id: user.id,
      p_org_id: user.orgId,
    }

    console.log('[DEBUG] Debug endpoint - RPC parameters:', rpcParams)

    const { data: rpcData, error: rpcError } = await supabase.rpc('set_user_and_org_claims', rpcParams)

    if (rpcError) {
      console.error('[DEBUG] Debug endpoint - RPC failed:', rpcError)
      debugInfo.steps.push({
        step: 2,
        name: 'set_user_and_org_claims',
        status: 'failed',
        params: rpcParams,
        error: {
          message: rpcError.message,
          details: rpcError.details,
          hint: rpcError.hint,
          code: rpcError.code,
          fullError: JSON.stringify(rpcError, null, 2),
        },
      })
      return NextResponse.json({ success: false, ...debugInfo }, { status: 500 })
    }

    console.log('[DEBUG] Debug endpoint - RPC succeeded:', rpcData)
    debugInfo.steps.push({
      step: 2,
      name: 'set_user_and_org_claims',
      status: 'success',
      params: rpcParams,
      data: rpcData,
    })

    // Step 3: Try to query user_enrollments
    console.log('[DEBUG] Debug endpoint - Step 3: Querying user_enrollments')
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('org_id', user.orgId)
      .eq('clerk_user_id', user.id)

    if (enrollmentsError) {
      console.error('[DEBUG] Debug endpoint - Enrollments query failed:', enrollmentsError)
      debugInfo.steps.push({
        step: 3,
        name: 'query_user_enrollments',
        status: 'failed',
        query: {
          table: 'user_enrollments',
          filters: {
            org_id: user.orgId,
            clerk_user_id: user.id,
          },
        },
        error: {
          message: enrollmentsError.message,
          details: enrollmentsError.details,
          hint: enrollmentsError.hint,
          code: enrollmentsError.code,
          fullError: JSON.stringify(enrollmentsError, null, 2),
        },
      })
    } else {
      console.log('[DEBUG] Debug endpoint - Enrollments query succeeded:', enrollments?.length || 0, 'records')
      debugInfo.steps.push({
        step: 3,
        name: 'query_user_enrollments',
        status: 'success',
        query: {
          table: 'user_enrollments',
          filters: {
            org_id: user.orgId,
            clerk_user_id: user.id,
          },
        },
        recordCount: enrollments?.length || 0,
        data: enrollments,
      })
    }

    // Step 4: Try to query scenarios
    console.log('[DEBUG] Debug endpoint - Step 4: Querying scenarios')
    const { data: scenarios, error: scenariosError } = await supabase
      .from('scenarios')
      .select('id, title, status, org_id, visibility')
      .eq('status', 'active')
      .or(`visibility.eq.universal,org_id.eq.${user.orgId}`)
      .limit(10)

    if (scenariosError) {
      console.error('[DEBUG] Debug endpoint - Scenarios query failed:', scenariosError)
      debugInfo.steps.push({
        step: 4,
        name: 'query_scenarios',
        status: 'failed',
        query: {
          table: 'scenarios',
          filters: {
            status: 'active',
            or_condition: `visibility.eq.universal,org_id.eq.${user.orgId}`,
          },
        },
        error: {
          message: scenariosError.message,
          details: scenariosError.details,
          hint: scenariosError.hint,
          code: scenariosError.code,
          fullError: JSON.stringify(scenariosError, null, 2),
        },
      })
    } else {
      console.log('[DEBUG] Debug endpoint - Scenarios query succeeded:', scenarios?.length || 0, 'records')
      debugInfo.steps.push({
        step: 4,
        name: 'query_scenarios',
        status: 'success',
        query: {
          table: 'scenarios',
          filters: {
            status: 'active',
            or_condition: `visibility.eq.universal,org_id.eq.${user.orgId}`,
          },
        },
        recordCount: scenarios?.length || 0,
        data: scenarios,
      })
    }

    // Step 5: Check if RPC function exists using admin client
    console.log('[DEBUG] Debug endpoint - Step 5: Checking RPC function definition')
    const adminClient = await createAdminClient()

    const { data: rpcInfo, error: rpcInfoError } = await adminClient
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'set_user_and_org_claims')
      .limit(1)
      .maybeSingle()

    if (rpcInfoError) {
      console.error('[DEBUG] Debug endpoint - RPC info query failed:', rpcInfoError)
      debugInfo.steps.push({
        step: 5,
        name: 'check_rpc_function',
        status: 'failed',
        error: {
          message: rpcInfoError.message,
          details: rpcInfoError.details,
          hint: rpcInfoError.hint,
          code: rpcInfoError.code,
        },
      })
    } else if (!rpcInfo) {
      console.log('[DEBUG] Debug endpoint - RPC function not found in pg_proc')
      debugInfo.steps.push({
        step: 5,
        name: 'check_rpc_function',
        status: 'not_found',
        message: 'RPC function set_user_and_org_claims not found in pg_proc',
      })
    } else {
      console.log('[DEBUG] Debug endpoint - RPC function found:', rpcInfo.proname)
      debugInfo.steps.push({
        step: 5,
        name: 'check_rpc_function',
        status: 'success',
        data: {
          functionName: rpcInfo.proname,
          source: rpcInfo.prosrc,
        },
      })
    }

    // Determine overall success
    const allStepsSuccessful = debugInfo.steps.every((step) => step.status === 'success')

    return NextResponse.json(
      {
        success: allStepsSuccessful,
        message: allStepsSuccessful
          ? 'All debug checks passed successfully'
          : 'Some debug checks failed - see steps for details',
        ...debugInfo,
      },
      { status: allStepsSuccessful ? 200 : 500 }
    )
  } catch (error) {
    console.error('[DEBUG] Debug endpoint - Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        ...debugInfo,
      },
      { status: 500 }
    )
  }
}
