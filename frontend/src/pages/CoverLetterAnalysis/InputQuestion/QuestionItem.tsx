import FormInput from "@/components/Common/FormInput";
import { CoverLetterRequestContent } from "@/types/coverLetterTypes";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GetProjectsResponse, useGetProjects } from "@/hooks/projectHooks";
import { useCoverLetterInputStore } from "@/store/coverLetterStore";
import ProjectForm from "@/pages/Resume/ProjectForm";
import SelectModal, { ModalType } from "../SelectModal/SelectModal";
import ExperienceForm from "@/pages/Resume/ExperienceForm";
import { GetExperienceResponse } from "@/api/experienceApi";
import { useGetExperiences } from "@/hooks/experienceHooks";
import { XIcon } from "lucide-react";

export interface QuestionItemProps {
  contentIndex: number;
  content: CoverLetterRequestContent;
  onUpdateQuestion: (
    index: number,
    data: Partial<CoverLetterRequestContent>
  ) => void;
  onRemoveContent: (contentId: number) => void;
}

function QuestionItem({
  onRemoveContent,
  content,
  contentIndex,
  onUpdateQuestion,
}: QuestionItemProps) {
  const headerStyle =
    "w-full text-primary bg-secondary-light rounded-t-2xl py-3 px-4 font-semibold";

  const { data: projectData } = useGetProjects();
  const { data: experienceData } = useGetExperiences();
  const [isOpen, setIsOpen] = useState(true);
  const [charCount, setCharCount] = useState(0);

  /* Form 관리 */
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [ExperienceFormOpen, setExperienceFormOpen] = useState(false);

  /* modal 관리 */
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("");

  /* 선택한 프로젝트, 경험 관리 */
  const [selectedProjects, setSelectedProjects] = useState<
    GetProjectsResponse[]
  >([]);
  const [selectedExperience, setSelectedExperience] = useState<
    GetExperienceResponse[]
  >([]);
  const { inputData } = useCoverLetterInputStore();
  const selectedProjectNum = inputData.contents[contentIndex].contentProjectIds;
  const selectedExperienceNum =
    inputData.contents[contentIndex].contentExperienceIds;

  /* 입력 값 상태 관리 */
  const [inputTitle, setInputTitle] = useState("");
  const [inputLimitNum, setInputLimitNum] = useState("");
  const [inputPrompt, setInputPrompt] = useState("");

  /* 선택한 프로젝트 필터  */
  useEffect(() => {
    if (projectData) {
      const temp = projectData.filter((project) =>
        selectedProjectNum.includes(project.projectId)
      );
      setSelectedProjects(temp);
    }
  }, [projectData, selectedProjectNum]);

  /* 선택한 경험 필터 */
  useEffect(() => {
    if (experienceData) {
      console.log(selectedExperienceNum, experienceData[0].experienceId);
      const temp = experienceData.filter((exp) =>
        selectedExperienceNum.includes(exp.experienceId)
      );
      setSelectedExperience(temp);
    }
  }, [experienceData, selectedExperienceNum]);
  //form 업데이트

  useEffect(() => {
    if (inputTitle !== "" || inputLimitNum !== "" || inputPrompt !== "") {
      const updatedData: Partial<CoverLetterRequestContent> = {
        contentQuestion: inputTitle,
        contentLength: inputLimitNum ? Number(inputLimitNum) : 0,
        contentFirstPrompt: inputPrompt,
        contentNumber: contentIndex + 1,
        contentProjectIds: selectedProjectNum,
        contentExperienceIds: selectedExperienceNum,
      };

      onUpdateQuestion(contentIndex, updatedData);
    }
  }, [inputTitle, inputLimitNum, inputPrompt]);

  //content 입력값 초기화
  useEffect(() => {
    setInputTitle(content.contentQuestion || "");
    setInputLimitNum(
      content.contentLength ? String(content.contentLength) : ""
    );
    setInputPrompt(content.contentFirstPrompt || "");
    setCharCount(
      content.contentFirstPrompt ? content.contentFirstPrompt.length : 0
    );
  }, [content]);

  const toggleForm = () => {
    setIsOpen(!isOpen);
  };

  //form 관리
  // const handleProjectFormClose = () => {
  //   setProjectFormOpen(false);
  // };

  // const handleProjectFormOpen = () => {
  //   setProjectFormOpen(true);
  // };

  //modal 관리
  const handleProjectModalClose = () => {
    setSelectModalOpen(false);
  };

  const handleProjectModalOpen = () => {
    setModalType("project");
    setSelectModalOpen(true);
  };

  const handleExperienceModalOpen = () => {
    setModalType("experience");
    setSelectModalOpen(true);
  };

  //from 관리
  const onOpenProjectForm = () => {
    setProjectFormOpen(true);
  };

  const onOpenExperienceForm = () => {
    setExperienceFormOpen(true);
  };

  const onCloseProjectForm = () => {
    setProjectFormOpen(false);
  };

  const onCloseExperienceForm = () => {
    setExperienceFormOpen(false);
  };

  //input 관리 handler
  const onChangeInputTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const onChangeInputLimitNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputLimitNum(e.target.value);
  };

  const onChangeInputPrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <>
      {selectModalOpen && (
        <SelectModal
          contentIndex={contentIndex}
          onClose={handleProjectModalClose}
          onOpenProjectForm={onOpenProjectForm}
          onOpenExperienceForm={onOpenExperienceForm}
          type={modalType}
        />
      )}
      {projectFormOpen && <ProjectForm onClose={onCloseProjectForm} />}
      {ExperienceFormOpen && <ExperienceForm onClose={onCloseExperienceForm} />}
      <form className="border w-full rounded-2xl mb-3">
        <div
          className={`${headerStyle} rounded-b-2xl flex justify-between items-center cursor-pointer`}
          onClick={toggleForm}
        >
          <span className="flex justify-center items-center gap-2">
            <XIcon
              onClick={() => onRemoveContent(contentIndex)}
              className="size-7 hover:bg-white duration-200 rounded-full p-1"
            ></XIcon>
            <span>{content.contentNumber}번 문항</span>
          </span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {isOpen && (
          <div className="mx-4 flex flex-col gap-3 py-3">
            <div className="flex gap-3 mt-3 ">
              <div className="w-full">
                <FormInput
                  type="text"
                  name="contentQuestion"
                  className="border w-full"
                  placeholder="문항을 입력해 주세요"
                  value={inputTitle}
                  onChange={(e) => onChangeInputTitle(e)}
                />
              </div>
              <div>
                <FormInput
                  type="number"
                  name="contentLength"
                  placeholder="글자수"
                  className="w-30"
                  value={inputLimitNum}
                  onChange={(e) => onChangeInputLimitNum(e)}
                />
              </div>
            </div>
            <div className="flex gap-8">
              <div className="w-[50%]">
                <div className={`${headerStyle}`}>프로젝트</div>
                <div className="flex flex-col gap-2.5 border p-3 rounded-b-xl">
                  {selectedProjects.map((project) => (
                    <div
                      onClick={handleProjectModalOpen}
                      className="cursor-pointer border border-l-4 border-l-accent py-3 truncate px-5 rounded-lg"
                    >
                      {project.projectName}
                    </div>
                  ))}

                  <div
                    onClick={handleProjectModalOpen}
                    className="border border-transparent py-3 px-5 text-text-muted-foreground rounded-lg bg-background hover:bg-secondary-light hover:text-black hover:border hover:border-secondary"
                  >
                    + 프로젝트 연결하기
                  </div>
                </div>
              </div>

              <div className="w-[50%]">
                <div className={`${headerStyle}`}>경험</div>
                <div className="flex flex-col gap-2.5 border p-3 rounded-b-xl">
                  {selectedExperience.map((exp) => (
                    <div
                      onClick={handleProjectModalOpen}
                      className="cursor-pointer border border-l-4 border-l-accent py-3 truncate px-5 rounded-lg"
                    >
                      {exp.experienceName}
                    </div>
                  ))}
                  <div
                    onClick={handleExperienceModalOpen}
                    className="border border-transparent py-3 px-5 text-text-muted-foreground rounded-lg bg-background hover:bg-secondary-light hover:text-black hover:border hover:border-secondary"
                  >
                    + 경험 연결하기
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className={headerStyle}>내용 추가</div>
              <textarea
                name="contentFirstPrompt"
                placeholder="추가하고 싶은 내용들을 적어주세요!"
                maxLength={1500}
                rows={8}
                cols={50}
                className="bg-white resize-none border rounded-b-xl w-full p-4 pb-10 "
                value={inputPrompt}
                onChange={(e) => onChangeInputPrompt(e)}
              />
              <span className="bg-white rounded-2xl px-2 absolute mt-10 right-4 bottom-3 text-sm text-text-muted-foreground">
                {charCount} / 1500
              </span>
            </div>
          </div>
        )}
      </form>
    </>
  );
}

export default QuestionItem;
