import React from 'react';
import Image from 'next/image';

export default function Header() {
  return (
    <div className="flex items-center justify-between bg-[#092441] p-5">
      <div className="flex items-center justify-between gap-12">
        <div className="flex items-center gap-4">
          <Image
            src="/Team-Canada-logo.png"
            alt="team canada logo"
            width={30}
            height={30}
            className="gap-2"
          />
          <div className="text-2xl font-bold text-white">
            <span className="hidden sm:block">Games Planning Tool</span>
            <span className="block sm:hidden">GPT</span>
          </div>
        </div>
        <div className="rounded-full px-6 bg-white p-2 font-semibold text-xs">
          LA 2028
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-center text-xs">
          <div className="font-bold text-white">
            <span className="hidden sm:block">Alex Dunphy</span>
          </div>
          <div className="text-xs text-gray-300">
            <span className="hidden sm:block">NSO - Title</span>
          </div>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold">
          AD
        </button>
      </div>
    </div>
  );
}
