# Authentication Setup Guide

## Current Issue: Email Confirmation Required

Your Supabase project is currently configured to require email confirmation for new user signups. This is why you're seeing "Account created" but can't login immediately.

## Quick Fix Options:

### Option 1: Disable Email Confirmation (Recommended for Development)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Authentication → Settings
4. Under "User Signups", turn OFF "Enable email confirmations"
5. Click "Save"

### Option 2: Use Email Confirmation (Production Ready)
Keep email confirmation enabled and:
1. Check your email after signing up
2. Click the confirmation link
3. Then try logging in

### Option 3: Test with Existing Account
If you've already created accounts, you can check their status:
1. Go to Supabase Dashboard → Authentication → Users
2. Look for users with "email_confirmed_at" field populated
3. Only confirmed users can login

## Email Service Setup (If Using Confirmations)
If you want to keep email confirmations enabled, you need to configure SMTP:
1. Go to Authentication → Settings → SMTP Settings
2. Configure your email provider (Gmail, SendGrid, etc.)
3. Test the email service

## Current App Behavior:
- Signup: Creates account and shows appropriate message
- Login: Only works for confirmed accounts
- Better error messages now show if email confirmation is needed

## Recommended for Development:
Disable email confirmations for easier testing, then re-enable for production.