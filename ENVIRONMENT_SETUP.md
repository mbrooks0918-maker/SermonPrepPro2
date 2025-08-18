# Environment Setup Guide

## Setting Up Your Development Environment

To get your app fully functional with Supabase, you need to set up environment variables. Here's how:

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy these two values:
   - **Project URL** (looks like: https://your-project-id.supabase.co)
   - **Anon public key** (a long string starting with "eyJ...")

### Step 2: Create Your Environment File

1. In your project root directory (same folder as package.json), create a new file called `.env`
2. Copy the contents from `.env.example` into your new `.env` file
3. Replace the placeholder values with your actual Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-actual-anon-key
```

### Step 3: Restart Your Development Server

After creating the `.env` file:
1. Stop your development server (Ctrl+C)
2. Run `npm run dev` or `yarn dev` again
3. Your app should now start on the login screen and be fully functional!

### Important Notes

- Never commit your `.env` file to version control (it's already in .gitignore)
- The `.env` file must be in your project root directory
- Environment variable names must start with `VITE_` for Vite to include them
- Restart your dev server whenever you change environment variables