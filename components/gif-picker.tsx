"use client";

import { useState, useEffect } from "react";
import { Search, X, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Fallback GIFs in case API key is not available
const fallbackGifs = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aCTfyhOZ4kDxaJG/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l46CyJmYtZ04jOPDy/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlQXlQ3nHyLMvte/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlQWlQwCTLEqnrG/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtZ2R2Ymx5cXMwcWRrenVrNHd1NWFxcnBnYnl4cjVwcWR0cWtvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSha51ATTx9TSg/giphy.gif",
];

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

export function GifPicker({ onSelect }: GifPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [gifs, setGifs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearch, setCurrentSearch] = useState("");

  // Reset pagination when search changes
  useEffect(() => {
    if (open && search !== currentSearch) {
      setOffset(0);
      setHasMore(true);
    }
  }, [search, currentSearch, open]);

  // Update the handleSearch function to use the GIPHY API key
  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setCurrentSearch(search);
    setOffset(0);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

      if (!apiKey) {
        console.error("GIPHY API key not found");
        setGifs(fallbackGifs);
        return;
      }

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
          search
        )}&limit=6&offset=0&rating=pg`
      );
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const urls = data.data.map((gif: any) => gif.images.fixed_height.url);
        setGifs(urls);
        setHasMore(data.pagination.total_count > 6);
      } else {
        setGifs([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch GIFs:", error);
      setGifs(fallbackGifs);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleNext function to use the GIPHY API key
  const handleNext = async () => {
    if (loading || !hasMore) return;

    const newOffset = offset + 6;
    setLoading(true);
    setOffset(newOffset);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

      if (!apiKey) {
        console.error("GIPHY API key not found");
        setGifs([...fallbackGifs].sort(() => Math.random() - 0.5));
        return;
      }

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
          search
        )}&limit=6&offset=${newOffset}&rating=pg`
      );
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const urls = data.data.map((gif: any) => gif.images.fixed_height.url);
        setGifs(urls);
        setHasMore(newOffset + 6 < data.pagination.total_count);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch more GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (gifUrl: string) => {
    onSelect(gifUrl);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <span className="sr-only">GIF</span>
          <span className="text-xs font-bold">GIF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search GIFs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
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

          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex justify-center items-center h-[300px] text-muted-foreground">
              No GIFs found. Try another search.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[300px]">
                {gifs.map((gif, index) => (
                  <button
                    key={`${gif}-${index}`}
                    className="rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => handleSelect(gif)}
                  >
                    <img
                      src={gif || "/placeholder.svg"}
                      alt={`GIF ${index + 1}`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={loading || !hasMore}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
