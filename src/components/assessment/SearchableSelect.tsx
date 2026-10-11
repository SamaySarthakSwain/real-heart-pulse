import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, Plus } from "lucide-react";

interface SearchableSelectProps {
  id?: string;
  label?: string;
  required?: boolean;
  options: string[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  allowCustom?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

export function SearchableSelect({
  id,
  label,
  required,
  options,
  selected,
  onChange,
  placeholder = "Search...",
  isMulti = false,
  allowCustom = false,
  error,
  helperText,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : [];

  // Filter options based on query
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase().trim())
  );

  const isExactMatch = options.some(
    (opt) => opt.toLowerCase() === query.trim().toLowerCase()
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: string) => {
    if (isMulti) {
      const current = Array.isArray(selected) ? selected : [];
      if (current.includes(item)) {
        onChange(current.filter((i) => i !== item));
      } else {
        // Special case: if selecting "None" or "No known...", can clear others or append
        if (item.toLowerCase().includes("none") || item.toLowerCase().includes("no current")) {
          onChange([item]);
        } else {
          onChange([...current.filter((i) => !i.toLowerCase().includes("none") && !i.toLowerCase().includes("no current")), item]);
        }
      }
    } else {
      onChange(item);
      setIsOpen(false);
    }
    setQuery("");
  };

  const handleRemove = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMulti) {
      const current = Array.isArray(selected) ? selected : [];
      onChange(current.filter((i) => i !== itemToRemove));
    } else {
      onChange("");
    }
  };

  const handleAddCustom = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (isMulti) {
      const current = Array.isArray(selected) ? selected : [];
      if (!current.includes(trimmed)) {
        onChange([...current, trimmed]);
      }
    } else {
      onChange(trimmed);
      setIsOpen(false);
    }
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        handleSelect(filteredOptions[activeIndex]);
      } else if (allowCustom && query.trim() && !isExactMatch) {
        handleAddCustom();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`space-y-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-center justify-between text-xs font-semibold text-[#142033] dark:text-slate-200"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          {helperText && (
            <span className="text-[11px] font-normal text-[#667085] dark:text-slate-400">
              {helperText}
            </span>
          )}
        </label>
      )}

      {/* Main interactive field */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`min-h-[42px] w-full rounded-xl border ${
          error
            ? "border-rose-500 ring-2 ring-rose-500/20"
            : isOpen
            ? "border-[#FF6B00] ring-2 ring-orange-500/20"
            : "border-[#D9E1EA] dark:border-slate-700/80 hover:border-slate-400"
        } bg-[#F7F9FC] dark:bg-[#1A2639]/90 px-3 py-1.5 text-sm transition-all flex flex-wrap items-center gap-1.5 cursor-pointer`}
      >
        {/* Selected Tags for Multi-Select */}
        {isMulti &&
          selectedArray.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] dark:text-[#FF8A00] px-2 py-0.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(item, e)}
                className="hover:text-rose-600 rounded p-0.5"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

        {/* Selected text for Single-Select when dropdown is closed and no query */}
        {!isMulti && selected && !isOpen && (
          <span className="text-sm font-medium text-[#142033] dark:text-slate-100 truncate flex-1">
            {selected}
          </span>
        )}

        {/* Search input field */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedArray.length === 0 ? placeholder : isMulti ? "Add more..." : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
        />

        {/* Dropdown chevron / clear indicator */}
        <div className="flex items-center gap-1 text-[#667085] ml-auto">
          {!isMulti && selected && (
            <button
              type="button"
              onClick={(e) => handleRemove(selected as string, e)}
              className="p-0.5 hover:text-rose-500 rounded"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#FF6B00]" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Suggestions Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#142033] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = selectedArray.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                    activeIndex === idx
                      ? "bg-orange-500/10 text-[#FF6B00] dark:text-[#FF8A00]"
                      : isSelected
                      ? "bg-slate-100/70 dark:bg-slate-800 text-[#142033] dark:text-white"
                      : "text-[#142033] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#FF6B00] shrink-0 ml-2" />}
                </div>
              );
            })
          ) : (
            <div className="py-3 px-3 text-center text-xs text-[#667085] dark:text-slate-400">
              <p>No matching results</p>
              {allowCustom && query.trim() && (
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-xs font-semibold text-[#FF6B00] hover:bg-orange-500/25 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add "{query.trim()}"</span>
                </button>
              )}
            </div>
          )}

          {/* Allow custom entry option when query is not exact match */}
          {allowCustom && query.trim() && !isExactMatch && filteredOptions.length > 0 && (
            <div
              onClick={handleAddCustom}
              className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-1 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#FF6B00] hover:bg-orange-500/10 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add custom: "{query.trim()}"</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
