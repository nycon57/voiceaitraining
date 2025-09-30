import { SignUp } from '@clerk/nextjs';

import { clerkTheme } from '@/lib/clerk-theme';

export default function SignUpPage() {
  return (
    <div className="w-full">
      <SignUp
        appearance={clerkTheme}
        routing="path"
        path="/sign-up"
      />
    </div>
  );
}