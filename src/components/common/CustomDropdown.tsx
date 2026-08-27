import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badgeDotColor?: string;
}

interface CustomDropdownProps<T extends string = string> {
  label?: string;
  prefixIcon?: React.ReactNode;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  menuWidth?: string;
  ariaLabel?: string;
}

export function CustomDropdown<T extends string = string>({
  label,
  prefixIcon,
  value,
  options,
  onChange,
  className = "",
  menuWidth = "w-44",
  ariaLabel,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle option select
  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel || label}
        aria-expanded={isOpen}
        className={`flex items-center gap-2 px-3 py-2 bg-surface text-xs border rounded-xl transition-all cursor-pointer select-none ${
          isOpen
            ? "border-primary ring-2 ring-primary/15 shadow-xs"
            : "border-outline-variant/80 hover:border-outline hover:bg-surface-container-low"
        }`}
      >
        {prefixIcon && <span className="text-secondary">{prefixIcon}</span>}
        {label && <span className="text-secondary font-medium">{label}</span>}

        <div className="flex items-center gap-1.5 font-bold text-on-surface">
          {selectedOption?.badgeDotColor && (
            <span
              className={`w-2 h-2 rounded-full ${selectedOption.badgeDotColor}`}
            />
          )}
          <span>{selectedOption?.label || value}</span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 ${menuWidth} z-50 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg p-1.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md`}
          role="menu"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-on-surface hover:bg-surface-container hover:text-on-surface"
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  {option.badgeDotColor && (
                    <span
                      className={`w-2 h-2 rounded-full ${option.badgeDotColor}`}
                    />
                  )}
                  {option.icon && (
                    <span
                      className={
                        isSelected ? "text-primary" : "text-secondary"
                      }
                    >
                      {option.icon}
                    </span>
                  )}
                  <span>{option.label}</span>
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
