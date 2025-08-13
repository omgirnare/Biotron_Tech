export default function Footer() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500 flex items-center justify-between">
        <span>© {new Date().getFullYear()} Biotron</span>
        <nav className="flex items-center gap-4">
          <a className="hover:text-slate-700 transition" href="#">Privacy</a>
          <a className="hover:text-slate-700 transition" href="#">Terms</a>
        </nav>
      </div>
    </footer>
  );
}


