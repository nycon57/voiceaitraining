import { SignIn } from '@clerk/nextjs';

import { clerkTheme } from '@/lib/clerk-theme';

export default function SignInPage() {
  return (
    <div className="w-full">
      <SignIn
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
        appearance={clerkTheme}
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}