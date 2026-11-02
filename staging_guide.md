# Staging Deployment Guide: Essex Paranormal Booking System

This guide outlines the steps to deploy and verify the booking system in an isolated staging environment before production launch.

## 1. Supabase Staging Setup
1. Create a new isolated Supabase project.
2. Run migrations in order:
   - `migrations/001_bookings_schema.sql`
   - `migrations/002_capacity_management.sql`
   - `migrations/003_status_refinement.sql`
3. Ensure the `published_content` table exists and contains test events with `total_capacity` and `remaining_tickets` columns.

## 2. Environment Variables Checklist
Configure the following in **Supabase Edge Function Secrets**:

| Variable | Value / Source | Requirement |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Project URL | Mandatory |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key | Mandatory (Admin access) |
| `SUMUP_API_KEY` | SumUp Sandbox API Key | Mandatory |
| `SUMUP_MERCHANT_CODE` | SumUp Merchant Code | Mandatory |
| `MS_CLIENT_ID` | Azure App Client ID | Mandatory |
| `MS_CLIENT_SECRET` | Azure App Client Secret | Mandatory |
| `MS_TENANT_ID` | Azure Tenant ID | Mandatory |
| `EMAIL_API_KEY` | Provider API Key | Mandatory |

## 3. Verification Workflow (Staging)

### A. Booking & Payment Flow
1. Navigate to `/bookings.html` on the staging domain.
2. Select an event $\rightarrow$ Complete booking form.
3. Verify redirect to SumUp Sandbox Checkout.
4. Use SumUp sandbox test card to complete payment.
5. **Verify**: `bookings` table updates to `paid` / `confirmed`.
6. **Verify**: `published_content` ticket count remains decremented.

### B. Webhook & Idempotency
1. Manually trigger the `sumup-webhook` function with a duplicate `CHECKOUT_STATUS_CHANGED` payload.
2. **Verify**: Function returns `200 Already Processed` and does not create duplicate bookings or trigger double Outlook syncs.

### C. Outlook Synchronisation
1. Check the connected Microsoft Outlook calendar.
2. **Verify**: An event appears with the correct booking reference and ticket count.
3. **Verify**: Outlook failures do not revert the `paid` status of the booking in Supabase.

### D. Capacity Recovery
1. Create a booking but do NOT pay.
2. Wait for the expiration period (or trigger `release-tickets` function).
3. **Verify**: `published_content` tickets are returned to the pool.
