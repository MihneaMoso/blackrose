import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="font-serif text-8xl text-rose-soft/30 tracking-widest select-none">
            404
          </div>
          <div className="h-px w-16 bg-rose-soft/40 mx-auto mt-4" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-4 uppercase tracking-wider">
          Petals Not Found
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-10 font-light">
          This arrangement doesn&apos;t exist in our collection.
          Perhaps it wilted away, or was never meant to be.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 border border-foreground text-foreground text-sm font-medium tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
        >
          Return to the Garden
        </Link>
      </div>
    </div>
  )
}
