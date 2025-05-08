import { GetExperienceResponse } from "@/api/experienceApi";
import { Button } from "@/components/Button";
import { useGetExperiences } from "@/hooks/experienceHooks";
import { useGetProjects } from "@/hooks/projectHooks";
import { useCoverLetterInputStore } from "@/store/coverLetterStore";
import { GetProjectsResponse } from "@/types/projectApiTypes";
import { useEffect, useState } from "react";

export type ModalType = "project" | "experience" | "";

interface ProjectModalProps {
  contentIndex: number;
  onClose: () => void;
  onOpenProjectForm: () => void;
  onOpenExperienceForm: () => void;
  type: ModalType;
}

function SelectModal({
  contentIndex,
  onClose,
  onOpenProjectForm,
  onOpenExperienceForm,
  type = "project",
}: ProjectModalProps) {
  const { data: projectsData } = useGetProjects();
  const { data: experiencesData } = useGetExperiences();
  const { setContentProjectIds, setContentExperienceIds, inputData } =
    useCoverLetterInputStore();
  const [selectedProjects, setSelectedProjects] = useState<number[]>(
    inputData.contents[contentIndex].contentProjectIds
  );
  const [selectedExperience, setSelectedExperience] = useState<number[]>(
    inputData.contents[contentIndex].contentExperienceIds
  );

  const handleSelectItems = (id: number) => {
    if (type === "project") {
      if (selectedProjects.includes(id)) {
        const filterProject = selectedProjects.filter((item) => item !== id);
        setSelectedProjects(filterProject);
      } else {
        setSelectedProjects((prev) => [...prev, id]);
      }
    } else if (type === "experience") {
      if (selectedExperience.includes(id)) {
        const filterExperience = selectedExperience.filter(
          (item) => item !== id
        );
        setSelectedExperience(filterExperience);
      } else {
        setSelectedExperience((prev) => [...prev, id]);
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const onAccept = (contentIndex: number) => {
    if (type === "project") {
      setContentProjectIds(contentIndex, selectedProjects);
    } else if (type === "experience") {
      setContentExperienceIds(contentIndex, selectedExperience);
    }
    onClose();
  };

  const handleOpenForm = () => {
    type === "project" ? onOpenProjectForm() : onOpenExperienceForm();
  };

  const calculateDaysAgo = (dateString: string) => {
    const updatedDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "오늘" : `${diffDays}일 전`;
  };

  const contentString = {
    title: type === "project" ? "내 프로젝트" : "내 경험",
    subTitle:
      type === "project"
        ? "자소서 생성에 활용할 프로젝트를 선택해주세요"
        : "자소서 생성에 활용할 경험을 선택해주세요",
    addInfo:
      type === "project" ? "프로젝트를 추가해 주세요" : "경험을 추가해 주세요",
  };

  const transformData = (
    type: ModalType,
    projectsData?: GetProjectsResponse[],
    experiencesData?: GetExperienceResponse[]
  ) => {
    if (!projectsData && !experiencesData) return undefined;

    if (type === "project" && projectsData) {
      // 프로젝트 데이터 변환
      return projectsData.map((project) => ({
        id: project.projectId,
        name: project.projectName,
        description: project.projectIntro,
        skills: project.projectSkills,
        updatedAt: project.updatedAt,
      }));
    } else if (experiencesData) {
      return experiencesData.map((exp) => ({
        id: exp.experienceId,
        name: exp.experienceName,
        description: exp.experienceRole,
        skills: "",
        updatedAt: exp.updatedAt,
      }));
    }

    return undefined;
  };

  // 변환된 통합 데이터
  const unifiedData = transformData(type, projectsData, experiencesData);

  return (
    <div onClick={handleOverlayClick} className="modal-overlay">
      <div className="modal-container h-150 w-150">
        <div className="text-2xl font-bold mb-2">{contentString.title}</div>
        <div className="">{contentString.subTitle}</div>
        <div className="overflow-auto h-100 border-y mt-3">
          {unifiedData ? (
            unifiedData.map((el) => (
              <div
                onClick={() => handleSelectItems(el.id)}
                key={el.id}
                className={`cursor-pointer border border-l-4 border-l-primary h-15 my-2 rounded-2xl grid grid-cols-3 items-center px-5 hover-block
                    ${
                      type === "project"
                        ? selectedProjects.includes(el.id) &&
                          "border-primary bg-secondary-light"
                        : selectedExperience.includes(el.id) &&
                          "border-primary bg-secondary-light"
                    }
                    `}
              >
                <span className="font-semibold">{el.name}</span>
                <span className="text-center"> {el.description}</span>
                <span className="text-center ml-23">
                  {calculateDaysAgo(el.updatedAt)}
                </span>
              </div>
            ))
          ) : (
            <div className="h-full flex justify-center items-center">
              {contentString.addInfo}
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-between gap-3">
          <Button onClick={handleOpenForm} className="w-30">
            추가하기
          </Button>
          <div className="flex gap-3">
            <Button onClick={onClose} variant={"white"} className="w-15">
              취소
            </Button>
            <Button onClick={() => onAccept(contentIndex)} className="w-15">
              완료
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectModal;
