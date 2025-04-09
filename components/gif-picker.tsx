"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

const LIMIT = 6;

export function GifPicker({ onSelect }: GifPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [gifs, setGifs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearch = async (newOffset = 0) => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
          search
        )}&limit=${LIMIT}&offset=${newOffset}&rating=pg`
      );
      const data = await response.json();
      const urls = data.data.map((gif: any) => gif.images.fixed_height.url);
      setGifs(urls);
      setTotalCount(data.pagination.total_count || 0);
      setOffset(newOffset);
    } catch (error) {
      console.error("Failed to fetch GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (gifUrl: string) => {
    onSelect(gifUrl);
    setOpen(false);
  };

  const handleNext = () => {
    if (offset + LIMIT < totalCount) {
      handleSearch(offset + LIMIT);
    }
  };

  const handleBack = () => {
    if (offset - LIMIT >= 0) {
      handleSearch(offset - LIMIT);
    }
  };

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
                if (e.key === "Enter") handleSearch(0);
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSearch(0)}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="col-span-2 text-center">Loading...</div>
            ) : gifs.length > 0 ? (
              gifs.map((gif, index) => (
                <button
                  key={index}
                  className="rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => handleSelect(gif)}
                >
                  <img
                    src={gif || "/placeholder.svg"}
                    alt={`GIF ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </button>
              ))
            ) : (
              <div className="col-span-2 text-center text-muted-foreground">
                Try searching for something like "funny cat"
              </div>
            )}
          </div>

          {gifs.length > 0 && (
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={offset === 0}
              >
                Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {offset / LIMIT + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={offset + LIMIT >= totalCount}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
