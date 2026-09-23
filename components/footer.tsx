import { Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full h-[120px] mt-24 border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{' '}
            <a
              href="https://github.com/HongHyunKi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              HongHyunKi
            </a>
            . All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <a
              href="mailto:dev.hyunki@gmail.com?subject=%5BGuitarKit%5D%20%3A%20"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
