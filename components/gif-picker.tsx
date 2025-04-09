"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

// Mock GIF data
const mockGifs = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aCTfyhOZ4kDxaJG/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l46CyJmYtZ04jOPDy/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlQXlQ3nHyLMvte/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlQWlQwCTLEqnrG/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSha51ATTx9TSg/giphy.gif",
]

interface GifPickerProps {
  onSelect: (gifUrl: string) => void
}

export function GifPicker({ onSelect }: GifPickerProps) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [gifs, setGifs] = useState(mockGifs)

  const handleSearch = () => {
    // In a real app, this would call the Giphy API
    // For now, we'll just filter our mock data
    if (search.trim() === "") {
      setGifs(mockGifs)
    } else {
      // Simulate search by shuffling the array
      setGifs([...mockGifs].sort(() => Math.random() - 0.5))
    }
  }

  const handleSelect = (gifUrl: string) => {
    onSelect(gifUrl)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <span className="sr-only">GIF</span>
          <span className="text-xs font-bold">GIF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search GIFs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[400px]">
            {gifs.map((gif, index) => (
              <button
                key={index}
                className="rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                onClick={() => handleSelect(gif)}
              >
                <img src={gif || "/placeholder.svg"} alt={`GIF ${index + 1}`} className="w-full h-auto object-cover" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
