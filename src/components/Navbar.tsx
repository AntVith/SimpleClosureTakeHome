function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-edge bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
        <h1 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-gold"
          />
          Marquee
        </h1>
      </div>
    </header>
  )
}

export default Navbar
