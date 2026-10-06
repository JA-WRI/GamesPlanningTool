// 60% AI generated 
import { inputClass, onlyDigits } from '../_lib/utils';
import {
  DateValue,
  InvalidParts,
  isInRange,
  noInvalidParts,
} from '../_lib/dateLogic';
//reusable DD/MM/YYYY date field(reuse it in Steps 3 and 4)

type DateInputProps = {
  label: string; // read by screen readers
  value: DateValue;
  onChange: (value: DateValue) => void;
  invalidParts?: InvalidParts; // which boxes to show in red
  onBlur?: () => void; // user left the whole date (not just DD -> MM)
};

// DD / MM / YYYY boxes
export default function DateInput({
  label,
  value,
  onChange,
  invalidParts = noInvalidParts,
  onBlur,
}: DateInputProps) {
  // "!" so red beats the grey border
  function boxClass(isInvalid: boolean) {
    return `${inputClass} px-2 ${isInvalid ? 'border-red-500!' : ''}`;
  }

  function handleDayChange(text: string) {
    const day = onlyDigits(text);
    if (isInRange(day, 31)) onChange({ ...value, day });
  }

  function handleMonthChange(text: string) {
    const month = onlyDigits(text);
    if (isInRange(month, 12)) onChange({ ...value, month });
  }

  return (
    <div
      className="grid grid-cols-[1fr_1fr_1.5fr] gap-1"
      onBlur={(e) => {
        // ignore moving between our own boxes
        if (!e.currentTarget.contains(e.relatedTarget)) onBlur?.();
      }}
    >
      <input
        aria-label={`${label} day`}
        aria-invalid={invalidParts.day}
        inputMode="numeric"
        maxLength={2}
        placeholder="DD"
        value={value.day}
        onChange={(e) => handleDayChange(e.target.value)}
        className={boxClass(invalidParts.day)}
      />
      <input
        aria-label={`${label} month`}
        aria-invalid={invalidParts.month}
        inputMode="numeric"
        maxLength={2}
        placeholder="MM"
        value={value.month}
        onChange={(e) => handleMonthChange(e.target.value)}
        className={boxClass(invalidParts.month)}
      />
      <input
        aria-label={`${label} year`}
        aria-invalid={invalidParts.year}
        inputMode="numeric"
        maxLength={4}
        placeholder="YYYY"
        value={value.year}
        onChange={(e) =>
          onChange({ ...value, year: onlyDigits(e.target.value) })
        }
        className={boxClass(invalidParts.year)}
      />
    </div>
  );
}
