import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "font-serif font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-odd-accent focus:ring-offset-2 focus:ring-offset-odd-bg disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-odd-accent text-odd-bg hover:bg-odd-accentHover px-6 py-3 border-2 border-transparent rounded-sm shadow-[4px_4px_0px_0px_rgba(68,64,60,0.5)] active:shadow-none active:translate-x-1 active:translate-y-1",
    secondary: "bg-transparent text-odd-muted border-2 border-odd-border hover:text-odd-accent hover:border-odd-accent px-4 py-2 rounded-sm",
    icon: "p-2 text-odd-muted hover:text-odd-accent",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Working...</span>
        </span>
      ) : children}
    </button>
  );
};