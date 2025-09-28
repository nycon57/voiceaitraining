import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="w-full">
      <SignUp
        appearance={{
          elements: {
            // Main card container - completely transparent to work with glass-morphism layout
            card: 'shadow-none border-0 bg-transparent',

            // Fix Clerk's internal containers
            main: 'bg-transparent',
            formResendCodeLink: 'text-[var(--chart-1)] hover:text-[var(--chart-2)] font-semibold',

            // Header styling - enhanced for better light mode visibility
            headerTitle: 'text-2xl font-headline font-bold text-foreground mb-2',
            headerSubtitle: 'text-foreground/70 dark:text-foreground/80 text-sm leading-relaxed',

            // Form container
            formContainer: 'space-y-6',

            // Input fields - improved contrast and glass morphism
            formFieldInput: 'bg-background/80 dark:bg-background/60 border-foreground/15 dark:border-white/15 backdrop-blur-sm rounded-lg h-12 px-4 text-foreground placeholder:text-foreground/50 dark:placeholder:text-foreground/60 focus:ring-2 focus:ring-[var(--chart-1)]/40 focus:border-[var(--chart-1)]/60 transition-all duration-200 shadow-sm hover:bg-background/90 dark:hover:bg-background/70',
            formFieldLabel: 'text-sm font-semibold text-foreground mb-2',

            // Primary button - enhanced gradient with better hover states
            formButtonPrimary: 'bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-2)] to-[var(--chart-1)] bg-size-200 hover:bg-pos-100 border-0 text-white font-semibold h-12 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',

            // Social buttons - improved light mode styling
            socialButtonsBlockButton: 'bg-background/80 dark:bg-background/60 backdrop-blur-sm border-foreground/15 dark:border-white/15 hover:bg-background/90 dark:hover:bg-background/70 text-foreground rounded-lg h-12 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01]',
            socialButtonsBlockButtonText: 'text-foreground font-medium',

            // Links - enhanced visibility in both modes
            footerActionLink: 'text-[var(--chart-1)] hover:text-[var(--chart-2)] transition-colors duration-200 font-semibold',

            // Divider - better contrast in light mode
            dividerLine: 'bg-foreground/15 dark:bg-white/15',
            dividerText: 'text-foreground/60 dark:text-foreground/70 text-sm font-medium',

            // Error messages - better visibility
            formFieldErrorText: 'text-red-500 dark:text-red-400 text-sm mt-1 font-medium',

            // Loading state
            formButtonPrimaryLoading: 'bg-gradient-to-r from-[var(--chart-1)]/80 to-[var(--chart-2)]/80',

            // Footer - enhanced text visibility
            footer: 'bg-transparent !important',
            footerActionText: 'text-foreground/70 dark:text-foreground/80 font-medium',
            footerPages: 'bg-transparent !important',
            footerAction: 'bg-transparent !important',

            // Alternative methods
            alternativeMethodsBlockButton: 'bg-background/80 dark:bg-background/60 backdrop-blur-sm border-foreground/15 dark:border-white/15 hover:bg-background/90 dark:hover:bg-background/70 text-foreground rounded-lg h-12 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01]',

            // Form field wrapper
            formField: 'space-y-2',

            // Root container
            rootBox: 'w-full',

            // Identity preview - improved visibility
            identityPreviewText: 'text-foreground font-medium',
            identityPreviewEditButton: 'text-[var(--chart-1)] hover:text-[var(--chart-2)] font-semibold',

            // Additional elements for better styling
            form: 'space-y-6',
            formFieldRow: 'space-y-2',
            formHeaderTitle: 'text-foreground font-headline',
            formHeaderSubtitle: 'text-foreground/70 dark:text-foreground/80',

            // OTP input
            formFieldInputShowPasswordButton: 'text-[var(--chart-1)] hover:text-[var(--chart-2)] font-semibold',

            // Password validation - improved colors
            formFieldSuccessText: 'text-green-600 dark:text-green-400 text-sm mt-1 font-medium',

            // Continue button - consistent styling
            formButtonPrimarySecondary: 'bg-background/80 dark:bg-background/60 backdrop-blur-sm border-foreground/15 dark:border-white/15 hover:bg-background/90 dark:hover:bg-background/70 text-foreground rounded-lg h-12 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01] font-semibold',

            // Improve checkbox and radio styling
            formFieldInputShowPassword: 'text-[var(--chart-1)] hover:text-[var(--chart-2)]',
            formFieldAction: 'text-[var(--chart-1)] hover:text-[var(--chart-2)] font-semibold',

            // Force override Clerk's container backgrounds that cause grey issues
            modalContent: 'bg-transparent !important',
            modalCloseButton: 'text-foreground/60 hover:text-foreground/80',

            // Target the specific Clerk containers causing grey background issues
            'cl-cardBox': 'bg-transparent !important',
            'cl-card': 'bg-transparent !important shadow-none border-0',
            'cl-main': 'bg-transparent !important',
            'cl-rootBox': 'bg-transparent !important',

            // Fix the bottom "Secured by Clerk" section (the black part in your screenshot)
            'cl-footer': 'bg-transparent !important',
            'cl-footerAction': 'bg-transparent !important',
            'cl-internal-1dauvpw': 'bg-transparent !important text-foreground/60 dark:text-foreground/70',
            'cl-internal-1k7jtru': 'bg-transparent !important',
            'cl-internal-gr8mll': 'bg-transparent !important',
            'cl-internal-y44tp9': 'bg-transparent !important',
            'cl-internal-1pguj3g': 'bg-transparent !important text-foreground/50 dark:text-foreground/60',
            'cl-internal-1xv0n0z': 'text-foreground/50 dark:text-foreground/60 text-xs',
            'cl-internal-kr8fhm': 'text-foreground/40 dark:text-foreground/50 hover:text-foreground/60 dark:hover:text-foreground/70',
            'cl-internal-5ghyhf': 'text-foreground/40 dark:text-foreground/50',
            'cl-internal-1g1i4zh': 'text-foreground/40 dark:text-foreground/50 text-xs',

            // Target bottom section containers specifically - these override the above for specific elements
            footerActionLinkOverride: 'text-[var(--chart-1)] hover:text-[var(--chart-2)] transition-colors duration-200 font-semibold !important',
            footerActionTextOverride: 'text-foreground/70 dark:text-foreground/80 font-medium !important',

            // Additional container overrides
            cardBox: 'bg-transparent !important',
            socialButtonsProviderIcon: 'text-foreground',
          },
          layout: {
            socialButtonsPlacement: 'top',
            showOptionalFields: false
          },
          variables: {
            colorPrimary: 'hsl(var(--chart-1))',
            colorTextOnPrimaryBackground: 'white',
            colorBackground: 'transparent',
            colorInputBackground: 'transparent',
            colorInputText: 'hsl(var(--foreground))',
            colorText: 'hsl(var(--foreground))',
            colorTextSecondary: 'hsl(var(--foreground) / 0.7)',
            colorShimmer: 'hsl(var(--chart-1))',
            borderRadius: '0.5rem',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            spacingUnit: '1rem'
          }
        }}
        routing="path"
        path="/sign-up"
      />
    </div>
  )
}