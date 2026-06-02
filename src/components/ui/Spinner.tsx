interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function Spinner({ size = 'md' }: SpinnerProps) {
  const sizeClass = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-8 h-8' }[size]

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizeClass} border border-border border-t-green rounded-full animate-spin`}
      />
    </div>
  )
}