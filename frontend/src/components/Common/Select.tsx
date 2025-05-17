import { Listbox, Transition } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import { Fragment } from "react";
import { getScheduleCoverLettersResponse } from "@/types/scheduleApiTypes";
import { format, parseISO } from "date-fns";

interface SelectProps {
  options: getScheduleCoverLettersResponse[];
  value: number | "none" | null;
  onChange: (value: number | "none" | null) => void;
  label?: string;
  require?: boolean;
  placeholder?: string;
  width?: string;
}

function formatDatetoDot(date: string) {
  try {
    return format(parseISO(date), "yyyy.MM.dd");
  } catch (error) {
    return date;
  }
}

export default function Select({
  options,
  value,
  onChange,
  label,
  require,
  placeholder = "일정에 맞는 자기소개서를 선택해주세요",
  width = "100%",
}: SelectProps) {
  const selectedOption =
    value === "none"
      ? { coverLetterId: "none", coverLetterTitle: "선택 안 함", updatedAt: "" }
      : options.find((option) => option.coverLetterId === value);

  const modifiedOptions = [
    { coverLetterId: "none", coverLetterTitle: "선택 안 함", updatedAt: "" },
    ...options,
  ];

  return (
    <div className="my-2" style={{ width }}>
      {label && (
        <div className="text-foreground text-sm font-semibold mb-2">
          {label} {require && <span className="text-destructive">*</span>}
        </div>
      )}

      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative pb-3">
            <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <span className="block truncate">
                {selectedOption
                  ? `${selectedOption.coverLetterTitle}` +
                    (selectedOption.updatedAt
                      ? `(최종 수정일: ${formatDatetoDot(
                          selectedOption.updatedAt
                        )})`
                      : "")
                  : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FaChevronDown className="h-4 w-4 text-gray-400" />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {modifiedOptions.map((option) => (
                  <Listbox.Option
                    key={option.coverLetterId}
                    value={option.coverLetterId}
                  >
                    {({ selected, active }) => (
                      <div
                        className={`relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                          active ? "bg-primary text-white" : "text-gray-900"
                        }`}
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <div className="truncate text-sm font-medium">
                            {option.coverLetterTitle}
                          </div>
                          <div
                            className={`text-xs ${
                              active ? "text-gray-100" : "text-gray-500"
                            }`}
                          >
                            {option.updatedAt
                              ? `최종 수정일: ${formatDatetoDot(
                                  option.updatedAt
                                )}`
                              : ""}
                          </div>
                        </div>

                        {selected && (
                          <span
                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                              active ? "text-white" : "text-primary"
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
}
