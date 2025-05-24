import React from 'react';
import Orb from '@/components/Orb';
import Iridescence from '@/components/BackgroundAnimation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-[600px] h-[600px] group">
          {/* Orb layer */}
          <div className="absolute inset-0 z-0">
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
            />
          </div>
          {/* Content layer */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="max-w-md w-full space-y-8 backdrop-blur-sm bg-white/30 p-8 rounded-3xl pointer-events-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 