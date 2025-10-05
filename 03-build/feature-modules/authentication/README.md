# Authentication Module

Production-ready authentication module using Supabase. Copy-paste into any MicroSaaS app.

## Features

- Email/Password authentication
- OAuth providers (Google, GitHub, etc.)
- Password reset flow
- Email verification
- Protected routes
- Session management
- Auth state hooks
- User profile management

## Installation

```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

## Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Quick Start

### 1. Initialize Supabase Client

Copy `lib/supabase.ts` to your project.

### 2. Add Auth Provider

Wrap your app with the AuthProvider:

```tsx
// app/layout.tsx or pages/_app.tsx
import { AuthProvider } from '@/features/authentication/providers/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Use Auth Hooks

```tsx
import { useAuth } from '@/features/authentication/hooks/useAuth';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### 4. Protect Routes

```tsx
import { ProtectedRoute } from '@/features/authentication/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## Components

### SignInForm
Pre-built sign-in form with email/password and OAuth options.

```tsx
import { SignInForm } from '@/features/authentication/components/SignInForm';

export default function SignInPage() {
  return <SignInForm redirectTo="/dashboard" />;
}
```

### SignUpForm
Registration form with email verification.

```tsx
import { SignUpForm } from '@/features/authentication/components/SignUpForm';

export default function SignUpPage() {
  return <SignUpForm redirectTo="/onboarding" />;
}
```

### PasswordResetForm
Complete password reset flow.

```tsx
import { PasswordResetForm } from '@/features/authentication/components/PasswordResetForm';

export default function ResetPasswordPage() {
  return <PasswordResetForm />;
}
```

## Hooks

### useAuth
Main authentication hook with user state and methods.

```tsx
const {
  user,           // Current user object
  loading,        // Loading state
  signIn,         // Sign in method
  signUp,         // Sign up method
  signOut,        // Sign out method
  updateProfile,  // Update user profile
} = useAuth();
```

### useProtectedRoute
Automatically redirects unauthenticated users.

```tsx
const { user, loading } = useProtectedRoute('/login');
```

## Utilities

### checkAuth
Server-side authentication check for API routes.

```tsx
import { checkAuth } from '@/features/authentication/utils/checkAuth';

export async function GET(request: Request) {
  const user = await checkAuth(request);
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... your API logic
}
```

## Database Schema

Run this SQL in Supabase to set up user profiles:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create trigger to auto-create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## OAuth Configuration

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add to Supabase Dashboard > Authentication > Providers
4. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Add credentials to Supabase

## Customization

### Custom Email Templates

Edit in Supabase Dashboard > Authentication > Email Templates

### Session Duration

Configure in Supabase Dashboard > Authentication > Settings

### Password Requirements

Modify in `components/SignUpForm.tsx` validation schema

## Security Best Practices

1. Always use Row Level Security (RLS) on Supabase tables
2. Never expose service role key in client code
3. Validate email before allowing actions
4. Implement rate limiting on auth endpoints
5. Use secure password requirements
6. Enable MFA for sensitive operations

## Troubleshooting

### Email not sending
- Check Supabase email settings
- Verify SMTP configuration
- Check spam folder

### OAuth not working
- Verify callback URLs match exactly
- Check OAuth credentials
- Ensure providers are enabled in Supabase

### Session persists after signOut
- Clear browser localStorage
- Check for multiple Supabase clients
- Verify signOut is awaited

## Migration from Other Auth Providers

### From Firebase Auth
Use Supabase migration tools to import users while preserving passwords.

### From Auth0
Export users and use Supabase CLI to bulk import.

## Production Checklist

- [ ] Enable email verification
- [ ] Configure custom email templates
- [ ] Set up OAuth providers
- [ ] Enable RLS on all tables
- [ ] Configure CORS properly
- [ ] Set up error monitoring
- [ ] Implement rate limiting
- [ ] Add MFA for admin users
- [ ] Test password reset flow
- [ ] Configure session timeout

## License

MIT - Free to use in commercial projects
