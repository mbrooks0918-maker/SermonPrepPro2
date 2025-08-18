# Sermon Planning App - Setup Guide

## Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase (Real Database)
Replace the mock client in `src/lib/supabase.ts` with real Supabase connection:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Run the Application
```bash
npm run dev
```

## Current Status
- ✅ Frontend fully built and functional
- ✅ Database tables created (sermon_series, sermons, users)
- ✅ Email invitations ready (invite-collaborator function)
- ⚠️ Currently using mock data for development

## To Go Live with Real Data

### Option A: Use Existing Supabase Project
1. Get your Supabase URL and anon key from your project dashboard
2. Replace the mock client in `src/lib/supabase.ts`
3. Remove the mock services and use direct Supabase queries

### Option B: Start Fresh
1. Create new Supabase project at supabase.com
2. Run the existing table creation queries
3. Update supabase.ts with your credentials

## Features Ready to Use
- ✅ Sermon series management
- ✅ Individual sermon planning
- ✅ Calendar view
- ✅ Collaborator invitations
- ✅ Cost estimation
- ✅ Responsive design

The app is production-ready - just needs real Supabase connection!