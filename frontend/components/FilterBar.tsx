import React from "react";

interface FilterBarProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string, end: string) => void;
  genres?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedGenre,
  onGenreChange,
  startDate = "",
  endDate = "",
  onDateChange,
  genres = ["All", "Action", "Drama", "Comedy", "Sci-Fi", "Documentary", "Thriller", "Horror"],
}) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Genre:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {genres.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => onGenreChange(genre)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-primary text-background font-semibold shadow-sm"
                    : "bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-elevated/80"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {onDateChange && (
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-text-secondary uppercase tracking-wider font-semibold">
            Date:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            className="bg-surface-elevated border border-border rounded px-2.5 py-1 text-text-primary focus:outline-none focus:border-primary"
          />
          <span className="text-text-muted">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            className="bg-surface-elevated border border-border rounded px-2.5 py-1 text-text-primary focus:outline-none focus:border-primary"
          />
        </div>
      )}
    </div>
  );
};
