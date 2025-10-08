"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LatLngExpression } from "leaflet";
import { MapPin, Search, X } from "lucide-react";

interface LocationSuggestion {
  id: string;
  display_name: string;
  lat: string;
  lon: string;
  importance: number;
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: {
    name: string;
    position: LatLngExpression;
  }) => void;
  onClear?: () => void; // Add onClear callback
  placeholder?: string;
  label?: string;
}

export default function LocationInput({
  value,
  onChange,
  onLocationSelect,
  onClear,
  placeholder = "Search for a location...",
  label,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchLocations = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Try Sri Lanka first for better local results
      const sriLankaUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5&countrycodes=lk&addressdetails=1`;

      const globalUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=3&addressdetails=1`;

      const [sriLankaResponse, globalResponse] = await Promise.all([
        fetch(sriLankaUrl),
        fetch(globalUrl),
      ]);

      const sriLankaData = await sriLankaResponse.json();
      const globalData = await globalResponse.json();

      // Combine results, prioritizing Sri Lanka
      const combinedResults = [...sriLankaData, ...globalData];

      // Remove duplicates based on coordinates and create unique suggestions
      const uniqueSuggestions = combinedResults
        .filter((item, index, self) => {
          const coordKey = `${parseFloat(item.lat).toFixed(6)}-${parseFloat(
            item.lon
          ).toFixed(6)}`;
          return (
            index ===
            self.findIndex(
              (other) =>
                `${parseFloat(other.lat).toFixed(6)}-${parseFloat(
                  other.lon
                ).toFixed(6)}` === coordKey
            )
          );
        })
        .slice(0, 8) // Limit to 8 results
        .map((item, index) => ({
          ...item,
          id: item.osm_id
            ? `osm-${item.osm_id}`
            : `coord-${item.lat}-${item.lon}-${index}`, // Ensure unique ID
        }));

      setSuggestions(uniqueSuggestions);
      setShowSuggestions(uniqueSuggestions.length > 0);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      if (newValue.trim()) {
        searchLocations(newValue);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const locationName = suggestion.display_name.split(",")[0]; // Take first part of address

    // Update the input value first
    onChange(locationName);

    // Then call the location select handler
    onLocationSelect({
      name: locationName,
      position: [parseFloat(suggestion.lat), parseFloat(suggestion.lon)],
    });

    // Clear suggestions and hide dropdown
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const clearInput = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
    onClear?.(); // Call the clear callback if provided
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the entire component container
      const target = event.target as Node;
      const container = inputRef.current?.parentElement?.parentElement;

      if (container && !container.contains(target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearInput}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border last:border-b-0 flex items-start gap-3 cursor-pointer"
              onMouseDown={(e) => {
                // Prevent the input from losing focus before the click event
                e.preventDefault();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSuggestionClick(suggestion);
              }}
            >
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {suggestion.display_name.split(",")[0]}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {suggestion.display_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
