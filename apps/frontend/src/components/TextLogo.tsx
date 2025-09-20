export function TextLogo({ className }: { className?: string }) {
  return (
    <h1 className={`font-bold tracking-tighter ${className}`}>
      <span className="text-gray-900 dark:text-white">Stay</span>
      <span className="text-blue-500 dark:text-blue-300">With</span>
      <span className="text-blue-600 dark:text-blue-400">Friends</span>
    </h1>
  )
}