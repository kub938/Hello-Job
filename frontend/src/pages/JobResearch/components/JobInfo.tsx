interface JobInfoProps {
  jobDetail: {
    jobRoleName: string;
    jobRoleViewCount: number;
    jobRoleAnalysisBookmarkCount: number;
    jobRoleWork: string;
    jobRoleSkills: string;
    jobRoleRequirements: string;
    jobRolePreferences: string;
    jobRoleEtc: string;
  };
}

function JobInfo({ jobDetail }: JobInfoProps) {
  return (
    <div className="space-y-8">
      {/* 카테고리 및 조회수 정보 */}
      <div className="flex justify-between items-center py-3 border-b border-gray-200">
        <span className="px-3 py-1 bg-[#6F52E0]/10 text-[#6F52E0] rounded-md text-sm">
          {jobDetail.jobRoleName}
        </span>
        <div className="text-sm text-gray-500">
          <span>조회수: {jobDetail.jobRoleViewCount}</span>
          <span className="mx-2">|</span>
          <span>북마크: {jobDetail.jobRoleAnalysisBookmarkCount}</span>
        </div>
      </div>

      {/* 주요 업무 */}
      <section>
        <h2 className="text-lg font-bold mb-2">주요 업무</h2>
        <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
          {jobDetail.jobRoleWork}
        </div>
      </section>

      {/* 기술 스택 */}
      <section>
        <h2 className="text-lg font-bold mb-2">기술 스택</h2>
        <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
          {jobDetail.jobRoleSkills
            ? jobDetail.jobRoleSkills
            : "등록된 정보가 없습니다."}
        </div>
      </section>

      {/* 자격 요건 */}
      <section>
        <h2 className="text-lg font-bold mb-2">자격 요건</h2>
        <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
          {jobDetail.jobRoleRequirements
            ? jobDetail.jobRoleRequirements
            : "등록된 정보가 없습니다."}
        </div>
      </section>

      {/* 우대 사항 */}
      <section>
        <h2 className="text-lg font-bold mb-2">우대 사항</h2>
        <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
          {jobDetail.jobRolePreferences
            ? jobDetail.jobRolePreferences
            : "등록된 정보가 없습니다."}
        </div>
      </section>

      {/* 기타 정보 */}
      <section>
        <h2 className="text-lg font-bold mb-2">커스텀 정보 & 프롬프트</h2>
        <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
          {jobDetail.jobRoleEtc
            ? jobDetail.jobRoleEtc
            : "등록된 정보가 없습니다."}
        </div>
      </section>
    </div>
  );
}

export default JobInfo;
