import { Input } from "@/components/ui/input";
import GradientCard from "../../components/GradientCard";
import { useState } from "react";
import SelectModal from "./components/SelectModal";

// 더미 데이터 배열 정의
interface CorporateData {
  id: string;
  corName: string;
  corSize: string;
  industryName: string;
  region: string;
  updatedAt: string;
}

const dummyCorporates: CorporateData[] = [
  {
    id: "1",
    corName: "삼성 전자",
    corSize: "대기업",
    industryName: "전자/제조/IT",
    region: "서울",
    updatedAt: "1시간 전",
  },
  {
    id: "2",
    corName: "네이버",
    corSize: "대기업",
    industryName: "전자/제조/IT",
    region: "판교",
    updatedAt: "1시간 전",
  },
  {
    id: "3",
    corName: "가비아",
    corSize: "중견기업",
    industryName: "전자/제조/IT",
    region: "서울",
    updatedAt: "1시간 전",
  },
  {
    id: "4",
    corName: "삼성 전자",
    corSize: "대기업",
    industryName: "전자/제조/IT",
    region: "서울",
    updatedAt: "1시간 전",
  },
  {
    id: "5",
    corName: "삼성 전자",
    corSize: "대기업",
    industryName: "전자/제조/IT",
    region: "서울",
    updatedAt: "1시간 전",
  },
];

function CorporateSearch() {
  const [isModal, setIsModal] = useState(false);
  const [selectedCorporate, setSelectedCorporate] = useState("");
  const [selectedCorporateId, setSelectedCorporateId] = useState("");

  const handleCardClick = (corName: string, id: string) => {
    setSelectedCorporate(corName);
    setSelectedCorporateId(id);
    setIsModal(true);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full">
      <SelectModal
        isOpen={isModal}
        onClose={() => setIsModal(false)}
        corporateName={selectedCorporate}
        corporateId={selectedCorporateId}
      />
      <div className="flex flex-col items-center h-full">
        <div className="flex flex-col items-center justify-end w-full h-1/3 mt-[8vh] mb-[4vh]">
          <h1 className="text-5xl font-bold mb-8">분석할 기업을 검색하세요</h1>
          <Input className="bg-white border border-[#bdc6d8] rounded-md w-140 h-10 text-base" />
        </div>
        <h2 className="w-full text-2xl font-bold mb-[2vh]">기업 목록</h2>
        <div className="flex justify-start gap-4 w-[968px] mx-auto flex-wrap pb-[196px]">
          {dummyCorporates.map((corporate) => (
            <GradientCard
              key={corporate.id}
              id={corporate.id}
              width={230}
              height={360}
              initialWidth={230}
              initialHeight={180}
              corName={corporate.corName}
              corSize={corporate.corSize}
              industryName={corporate.industryName}
              region={corporate.region}
              updatedAt={corporate.updatedAt}
              isGradient={true}
              onClick={() => handleCardClick(corporate.corName, corporate.id)}
              className=""
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CorporateSearch;
