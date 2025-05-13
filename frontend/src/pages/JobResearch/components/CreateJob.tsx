import { jobRoleAnalysis } from "@/api/jobRoleAnalysisApi";
import { Button } from "@/components/Button";
import ToggleInput from "@/pages/CorporateResearch/components/ToggleInput";
import {
  JobRoleCategory,
  postJobRoleAnalysisRequest,
} from "@/types/jobResearch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface CreateJobProps {
  onClose: () => void;
  corporateId: number;
}

interface IForm {
  isPublic: boolean;
  jobRoleName: string;
  jobRoleTitle: string;
  jobRoleSkills: string;
  jobRoleWork: string;
  jobRoleRequirements: string;
  jobRolePreferences: string;
  jobRoleEtc: string;
  jobRoleCategory: JobRoleCategory;
}

function CreateJob({ onClose, corporateId }: CreateJobProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, resetField } = useForm<IForm>();

  const mutation = useMutation({
    mutationFn: async (data: postJobRoleAnalysisRequest) => {
      return await jobRoleAnalysis.postJobRoleAnalysis(data);
    },
    onSuccess: () => {
      toast.success("직무 분석이 저장되었습니다.");
      setIsSubmitting(false);
      // 메시지 전송 로직 성공 시 input 비우기
      setIsPublic(true);
      resetField("jobRoleName");
      resetField("jobRoleTitle");
      resetField("jobRoleSkills");
      resetField("jobRoleWork");
      resetField("jobRoleRequirements");
      resetField("jobRolePreferences");
      resetField("jobRoleEtc");
      resetField("jobRoleCategory");

      queryClient.invalidateQueries({
        queryKey: ["jobResearchList", String(corporateId)],
      });
      // 페이지 이동시키기
      // navigate(`/job-research/${corporateId}`);
      onClose();
    },
    onError: () => {
      toast.error("직무 분석 생성 실패");
      setIsSubmitting(false);
    },
  });

  const onValidSubmit = async (data: IForm, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    try {
      // 1) api 호출
      mutation.mutate({
        companyId: corporateId,
        isPublic: data.isPublic,
        jobRoleName: data.jobRoleName,
        jobRoleTitle: data.jobRoleTitle,
        jobRoleSkills: data.jobRoleSkills,
        jobRoleWork: data.jobRoleWork,
        jobRoleRequirements: data.jobRoleRequirements,
        jobRolePreferences: data.jobRolePreferences,
        jobRoleEtc: data.jobRoleEtc,
        jobRoleCategory: data.jobRoleCategory,
      });
    } catch (error) {
      // 에러 처리
      console.error(error);
    }
  };

  const onInvalidSubmit = (errors: FieldErrors<IForm>) => {
    if (errors.jobRoleTitle?.type === "required") {
      toast.error(errors.jobRoleTitle?.message);
    } else if (errors.jobRoleCategory?.type === "required") {
      toast.error(errors.jobRoleCategory?.message);
    } else if (errors.jobRoleName?.type === "required") {
      toast.error(errors.jobRoleName?.message);
    }

    if (errors.jobRoleTitle?.type === "maxLength") {
      toast.error(errors.jobRoleTitle?.message);
    } else if (errors.jobRoleName?.type === "maxLength") {
      toast.error(errors.jobRoleName?.message);
    } else if (errors.jobRoleSkills?.type === "maxLength") {
      toast.error(errors.jobRoleSkills?.message);
    } else if (errors.jobRoleWork?.type === "maxLength") {
      toast.error(errors.jobRoleWork?.message);
    } else if (errors.jobRoleRequirements?.type === "maxLength") {
      toast.error(errors.jobRoleRequirements?.message);
    } else if (errors.jobRolePreferences?.type === "maxLength") {
      toast.error(errors.jobRolePreferences?.message);
    } else if (errors.jobRoleEtc?.type === "maxLength") {
      toast.error(errors.jobRoleEtc?.message);
    }

    setIsSubmitting(false);
  };

  const onSubmitClicked = (e: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    if (isSubmitting) return; // 연속 클릭 방지
    setIsSubmitting(true);
    handleSubmit(onValidSubmit, onInvalidSubmit)();
  };

  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <header className="text-2xl font-bold">직무 분석 시작하기</header>

      <form
        className="flex flex-col gap-4 mt-10"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        action=""
      >
        <ToggleInput
          label={isPublic ? "공개" : "비공개"}
          description={
            isPublic
              ? "생성한 기업분석 레포트를 모든 사용자들이 이용할 수 있습니다."
              : "다른 사용자들에게는 나의 기업 분석 레포트가 보이지 않습니다."
          }
          isOn={isPublic}
          onChange={setIsPublic}
          register={register}
          name="isPublic"
          requiredMessage="필수 입력 항목입니다."
        />

        {/* 입력 폼 섹션 */}
        <div className="mt-6 flex flex-col gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#27272A]">기본 정보</h3>
            <div className="space-y-2">
              <label
                htmlFor="jobRoleTitle"
                className="text-sm font-medium text-[#6E7180]"
              >
                직무 분석 제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="jobRoleTitle"
                {...register("jobRoleTitle", {
                  required: "직무 분석 제목은 필수입니다.",
                  maxLength: {
                    value: 50,
                    message: "최대 50자리까지 입력할 수 있습니다",
                  },
                })}
                placeholder="직무 분석 제목 입력"
                type="text"
                autoComplete="off"
                className="w-full p-3 border border-[#E4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F52E0]/50 focus:border-[#6F52E0] transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="jobRoleCategory"
                  className="text-sm font-medium text-[#6E7180]"
                >
                  직무 카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="jobRoleCategory"
                  {...register("jobRoleCategory", {
                    required: "직무 카테고리는 필수입니다.",
                  })}
                  className="w-full p-3 border border-[#E4E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6F52E0]/50 focus:border-[#6F52E0] transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236E7180%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                >
                  <option value="">직무 카테고리 선택</option>
                  <option value="서버백엔드개발자">서버백엔드개발자</option>
                  <option value="프론트엔드개발자">프론트엔드개발자</option>
                  <option value="안드로이드개발자">안드로이드개발자</option>
                  <option value="iOS개발자">iOS개발자</option>
                  <option value="크로스플랫폼앱개발자">
                    크로스플랫폼앱개발자
                  </option>
                  <option value="게임클라이언트개발자">
                    게임클라이언트개발자
                  </option>
                  <option value="게임서버개발자">게임서버개발자</option>
                  <option value="DBA">DBA</option>
                  <option value="빅데이터엔지니어">빅데이터엔지니어</option>
                  <option value="인공지능머신러닝">인공지능머신러닝</option>
                  <option value="devops시스템엔지니어">
                    devops시스템엔지니어
                  </option>
                  <option value="정보보안침해대응">정보보안침해대응</option>
                  <option value="QA엔지니어">QA엔지니어</option>
                  <option value="개발PM">개발PM</option>
                  <option value="HW펌웨어개발">HW펌웨어개발</option>
                  <option value="SW솔루션">SW솔루션</option>
                  <option value="헬스테크">헬스테크</option>
                  <option value="VRAR3D">VRAR3D</option>
                  <option value="블록체인">블록체인</option>
                  <option value="기술지원">기술지원</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="jobRoleName"
                  className="text-sm font-medium text-[#6E7180]"
                >
                  직무명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="jobRoleName"
                  {...register("jobRoleName", {
                    required: "직무명은 필수입니다.",
                    maxLength: {
                      value: 30,
                      message: "최대 30자리까지 입력할 수 있습니다",
                    },
                  })}
                  placeholder="직무명 입력"
                  type="text"
                  autoComplete="off"
                  className="w-full p-3 border border-[#E4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F52E0]/50 focus:border-[#6F52E0] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#27272A]">
              직무 상세 정보
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="jobRoleSkills"
                  className="text-sm font-medium text-[#6E7180] flex justify-between"
                >
                  <span>기술스택</span>
                  <span className="text-xs text-[#9CA3AF]">최대 500자</span>
                </label>
                <textarea
                  id="jobRoleSkills"
                  {...register("jobRoleSkills", {
                    maxLength: {
                      value: 500,
                      message: "최대 500자리까지 입력할 수 있습니다",
                    },
                  })}
                  placeholder="기술스택 입력(선택사항)"
                  rows={3}
                  className="w-full p-3 border border-[#E4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F52E0]/50 focus:border-[#6F52E0] transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jobRoleWork"
                  className="text-sm font-medium text-[#6E7180] flex justify-between"
                >
                  <span>주요 업무</span>
                  <span className="text-xs text-[#9CA3AF]">최대 500자</span>
                </label>
                <textarea
                  id="jobRoleWork"
                  {...register("jobRoleWork", {
                    maxLength: {
                      value: 500,
                      message: "최대 500자리까지 입력할 수 있습니다",
                    },
                  })}
                  placeholder="주요 업무 입력(선택사항)"
                  rows={4}
                  className="w-full p-3 border border-[#E4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F52E0]/50 focus:border-[#6F52E0] transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jobRoleRequirements"
                  className="text-sm font-medium text-[#6E7180] flex justify-between"
                >
                  <span>자격요건</span>
                  <span className="text-xs text-[#9CA3AF]">최대 500자</span>
                </label>
                <textarea
                  id="jobRoleRequirements"
                  {...register("jobRoleRequirements", {
                    maxLength: {
                      value: 500,
                      message: "최대 500자리까지 입력할 수 있습니다",
                    },
                  })}
                  placeholder="자격요건 입력(선택사항)"
                  rows={4}
                  className="w-full p-3 border border-[#E4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F52E0]/50 focus:border-[#6F52E0] transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jobRolePreferences"
                  className="text-sm font-medium text-[#6E7180] flex justify-between"
                >
                  <span>우대사항</span>
                  <span className="text-xs text-[#9CA3AF]">최대 500자</span>
                </label>
                <textarea
                  id="jobRolePreferences"
                  {...register("jobRolePreferences", {
                    maxLength: {
                      value: 500,
                      message: "최대 500자리까지 입력할 수 있습니다",
                    },
                  })}
                  placeholder="우대사항 입력(선택사항)"
                  rows={3}
                  className="w-full p-3 border border-[#E4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F52E0]/50 focus:border-[#6F52E0] transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jobRoleEtc"
                  className="text-sm font-medium text-[#6E7180] flex justify-between"
                >
                  <span>기타 유저 입력사항</span>
                  <span className="text-xs text-[#9CA3AF]">최대 500자</span>
                </label>
                <textarea
                  id="jobRoleEtc"
                  {...register("jobRoleEtc", {
                    maxLength: {
                      value: 500,
                      message: "최대 500자리까지 입력할 수 있습니다",
                    },
                  })}
                  placeholder="기타 유저 입력사항(선택사항)"
                  rows={3}
                  className="w-full p-3 border border-[#E4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F52E0]/50 focus:border-[#6F52E0] transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <Button
            className="px-6 py-2.5 text-base"
            onClick={onClose}
            variant="white"
          >
            창 닫기
          </Button>
          <Button
            className="px-6 py-2.5 text-base"
            onClick={onSubmitClicked}
            variant="default"
            disabled={isSubmitting || mutation.isPending}
          >
            {isSubmitting || mutation.isPending ? "저장 중..." : "생성하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateJob;
