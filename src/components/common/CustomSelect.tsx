import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = '请选择',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`custom-select-container ${className} ${disabled ? 'disabled' : ''}`}
      ref={selectRef}
    >
      <div className="select-trigger" onClick={handleToggle}>
        <span className="selected-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}></span>
      </div>

      {isOpen && !disabled && (
        <ul className="options-list">
          {options.map(option => (
            <li
              key={option.value}
              className={`option-item ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;