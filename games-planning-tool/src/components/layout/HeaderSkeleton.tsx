// Placeholder with the same size as Header + Navbar, shown while AppChrome loads.
import Image from 'next/image';

const pill = 'h-8 rounded-full bg-white/30';

export default function HeaderSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex items-center justify-between bg-terracotta p-3">
        <div className="page-container flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center gap-5">
              <Image
                src="/Team-Canada-logo.png"
                alt=""
                width={30}
                height={30}
                className="w-auto"
              />
              <div className="text-xl font-bold text-white lg:pr-10 2xl:pr-15">
                Games Planning Tool
              </div>
            </div>
            <div className="flex animate-pulse gap-8">
              <div className={`${pill} w-40`} />
              <div className={`${pill} w-40`} />
            </div>
          </div>
          <div className="flex animate-pulse items-center gap-4">
            <div className={`${pill} w-36`} />
            <div className="h-10 w-10 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
      <div className="h-12 border-b border-gray-200" />
    </div>
  );
}
