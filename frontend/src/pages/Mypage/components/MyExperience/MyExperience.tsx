import { useState } from "react";
import MypageHeader from "../MypageHeader";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyExperienceList } from "@/api/mypageApi";
import { Button } from "@/components/Button";
import { FaPlus } from "react-icons/fa";
import DetailModal from "@/components/Common/DetailModal";
import ReadMyExperience from "./ReadMyExperience";

function MyExperience() {
  const [selectedCategory, setSelectedCategory] = useState("최신순");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [experienceId, setExperienceId] = useState<number>(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "0");

  const { data: myExperienceListData, isLoading } = useQuery({
    queryKey: ["myExperienceList", page],
    queryFn: async () => {
      const response = await getMyExperienceList(Number(page));
      return response.data;
    },
  });

  const totalPages = myExperienceListData?.totalPages || 1;

  const openReadModal = (id: number) => {
    setExperienceId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 검색어에 따른 필터링
  // 현재 페이지에서만임. 수정 필요. 현재 사용하지 않는 로직
  const filteredMyExperienceList = myExperienceListData?.content?.filter(
    (content) => content
  );

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setSearchParams({ page: String(pageNumber - 1) });
  };

  // 선택 카테고리 변경 핸들러
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="flex-1 p-4 md:p-6 md:ml-56 transition-all duration-300">
      <MypageHeader title="내가 작성한 기타 경험" />
      <div className="flex justify-between items-center mb-6">
        {/* 검색 UI */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-auto">
            <select
              className="px-4 py-2 border rounded-md bg-white w-full md:w-auto focus:outline-none focus:ring-1 focus:ring-primary"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="최신순">최신순</option>
              {/* <option value="오래된순">오래된순</option> */}
              {/* <option value="기업명">기업명</option>
              <option value="직무명">직무명</option> */}
            </select>
          </div>
          {/* <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="w-full px-4 py-2 pr-10 border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </button>
          </div> */}
        </div>
        <Button variant="default">
          <Link to="/" className="flex items-center">
            <FaPlus className="mr-2" /> 기타 경험 작성
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            자기소개서 목록을 불러오고 있습니다...
          </div>
        ) : filteredMyExperienceList && filteredMyExperienceList.length > 0 ? (
          filteredMyExperienceList.map((myExperience) => (
            <div
              key={myExperience.experienceId}
              className="bg-white cursor-pointer p-6 rounded-lg shadow-sm border border-gray-100 hover:pl-[27px] pl-6 hover:shadow-md border-l-primary border-l-4 hover:rounded-l-sm rounded-l-none hover:bg-purple-50/30 hover:border-purple-200 hover:border-l-[1px] transition-shadow"
              onClick={() => openReadModal(myExperience.experienceId)}
            >
              <div className="flex justify-start items-start mb-3">
                <h3 className="text-lg font-medium">
                  {myExperience.experienceName}
                </h3>
              </div>
              <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                {myExperience.experienceRole}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  작성일: {myExperience.updatedAt}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            검색 결과가 없습니다
          </div>
        )}
      </div>

      {/* 페이지네이션 (하단) */}
      {filteredMyExperienceList && (
        <div className="flex justify-center mt-6">
          <nav className="flex space-x-1">
            <button
              onClick={() => handlePageChange(Math.max(1, page))}
              disabled={page === 0}
              className={`px-3 py-1 rounded-md ${
                page === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              이전
            </button>
            {Array.from(
              { length: Math.min(totalPages - Math.floor(page / 10) * 10, 10) },
              (_, i) => Math.floor(page / 10) * 10 + 1 + i
            ).map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`px-3 py-1 rounded-md cursor-pointer ${
                  page === number - 1
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 2))}
              disabled={page === totalPages - 1}
              className={`px-3 py-1 rounded-md ${
                page === totalPages - 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              다음
            </button>
          </nav>
        </div>
      )}
      {isModalOpen && (
        <DetailModal isOpen={isModalOpen} onClose={closeModal}>
          <ReadMyExperience onClose={closeModal} id={experienceId} />
        </DetailModal>
      )}
    </div>
  );
}

export default MyExperience;
