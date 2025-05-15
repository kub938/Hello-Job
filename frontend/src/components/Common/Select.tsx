import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";

interface SelectProps {
  options: { value: string; label: string }[];
  value: number;
  onChange: (value: number) => void;
  label?: string;
  require?: boolean;
  placeholder?: string;
  width?: string;
}

function Select({
  options,
  value,
  onChange,
  label,
  require,
  placeholder = "선택해주세요",
  width = "100%",
}: SelectProps) {
  const selectedOption = options.find((option) => option.value === value.toString());

  return (
    <div className="my-2" style={{ width }}>
      {label && (
        <div className="text-foreground text-sm font-semibold mb-2">
          {label} {require && <span className="text-destructive">*</span>}
        </div>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative pb-3">
          <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            <span className="block truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <FaChevronDown className="h-4 w-4 text-gray-400" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                      active ? "bg-primary text-white" : "text-gray-900"
                    }`
                  }
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                            active ? "text-white" : "text-primary"
                          }`}
                        >
                          ✓
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

export default Select;
