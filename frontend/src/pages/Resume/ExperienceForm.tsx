import { PostExperienceRequest } from "@/api/experienceApi";
import { Button } from "@/components/Button";
import FormInput from "@/components/Common/FormInput";
import { usePostExperience } from "@/hooks/experienceHooks";
import { FormEvent, useState } from "react";

interface ExperienceFormProps {
  onClose: () => void;
}

function ExperienceForm({ onClose }: ExperienceFormProps) {
  const [formData, setFormData] = useState<PostExperienceRequest>({
    experienceName: "",
    experienceDetail: "",
    experienceRole: "",
    experienceStartDate: "",
    experienceEndDate: "",
    experienceClient: "",
  });

  const mutation = usePostExperience();

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container h-[80%]">
          <div className="border-b pb-3 mb-5">
            <div className="text-2xl font-bold pb-1">경험 추가</div>
            <div className="text-muted-foreground text-sm">
              좀더 적합한 자소서 초안 작성을 위해 경험을 추가해 주세요!
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="experienceName"
              label="제목"
              placeholder="경험 제목 입력"
              require
              value={formData.experienceName}
              onChange={handleChange}
            />
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="experienceRole"
              label="역할"
              placeholder="예: 학회장, 팀장, 알바생 ..."
              value={formData.experienceRole}
              onChange={handleChange}
            />

            <div className="flex gap-8">
              <FormInput
                type="date"
                width="19.5rem"
                height="2.8rem"
                name="experienceStartDate"
                label="시작일"
                require
                value={formData.experienceStartDate}
                onChange={handleChange}
              />
              <FormInput
                type="date"
                width="19.5rem"
                height="2.8rem"
                name="experienceEndDate"
                label="종료일"
                require
                value={formData.experienceEndDate}
                onChange={handleChange}
              />
            </div>
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="experienceClient"
              label="기관"
              placeholder="예: 삼성 전자, SSAFY ..."
              value={formData.experienceClient}
              onChange={handleChange}
            />
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              require={true}
              name="experienceDetail"
              label="경험 상세내용"
              placeholder="경험 상세 내용을 입력해 주세요"
              value={formData.experienceDetail}
              onChange={handleChange}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button onClick={onClose} variant={"white"} type="button">
                취소
              </Button>
              <Button type="submit">완료</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ExperienceForm;
