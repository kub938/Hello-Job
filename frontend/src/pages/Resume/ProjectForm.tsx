import FormInput from "@/components/Common/FormInput";

// "projectName": "Hello Job",
// "projectIntro": "개발자의 취업준비를 A to Z까지 도와주는 서비스",
// "projectRole": "백엔드",
// "projectSkills": "SpringBoot, JPA, mySQL 등",
// "projectStartDate": "2024-04-23",
// "projectEndDate": "2024-04-23",
// "projectDetail": "프로젝트 상세 내용이 들어갑니다아",
// "projectClient": "SSAFY"

function ProjectForm() {
  //   useEffect(() => {
  //     if (isOpen) {
  //       document.body.style.overflow = "hidden";
  //     }
  //     return () => {
  //       document.body.style.overflow = "unset";
  //     };
  //   }, [isOpen]);

  const handleSubmit = () => {};
  // const closeModal = () => {};
  return (
    <>
      <div className="modal-overlay ">
        <div className="modal-container">
          <div className=" border-b pb-3 mb-5">
            <div className="text-2xl font-bold pb-1">프로젝트 추가</div>
            <div className="text-muted-foreground text-sm">
              좀더 적합한 자소서 초안 작성을 위해 프로젝트를 추가해 주세요!
            </div>
          </div>
          <form action="" onSubmit={handleSubmit}>
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="projectName"
              label="프로젝트명"
              placeholder="프로젝트명 입력"
              require
            ></FormInput>
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="projectIntro"
              label="소제목"
              placeholder="소제목"
              require
            ></FormInput>
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="projectRole"
              label="역할"
              placeholder="예: 프론트엔드, 백엔드, 인프라, AI ..."
            ></FormInput>
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="projectSkills"
              label="기술"
              placeholder="예: Spring boot, React, TypeScript ..."
            ></FormInput>
            <div className="flex gap-8">
              <FormInput
                type="date"
                width="19.5rem"
                height="2.8rem"
                name="projectDetail"
                label="시작일"
                require
              ></FormInput>
              <FormInput
                type="date"
                width="19.5rem"
                height="2.8rem"
                name="projectName"
                label="종료일"
                require
              ></FormInput>
            </div>
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="projectClient"
              label="기술"
              placeholder="예: Spring boot, React, TypeScript ..."
            ></FormInput>
            <FormInput
              type="text"
              width="41rem"
              height="2.8rem"
              name="projectDetail"
              label="프로젝트 상세내용"
              placeholder="프로젝트 상세 내용을 입력해 주세요"
            ></FormInput>
          </form>
        </div>
      </div>
    </>
  );
}

export default ProjectForm;
