export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Voice AI Training</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered sales training platform
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}