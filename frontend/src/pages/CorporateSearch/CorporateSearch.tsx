import { Input } from "@/components/ui/input";
import GradientCard from "./components/GradientCard";
import CompanyCard from "@/components/companyCard";

function CorporateSearch() {
  return (
    <div className="flex flex-col items-center justify-between h-screen">
      <main className="flex flex-col items-center h-screen">
        <div className="flex flex-col items-center justify-end w-[360px] h-1/3">
          <h1 className="text-2xl font-bold">분석할 기업을 검색하세요.</h1>
          <Input />
        </div>
        <div className="flex justify-start gap-4 w-[968px] mx-auto flex-wrap">
          <GradientCard
            width={230}
            height={360}
            initialWidth={230}
            initialHeight={180}
            corName="삼성 전자"
            corSize="대기업"
            industryName="전자/제조/IT"
            region="서울"
            updatedAt="1시간 전"
            isGradient={true}
          ></GradientCard>
          <GradientCard
            width={230}
            height={360}
            initialWidth={230}
            initialHeight={180}
            corName="네이버"
            corSize="대기업"
            industryName="전자/제조/IT"
            region="판교"
            updatedAt="1시간 전"
            isGradient={true}
          ></GradientCard>
          <GradientCard
            width={230}
            height={360}
            initialWidth={230}
            initialHeight={180}
            corName="가비아"
            corSize="중견기업"
            industryName="전자/제조/IT"
            region="서울"
            updatedAt="1시간 전"
            isGradient={true}
          ></GradientCard>
          <GradientCard
            width={230}
            height={360}
            initialWidth={230}
            initialHeight={180}
            corName="삼성 전자"
            corSize="대기업"
            industryName="전자/제조/IT"
            region="서울"
            updatedAt="1시간 전"
            isGradient={true}
          ></GradientCard>
          <CompanyCard
            width={230}
            height={360}
            initialWidth={230}
            initialHeight={180}
            corName="삼성 화재"
            corSize="대기업"
            industryName="전자/제조/IT"
            region="대전"
            updatedAt="1시간 전"
            isGradient={false}
          ></CompanyCard>
        </div>
      </main>
    </div>
  );
}

export default CorporateSearch;
