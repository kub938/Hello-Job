import { Button } from "@/components/Button";
import { useCoverLetterInputStore } from "@/store/coverLetterStore";

// {
//     "projectId": 8,
//     "projectName": "걍 입력해봄",
//     "projectIntro": "걍 입력해봤습니다",
//     "projectSkills": "SpringBoot, JPA, mySQL",
//     "updatedAt": "2025-04-28T15:35:43.887088"
// },
interface ProjectModalProps {
  contentIndex: number;
  onClose: () => void;
  onOpenForm: () => void;
}

function ProjectModal({
  contentIndex,
  onClose,
  onOpenForm,
}: ProjectModalProps) {
  // const { data } = useGetProjects();
  //   console.log(data);
  const data = [
    {
      projectId: 1,
      projectName: "걍 입력해봄",
      projectIntro: "걍 입력해봤습니다",
      projectSkills: "SpringBoot, JPA, mySQL",
      updatedAt: "2025-04-28T15:35:43.887088",
    },
    {
      projectId: 2,
      projectName: "걍 입력해봄",
      projectIntro: "걍 입력해봤습니다",
      projectSkills: "SpringBoot, JPA, mySQL",
      updatedAt: "2025-04-28T15:35:43.887088",
    },
    {
      projectId: 3,
      projectName: "걍 입력해봄",
      projectIntro: "걍 입력해봤습니다",
      projectSkills: "SpringBoot, JPA, mySQL",
      updatedAt: "2025-04-28T15:35:43.887088",
    },
    {
      projectId: 4,
      projectName: "걍 입력해봄",
      projectIntro: "걍 입력해봤습니다",
      projectSkills: "SpringBoot, JPA, mySQL",
      updatedAt: "2025-04-28T15:35:43.887088",
    },
    {
      projectId: 5,
      projectName: "걍 입력해봄",
      projectIntro: "걍 입력해봤습니다",
      projectSkills: "SpringBoot, JPA, mySQL",
      updatedAt: "2025-04-28T15:35:43.887088",
    },
  ];

  const calculateDaysAgo = (dateString: string) => {
    const updatedDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "오늘" : `${diffDays}일 전`;
  };

  const { toggleProjectId, inputData } = useCoverLetterInputStore();

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleOverlayClick} className="modal-overlay">
      <div className="modal-container h-150 w-150">
        <div className="text-2xl font-bold mb-2">내 프로젝트</div>
        <div className="">자소서 생성에 활용할 프로젝트를 선택해주세요</div>
        <div className="overflow-auto h-100 border-y mt-3">
          {data.length > 0 ? (
            data.map((el) => (
              <div
                onClick={() => toggleProjectId(contentIndex, el.projectId)}
                key={el.projectId}
                className={`cursor-pointer border border-l-4 border-l-primary h-15 my-2 rounded-2xl flex items-center justify-between px-5 hover-block
                    ${
                      inputData.contents[
                        contentIndex
                      ].contentProjectIds.includes(el.projectId) &&
                      "border-primary bg-secondary-light"
                    }
                    `}
              >
                <span className="font-semibold">{el.projectName}</span>
                <span>{el.projectIntro}</span>
                <span>{calculateDaysAgo(el.updatedAt)}</span>
              </div>
            ))
          ) : (
            <div className="h-full flex justify-center items-center">
              프로젝트를 추가해 주세요
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-between gap-3">
          <Button onClick={onOpenForm} className="w-30">
            추가하기
          </Button>
          <div className="flex gap-3">
            <Button onClick={onClose} variant={"white"} className="w-15">
              취소
            </Button>
            <Button onClick={onClose} className="w-15">
              완료
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;
