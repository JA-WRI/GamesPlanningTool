import React from 'react';
import Image from 'next/image';
// AI was only used to research how to code ceratin parts ex: the tailwind functionalities
// AI usage - 5%
export default function page() {
  return (
    <div className="min-h-screen bg-[#830D0D] flex flex-col items-center justify-center px-4 py-2">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/COC_logo_colored.svg"
            alt="Company log"
            width={60}
            height={60}
            className="w-20 h-20 md:w-[110px] md:h-[110px]"
          />
        </div>

        <h1 className="text-2xl md:text-4xl text-black font-extrabold mb-8 md:mb-10 text-center">
          Games Planning Tool
        </h1>

        <div>
          <a
            href="/auth/login"
            className="block text-center mt-2 bg-[#830D0D] text-white font-medium py-3 rounded-2xl hover:bg-[#6b0a0a] transition-colors"
          >
            Log In
          </a>
        </div>
      </div>
    </div>
  );
}
