import Image from 'next/image';
import GamesSelector from './GamesSelector';
import NsoSelector from './NsoSelector';

export default function Header() {
  return (
    <div className="flex items-center justify-between bg-[#BD6915] p-3">
      <div className="page-container justify-between flex items-center">
        <div className="flex items-center">
          <div className="flex items-center gap-5">
            <Image
              src="/Team-Canada-logo.png"
              alt="team canada logo"
              width={30}
              height={30}
              className="gap-2"
            />
            <div className="text-xl font-bold text-white lg:pr-10 2xl:pr-15">
              Games Planning Tool
            </div>
          </div>
          <div className="flex gap-8">
            <GamesSelector />
            <NsoSelector />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center text-sm">
            <div className="font-bold text-white">Alex Dunphy</div>
            <div className="text-xs text-gray-300">COC-Department</div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold">
            AD
          </button>
        </div>
      </div>
    </div>
  );
}
