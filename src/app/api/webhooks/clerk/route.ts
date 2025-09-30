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

        // Create user profile in our database
        await supabase
          .from('user_profiles')
          .insert({
            user_id: id,
            email: primaryEmail?.email_address,
            first_name: first_name,
            last_name: last_name,
            avatar_url: image_url,
          })

        break
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data
        const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)

        // Update user profile
        await supabase
          .from('user_profiles')
          .update({
            email: primaryEmail?.email_address,
            first_name: first_name,
            last_name: last_name,
            avatar_url: image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', id)

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
        let userRole = 'trainee'
        if (role === 'org:admin') userRole = 'admin'
        else if (role === 'org:manager') userRole = 'manager'
        else if (role === 'org:hr') userRole = 'hr'

        // Add user to organization
        await supabase
          .from('org_members')
          .insert({
            org_id: organization.id,
            user_id: public_user_data.user_id,
            role: userRole,
            metadata: public_metadata || {},
          })

        break
      }

      case 'organizationMembership.updated': {
        const { organization, public_user_data, role, public_metadata } = evt.data

        // Map Clerk roles to our roles
        let userRole = 'trainee'
        if (role === 'org:admin') userRole = 'admin'
        else if (role === 'org:manager') userRole = 'manager'
        else if (role === 'org:hr') userRole = 'hr'

        // Update user's role in organization
        await supabase
          .from('org_members')
          .update({
            role: userRole,
            metadata: public_metadata || {},
            updated_at: new Date().toISOString(),
          })
          .eq('org_id', organization.id)
          .eq('user_id', public_user_data.user_id)

        break
      }

      case 'organizationMembership.deleted': {
        const { organization, public_user_data } = evt.data

        // Remove user from organization
        await supabase
          .from('org_members')
          .delete()
          .eq('org_id', organization.id)
          .eq('user_id', public_user_data.user_id)

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