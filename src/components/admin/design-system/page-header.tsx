import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Download, ExternalLink } from "lucide-react"

export function PageHeader() {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  const handleDownloadAssets = () => {
    // TODO: Implement asset download functionality
    console.log("Download brand assets")
  }

  return (
    <div className="border-b border-border bg-card/50 px-8 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">S</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">SpeakStride Design System</h1>
              <Badge variant="secondary" className="ml-2">v1.0</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              The comprehensive design system for SpeakStride's Voice AI Training platform.
              This documentation serves as the single source of truth for our brand guidelines,
              design tokens, components, and interaction patterns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAssets}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Brand Assets
            </Button>
            <Button
              variant="default"
              size="sm"
              asChild
              className="gap-2"
            >
              <a
                href="https://github.com/yourusername/speakstride"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}