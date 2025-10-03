import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const supabase = await createAdminClient()

  try {
    switch (evt.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data
        const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)

        // Check if user is joining an existing organization
        const { data: existingMembership } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_user_id', id)
          .limit(1)
          .single()

        // If no existing membership, create a personal org
        if (!existingMembership) {
          console.log('Creating personal org for new user:', id)

          // Create personal org using database function
          const { data: orgId, error: orgError } = await supabase
            .rpc('create_personal_org', {
              p_clerk_user_id: id,
              p_first_name: first_name || 'User',
              p_email: primaryEmail?.email_address || '',
              p_plan: 'individual_free'
            })

          if (orgError) {
            console.error('Error creating personal org:', orgError)
            throw orgError
          }

          console.log('Personal org created with ID:', orgId)

          // Update user's avatar_url if provided
          if (image_url) {
            await supabase
              .from('users')
              .update({ avatar_url: image_url })
              .eq('clerk_user_id', id)
          }
        } else {
          console.log('User already has membership, skipping personal org creation:', id)
        }

        break
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data
        const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)

        // Update user in users table
        await supabase
          .from('users')
          .update({
            email: primaryEmail?.email_address,
            first_name: first_name,
            last_name: last_name,
            avatar_url: image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_user_id', id)

        break
      }

      case 'organization.created': {
        const { id, name, slug, image_url, public_metadata } = evt.data

        // Create organization in our database
        await supabase
          .from('orgs')
          .insert({
            id: id,
            name: name,
            slug: slug,
            plan: 'starter',
            logo_url: image_url,
            metadata: public_metadata || {},
          })

        break
      }

      case 'organizationMembership.created': {
        const { organization, public_user_data, role, public_metadata } = evt.data

        // Map Clerk roles to our roles
        let userRole: 'trainee' | 'manager' | 'admin' | 'hr' = 'trainee'
        if (role === 'org:admin') userRole = 'admin'
        else if (role === 'org:manager') userRole = 'manager'
        else if (role === 'org:hr') userRole = 'hr'

        // Get user's email and name
        const { data: clerkUser } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('clerk_user_id', public_user_data.user_id)
          .limit(1)
          .single()

        // Add user to team organization (not personal org)
        // Use upsert to handle existing users
        await supabase
          .from('users')
          .upsert({
            clerk_user_id: public_user_data.user_id,
            org_id: organization.id,
            email: clerkUser?.email || public_user_data.identifier || '',
            first_name: clerkUser?.first_name || public_user_data.first_name || '',
            last_name: clerkUser?.last_name || public_user_data.last_name || '',
            role: userRole,
            is_active: true,
          }, {
            onConflict: 'clerk_user_id,org_id'
          })

        break
      }

      case 'organizationMembership.updated': {
        const { organization, public_user_data, role, public_metadata } = evt.data

        // Map Clerk roles to our roles
        let userRole: 'trainee' | 'manager' | 'admin' | 'hr' = 'trainee'
        if (role === 'org:admin') userRole = 'admin'
        else if (role === 'org:manager') userRole = 'manager'
        else if (role === 'org:hr') userRole = 'hr'

        // Update user's role in organization
        await supabase
          .from('users')
          .update({
            role: userRole,
            updated_at: new Date().toISOString(),
          })
          .eq('org_id', organization.id)
          .eq('clerk_user_id', public_user_data.user_id)

        break
      }

      case 'organizationMembership.deleted': {
        const { organization, public_user_data } = evt.data

        // Soft delete user from organization (set to inactive)
        await supabase
          .from('users')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('org_id', organization.id)
          .eq('clerk_user_id', public_user_data.user_id)

        break
      }

      case 'organization.updated': {
        const { id, name, slug, image_url, public_metadata } = evt.data

        // Update organization
        await supabase
          .from('orgs')
          .update({
            name: name,
            slug: slug,
            logo_url: image_url,
            metadata: public_metadata || {},
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)

        break
      }

      case 'organization.deleted': {
        const { id } = evt.data

        // Soft delete organization (set status to inactive)
        await supabase
          .from('orgs')
          .update({
            status: 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)

        break
      }

      default:
        console.log(`Unhandled webhook event type: ${evt.type}`)
    }

    return new Response('', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Error processing webhook', { status: 500 })
  }
}