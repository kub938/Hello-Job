import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

function SingleQuestionPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">단일 문항 연습</h2>
        <p className="text-gray-600">
          연습하고 싶은 질문 카테고리를 선택해주세요
        </p>
      </div>

      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max border-b">
          <button className="border-b-2 border-primary bg-primary px-6 py-3 font-medium text-primary-foreground">
            자기소개
          </button>
          <button className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-50">
            직무 역량
          </button>
          <button className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-50">
            지원 동기
          </button>
          <button className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-50">
            상황 대처
          </button>
          <button className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-50">
            인성/가치관
          </button>
          <button className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-50">
            마무리
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-4 text-lg font-bold">자기소개 질문 리스트</h3>
      </div>

      <div className="space-y-4">
        <Link
          to="/interview/prepare"
          className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary/30 hover:bg-secondary-light"
        >
          <div className="flex items-center justify-between">
            <p>1분 자기소개를 해주세요.</p>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        <Link
          to="/interview/prepare"
          className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary/30 hover:bg-secondary-light"
        >
          <div className="flex items-center justify-between">
            <p>본인의 강점과 약점에 대해 말씀해 주세요.</p>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        <Link
          to="/interview/prepare"
          className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary/30 hover:bg-secondary-light"
        >
          <div className="flex items-center justify-between">
            <p>자신을 표현할 수 있는 키워드 3가지와 그 이유를 설명해주세요.</p>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        <Link
          to="/interview/prepare"
          className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary/30 hover:bg-secondary-light"
        >
          <div className="flex items-center justify-between">
            <p>
              학교 생활 또는 직장 생활 중 기억에 남는 경험에 대해
              이야기해주세요.
            </p>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>
      </div>

      <div className="mt-8 flex justify-between">
        <Link
          to="/"
          className="rounded-md border border-gray-200 px-6 py-2 text-gray-600 hover:bg-gray-50"
        >
          이전
        </Link>
        <Link
          to="/interview/prepare"
          className="rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-accent"
        >
          선택 완료
        </Link>
      </div>
    </>
  );
}
export default SingleQuestionPage;
