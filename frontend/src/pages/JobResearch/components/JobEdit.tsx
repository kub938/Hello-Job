import { jobRoleAnalysis } from "@/api/jobRoleAnalysisApi";
import ToggleInput from "@/pages/CorporateResearch/components/ToggleInput";
import {
  getJobRoleDetail,
  JobRoleCategory,
  putJobRoleAnalysisRequest,
} from "@/types/jobResearch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { toast } from "sonner";

interface JobEditProps {
  onEditComplete: () => void;
  jobDetail: getJobRoleDetail;
  jobId: number;
  companyId: string;
}

function JobEdit({
  onEditComplete,
  jobDetail,
  jobId,
  companyId,
}: JobEditProps) {
  const [isPublic, setIsPublic] = useState(jobDetail.isPublic);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm<putJobRoleAnalysisRequest>({
    defaultValues: {
      jobRoleAnalysisId: jobId,
      companyId: Number(companyId),
      jobRoleName: jobDetail.jobRoleName,
      jobRoleTitle: jobDetail.jobRoleAnalysisTitle,
      jobRoleSkills: jobDetail.jobRoleSkills,
      jobRoleWork: jobDetail.jobRoleWork,
      jobRoleRequirements: jobDetail.jobRoleRequirements,
      jobRolePreferences: jobDetail.jobRolePreferences,
      jobRoleEtc: jobDetail.jobRoleEtc,
      jobRoleCategory: jobDetail.jobRoleCategory as JobRoleCategory,
      isPublic: jobDetail.isPublic,
    },
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (jobDetail) {
      reset({
        jobRoleAnalysisId: jobId,
        companyId: Number(companyId),
        jobRoleName: jobDetail.jobRoleName,
        jobRoleTitle: jobDetail.jobRoleAnalysisTitle,
        jobRoleSkills: jobDetail.jobRoleSkills,
        jobRoleWork: jobDetail.jobRoleWork,
        jobRoleRequirements: jobDetail.jobRoleRequirements,
        jobRolePreferences: jobDetail.jobRolePreferences,
        jobRoleEtc: jobDetail.jobRoleEtc,
        jobRoleCategory: jobDetail.jobRoleCategory as JobRoleCategory,
        isPublic: jobDetail.isPublic,
      });
      setIsPublic(jobDetail.isPublic);
    }
  }, [jobDetail, reset, jobId, companyId]);

  // 직무 수정 API 호출
  const mutation = useMutation({
    mutationFn: async (data: putJobRoleAnalysisRequest) => {
      return await jobRoleAnalysis.putJobRoleAnalysis(data);
    },
    onSuccess: () => {
      toast.success("직무 분석이 수정되었습니다.");
      queryClient.invalidateQueries({
        queryKey: ["jobResearchList", companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["jobRoleDetail", jobId],
      });
      onEditComplete();
    },
    onError: () => {
      toast.error("직무 분석 수정 실패");
    },
  });

  const onValidSubmit = (
    data: putJobRoleAnalysisRequest,
    e?: React.BaseSyntheticEvent
  ) => {
    e?.preventDefault();
    try {
      mutation.mutate({
        ...data,
        jobRoleAnalysisId: jobId,
        companyId: Number(companyId),
        isPublic: isPublic,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onInvalidSubmit = (errors: FieldErrors<putJobRoleAnalysisRequest>) => {
    if (errors.jobRoleTitle?.type === "required") {
      toast.error("직무 분석 제목은 필수입니다.");
    } else if (errors.jobRoleCategory?.type === "required") {
      toast.error("직무 카테고리는 필수입니다.");
    } else if (errors.jobRoleName?.type === "required") {
      toast.error("직무명은 필수입니다.");
    }

    if (errors.jobRoleTitle?.type === "maxLength") {
      toast.error("직무 분석 제목은 최대 50자까지 입력할 수 있습니다.");
    } else if (errors.jobRoleName?.type === "maxLength") {
      toast.error("직무명은 최대 30자까지 입력할 수 있습니다.");
    } else if (errors.jobRoleSkills?.type === "maxLength") {
      toast.error("기술 스택은 최대 500자까지 입력할 수 있습니다.");
    } else if (errors.jobRoleWork?.type === "maxLength") {
      toast.error("주요 업무는 최대 500자까지 입력할 수 있습니다.");
    } else if (errors.jobRoleRequirements?.type === "maxLength") {
      toast.error("자격 요건은 최대 500자까지 입력할 수 있습니다.");
    } else if (errors.jobRolePreferences?.type === "maxLength") {
      toast.error("우대 사항은 최대 500자까지 입력할 수 있습니다.");
    } else if (errors.jobRoleEtc?.type === "maxLength") {
      toast.error("기타 정보는 최대 500자까지 입력할 수 있습니다.");
    }
  };

  return (
    <form
      id="job-edit-form"
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
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
    </form>
  );
}

export default JobEdit;
