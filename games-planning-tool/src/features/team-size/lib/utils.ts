export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

// same style for every input
export const inputClass =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7B1A15] focus:outline-none';
