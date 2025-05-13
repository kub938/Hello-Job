import { Camera } from "lucide-react";
import { Link } from "react-router";

function PreparePage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">면접 준비</h2>
        <p className="text-gray-600">
          면접을 시작하기 전에 카메라와 마이크를 테스트해보세요
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-lg bg-secondary-light p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-primary">
              !
            </div>
            <div>
              <h4 className="font-medium">선택한 질문:</h4>
              <p className="text-sm text-gray-600">
                본인의 강점과 약점에 대해 말씀해 주세요.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                카테고리: 자기소개 | 예상 답변 시간: 2-3분
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-lg bg-gray-900">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 mx-auto">
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-400">카메라 화면이 표시됩니다</p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">카메라</label>
            <select className="w-full rounded-md border border-gray-300 p-2 text-sm">
              <option>내장 웹캠(1080p)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">마이크</label>
            <select className="w-full rounded-md border border-gray-300 p-2 text-sm">
              <option>내장 마이크</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between">
          <Link
            to="/interview/single-question"
            className="rounded-md border border-gray-200 px-6 py-2 text-gray-600 hover:bg-gray-50"
          >
            이전
          </Link>
          <Link
            to="/interview/mock-interview"
            className="rounded-md bg-primary px-6 py-2 text-white hover:bg-accent"
          >
            면접 시작하기
          </Link>
        </div>
      </div>
    </>
  );
}

export default PreparePage;
