import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md' }) => {
  const iconSize = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl sm:text-2xl';
  const subSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px] sm:text-[11px]';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Handcrafted Artisanal Seal Logo Emblem */}
      <div className={`${iconSize} relative rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-400 p-[2px] shadow-lg shadow-rose-600/25 shrink-0 transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300`}>
        <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#2e1509] via-[#1f0d05] to-[#140803] flex items-center justify-center p-1 relative overflow-hidden">
          
          {/* Ambient Couverture Glow */}
          <div className="absolute inset-0 bg-radial from-amber-400/25 via-rose-500/10 to-transparent pointer-events-none" />

          {/* New Bespoke Adrit Creations Logo SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Royal Gold Guilloche Rim */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#acGoldGrad)"
              strokeWidth="2.5"
              strokeDasharray="3 1.5"
            />
            
            {/* Inner Tempered Chocolate Bonbon Shape */}
            <path
              d="M50 14 C68 14 84 30 84 50 C84 70 68 86 50 86 C32 86 16 70 16 50 C16 30 32 14 50 14 Z"
              fill="url(#acCocoaGrad)"
              stroke="url(#acGoldGrad)"
              strokeWidth="1.5"
            />

            {/* Stylized Intertwined "AC" Monogram (Adrit Creations) */}
            {/* "A" Form */}
            <path
              d="M40 70 L48 28 C48.5 25.5 51.5 25.5 52 28 L60 70"
              stroke="url(#acGoldGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Crossbar of A forming a delicate chocolate ribbon */}
            <path
              d="M43 55 C47 52 53 52 57 55"
              stroke="url(#acRoseGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Swirling C ribbon intertwining around A */}
            <path
              d="M66 40 C63 33 55 31 48 34 C39 38 36 49 39 60 C42 68 53 71 63 65 C67 62 69 57 69 55"
              stroke="url(#acGoldGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Artisan Crown Sparkles & Golden Cacao Nib Flecks */}
            <circle cx="50" cy="22" r="3" fill="#fef08a" />
            <circle cx="50" cy="22" r="1.5" fill="#f59e0b" />
            <circle cx="30" cy="46" r="1.8" fill="#fde047" opacity="0.9" />
            <circle cx="70" cy="46" r="1.8" fill="#fde047" opacity="0.9" />
            <circle cx="50" cy="76" r="1.8" fill="#fde047" opacity="0.9" />

            {/* Defs Gradients */}
            <defs>
              <linearGradient id="acGoldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" />
                <stop offset="0.3" stopColor="#f59e0b" />
                <stop offset="0.7" stopColor="#d97706" />
                <stop offset="1" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="acCocoaGrad" x1="50" y1="14" x2="50" y2="86" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3d1808" />
                <stop offset="0.5" stopColor="#250d03" />
                <stop offset="1" stopColor="#170601" />
              </linearGradient>
              <linearGradient id="acRoseGrad" x1="43" y1="52" x2="57" y2="55" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fb7185" />
                <stop offset="1" stopColor="#e11d48" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typographic Identity */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-brand tracking-[0.16em] font-extrabold ${titleSize} bg-gradient-to-r from-rose-700 via-amber-800 to-rose-900 bg-clip-text text-transparent`}>
            ADRIT CREATIONS
          </span>
        </div>
        <p className={`${subSize} text-rose-800 font-bold uppercase tracking-[0.18em] flex items-center gap-1.5`}>
          <span>Artisanal Homemade Chocolates</span>
          <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
          <span className="text-amber-700">Pure Cocoa</span>
        </p>
      </div>
    </div>
  );
};
