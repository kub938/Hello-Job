import { Link } from "react-router";

function ResultPage() {
  return (
    <>
      <div className="mb-4 ">
        <h2 className="text-2xl font-bold">면접 결과</h2>
        <p className="text-sm text-gray-500">
          2025년 4월 24일 • 단일 문항 연습
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-secondary-light">
            <span className="text-3xl font-bold text-primary">85</span>
          </div>
          <span className="text-sm text-gray-500">총점</span>

          <div className="mt-4 w-full space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">답변 내용</span>
                <span className="text-xs text-gray-500">85/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-[85%] rounded-full bg-primary"></div>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">답변 구성</span>
                <span className="text-xs text-gray-500">90/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-[90%] rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium">발표 속도</h3>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">발음 명확성</span>
            <span className="text-xs text-gray-500">80/100</span>
          </div>
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-[80%] rounded-full bg-primary"></div>
          </div>

          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">발음 명확성</span>
            <span className="text-xs text-gray-500">85/100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-[85%] rounded-full bg-primary"></div>
          </div>
        </div>

        <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium">답변 시간</h3>
          <div className="mb-2 text-2xl font-bold">2분 35초</div>
          <p className="mb-4 text-xs text-gray-500">(적정 시간: 2-3분)</p>

          <div className="mt-auto">
            <Link to="#" className="text-sm text-primary hover:underline">
              답변 영상 보기
            </Link>
            <div className="mt-2">
              <Link to="#" className="text-sm text-gray-500 hover:underline">
                내 목소리 확인하기
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 border-b">
        <div className="flex space-x-6">
          <button className="border-b-2 border-primary px-4 py-2 font-medium text-primary">
            질문 & 답변
          </button>
          <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">
            종합 피드백
          </button>
          <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">
            개선 포인트
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-secondary-light p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-primary">
            Q
          </div>
          <p>본인의 강점과 약점에 대해 말씀해 주세요.</p>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-primary">
            A
          </div>
          <div>
            <p className="text-sm text-gray-700">
              저의 가장 큰 강점은 문제 해결 능력이라고 생각합니다. 어려운
              상황에서도 다양한 방법으로 접근해 해결책을 찾아내는 편입니다.
              프로젝트에서 예상치 못한 발생했을 때, 팀원들과 함께 체계적으로
              원인을 분석하고 대안을 찾아 결국 성공적으로 마무리했던 경험이
              있습니다. 약점은 가끔 완벽주의 성향을 보이는 점입니다. 이로 인해
              새로 시작에 너무 집중하여 시간이 오래 걸릴 때가 있어, 중요도와
              시간 관리를 철저히 하려고 노력하고 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-secondary-light p-6">
        <h3 className="mb-4 text-lg font-medium">AI 피드백</h3>
        <p className="text-sm text-gray-700">
          답변이 구체적인 사례를 포함하고 있어 설득력이 있습니다. 강점과 약점
          모두 실제 경험을 바탕으로 설명한 점이 좋습니다. 특히 약점을 언급할 때
          그것을 개선하기 위한 노력도 함께 말한 점이 인상적입니다. 다만, 강점에
          대한 구체적인 사례를 더 자세히 설명하면 더 효과적일 것 같습니다.
          전체적으로 논리적인 구성과 명확한 전달력을 갖춘 답변입니다.
        </p>
      </div>

      <div className="flex justify-end">
        <Link
          to="/"
          className="rounded-md bg-primary px-6 py-2 text-white hover:bg-accent"
        >
          메인으로
        </Link>
      </div>
    </>
  );
}
export default ResultPage;
