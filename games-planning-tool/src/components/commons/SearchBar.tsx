import {Search} from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchBar({value, onChange, placeholder = "Type to search"}: SearchBarProps) {
    return (
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder}
                className="w-full
                    h-10
                    rounded-full
                    border
                    border-gray-300
                    bg white
                    px-4
                    pr-12
                    text-sm
                    text-gray-900
                    outline-none
                    "/>

            <Search
                size={18}
                className="absolute right-3 top-2.5 text-gray-500"
                />
        </div>
    );
}