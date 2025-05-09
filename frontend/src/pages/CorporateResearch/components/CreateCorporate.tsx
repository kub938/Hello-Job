import { corporateReportApi } from "@/api/corporateReport";
import { Button } from "@/components/Button";
import { postCorporateReportRequest } from "@/types/coporateResearch";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import ToggleInput from "./ToggleInput";
import { useNavigate } from "react-router";
import { FaSpinner } from "react-icons/fa";

interface CreateCorporateProps {
  onClose: () => void;
  corporateId: number;
}

interface IForm {
  isPublic: boolean;
  basic: boolean;
  plus: boolean;
  financial: boolean;
}

function CreateCorporate({ onClose, corporateId }: CreateCorporateProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [isBasic, setIsBasic] = useState(true);
  const [isPlus, setIsPlus] = useState(false);
  const [isFinancial, setIsFinancial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<IForm>();

  const mutation = useMutation({
    mutationFn: async (data: postCorporateReportRequest) => {
      return await corporateReportApi.postCorporateReport(data);
    },
    gcTime: 1000,
    onSuccess: () => {
      toast.success("기업 분석이 완료되었습니다.");
      setIsSubmitting(false);
      // 페이지 이동시키기
      navigate("/mypage/bookmarks/companies");
      //초기화
      setIsPublic(true);
      setIsBasic(true);
      setIsPlus(false);
      setIsFinancial(false);
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 402) {
        toast.error("토큰이 부족합니다");
      } else {
        toast.error("기업 분석 생성 실패");
      }
      setIsSubmitting(false);
    },
  });

  const onValidSubmit = async (data: IForm, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    console.log(data);

    try {
      // 1) api 호출
      mutation.mutate({
        companyId: corporateId,
        isPublic: data.isPublic,
        basic: data.basic,
        plus: data.plus,
        financial: data.financial,
      });
    } catch (error) {
      // 에러 처리
      console.error(error);
    }
  };

  const onInvalidSubmit = (errors: FieldErrors<IForm>) => {
    if (errors.isPublic?.type === "required") {
      // "빈 채팅을 입력할 수 없습니다" 에러 발생 시, 원하는 custom function 실행
      toast.error(errors.isPublic.message);
    } else if (errors.basic?.type === "required") {
      toast.error(errors.basic.message);
    } else if (errors.plus?.type === "required") {
      toast.error(errors.plus.message);
    } else if (errors.financial?.type === "required") {
      toast.error(errors.financial.message);
    }
    setIsSubmitting(false);
  };

  const onSubmitClicked = (e: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    if (isSubmitting) return; // 연속 클릭 방지
    toast.success("분석 요청을 보냈습니다.");
    setIsSubmitting(true);
    handleSubmit(onValidSubmit, onInvalidSubmit)();
  };

  return (
    <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
      <header className="text-2xl font-bold mb-4">기업 분석 시작하기</header>
      <h2 className="text-lg mb-2">
        간단한 설정만으로 기업 분석을 진행할 수 있습니다.
      </h2>
      <h2 className="text-lg mb-2">
        아래의 선택지를 통해 기업 분석 시 어떤 데이터를 참고할지 선택할 수
        있습니다.
      </h2>
      <h2 className="text-lg mb-2">
        <span className="text-blue-500">Info: </span>
        기업 분석 시, 사용자의 토큰이 소모됩니다. 이미 만족스러운 기업 분석이
        있는지 확인해보세요!
      </h2>
      <h2 className="text-lg mb-2">
        <span className="text-blue-500">Info: </span>
        너무 많은 데이터를 추가하면 오히려 분석 성능이 떨어질 수 있습니다.
      </h2>
      <h2 className="text-lg mb-2">
        <span className="text-blue-500">Info: </span>
        기업 분석은 최소 1분에서 이용자 수에 따라 최대 10분까지 소요됩니다.
      </h2>
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
          requiredMessage="공개 여부는 필수 입력 항목입니다."
        />
        <ToggleInput
          label={
            isBasic ? "기본 공시 데이터 분석" : "기본 공시 데이터 사용하지 않음"
          }
          description={
            isBasic
              ? "사업 개요, 주요 제품 및 서비스, 주요계약 및 연구개발활동 등을 분석에 추가하지 않습니다."
              : "기본 분석은 Dart 에서 제공되는 기업의 사업 보고서와 재무제표의 간단한 필수 정보를 기반으로 분석을 제공합니다."
          }
          isOn={isBasic}
          onChange={setIsBasic}
          register={register}
          name="basic"
          requiredMessage="기본 분석 여부는 필수 입력 항목입니다."
        />
        <ToggleInput
          label={
            isPlus ? "심화 공시 데이터 분석" : "심화 공시 데이터 사용하지 않음"
          }
          description={
            isPlus
              ? "원재료 및 생산설비, 매출 및 수주상황, 위험관리 및 파생거래 등 기업의 심화 정보를 분석에 추가합니다."
              : "심화 분석은 Dart 에서 제공되는 기업의 사업보고서의 심화 내용을 기반으로 분석을 제공합니다."
          }
          isOn={isPlus}
          onChange={setIsPlus}
          register={register}
          name="plus"
          requiredMessage="심화 분석 여부는 필수 입력 항목입니다."
        />
        <ToggleInput
          label={isFinancial ? "재무 데이터 분석" : "재무 데이터 사용하지 않음"}
          description={
            isFinancial
              ? "자산 총계, 부채 총계, 자본 총계, 영업활동 현금흐름, 투자활동 현금흐름, 재무활동 현금흐름 등을 분석에 추가합니다."
              : "재무 분석은 Dart 에서 제공되는 재무제표(재무상태표, 손익계산서, 현금흐름표)를 기반으로 분석을 제공합니다."
          }
          isOn={isFinancial}
          onChange={setIsFinancial}
          register={register}
          name="financial"
          requiredMessage="재무 분석 여부는 필수 입력 항목입니다."
        />

        <div className="mt-12 flex justify-center gap-4">
          <Button className="px-4 text-base" onClick={onClose} variant="white">
            창 닫기
          </Button>
          <Button
            className="px-4 text-base"
            onClick={onSubmitClicked}
            variant="default"
            disabled={isSubmitting || mutation.isPending}
          >
            {isSubmitting || mutation.isPending ? (
              <span className="flex items-center gap-2">
                분석 중... <FaSpinner className="animate-spin" />
              </span>
            ) : (
              "생성하기"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateCorporate;
