<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3b669fe1-93b8-4984-a40d-a6db5d32c938

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set up Supabase (backend for auth + database):
   - Create a free project at https://supabase.com
   - In the SQL Editor, run [`supabase-schema.sql`](supabase-schema.sql) to create the tables and security policies
   - In Project Settings > API, copy your Project URL and publishable (anon) key into `.env.local`:
     ```
     VITE_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
     VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
     ```
   - To enable "Continue with Google", go to Authentication > Providers > Google in the Supabase dashboard and add your Google OAuth client ID/secret
4. Run the app:
   `npm run dev`
