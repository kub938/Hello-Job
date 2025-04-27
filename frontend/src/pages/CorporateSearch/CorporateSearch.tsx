import { Input } from "@/components/ui/input";
import GradientCard from "./components/GradientCard";

function CorporateSearch() {
  return (
    <div className="flex flex-col items-center justify-between h-screen">
      <main className="flex flex-col items-center justify-between h-screen">
        <div className="flex flex-col items-center justify-end w-[360px] h-1/3">
          <h1 className="text-2xl font-bold">분석할 기업을 검색하세요.</h1>
          <Input />
        </div>
        <GradientCard
          width={250}
          height={400}
          initialWidth={250}
          initialHeight={200}
          className="rounded-xl"
        >
          <div className="w-full h-full bg-black/10 p-4 rounded-xl">
            <h2 className="text-white text-xl font-bold">카드 제목</h2>
            <p className="text-white">카드 내용</p>
          </div>
        </GradientCard>
      </main>
    </div>
  );
}

export default CorporateSearch;
