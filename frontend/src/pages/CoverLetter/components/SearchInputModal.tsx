import { Button } from "@/components/Button";
import { ChangeEvent, useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { SearchType } from "./JobCompanyForm";
import { useGetCompanies } from "@/hooks/CompanyHooks";

interface SearchInput {
  type: SearchType;
  modalClose: () => void;
}

//타입에 따라서 부르는 데이터 분개
function SearchInputModal({ modalClose, type }: SearchInput) {
  const [searchListOpen, setSearchListOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const { data, isError, isLoading } = useGetCompanies(keyword);
  console.log(data);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timer = setTimeout(() => {
      console.log(`${keyword} 검색 실행`);
      setKeyword(e.target.value);
    }, 300);

    return () => clearTimeout(timer);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      modalClose();
    }
  };

  const contents = {
    title: type === "job" ? "직무명을 검색해 주세요" : "기업명을 검색해 주세요",
    placeholder: type === "job" ? "직무명 입력" : "기업명 입력",
  };
  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container w-100 h-auto max-h-70 transition-all duration-300 ease-in-out">
          <div className="font-bold text-xl mb-2">{contents.title}</div>
          <form action="" className="flex">
            <input
              type="text"
              placeholder={contents.placeholder}
              className="relative border-2 h-10 pl-3 w-full rounded-l-xl outline-0 focus:border-primary focus:border-2 duration-100"
              onChange={handleOnChange}
            />

            <Button className="w-10 h-10 rounded-l-none rounded-r-xl">
              <AiOutlineSearch className="size-5"></AiOutlineSearch>
            </Button>
          </form>
          {data && (
            <div className="border border-b-0 rounded overflow-y-auto mt-3">
              {data.map((el) => (
                <div
                  key={el.id}
                  className="cursor-pointer text-sm border-b-1 grid grid-cols-10 items-center h-11 px-3 hover:border-primary hover:border-2 transition-all duration-150 hover:bg-secondary-light group:active:bg-primary  "
                >
                  <span className=" col-span-1 group-active:bg-active group-active:border-active duration-100 border bg-secondary-light rounded-full size-7 flex justify-center items-center font-semibold text-primary text-sm aspect-square">
                    {el.companyName[0]}
                  </span>
                  <span className="col-span-3 font-medium text-left ml-3">
                    {el.companyName}
                  </span>
                  <span className="col-span-3 text-right ">
                    {el.companyLocation}
                  </span>
                  <span className="col-span-3 text-right ">
                    {el.companySize}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchInputModal;
