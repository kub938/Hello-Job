import { useGetCompanyBookMarks } from "@/hooks/companyHooks";
import { useGetJobBookMarks } from "@/hooks/jobRoleAnalysisHook";
import { useSelectCompanyStore } from "@/store/coverLetterAnalysisStore";
import { useCoverLetterInputStore } from "@/store/coverLetterStore";
import {
  CompanyBookMarkResponse,
  JobBookMarkResponse,
  ReportListProps,
} from "@/types/coverLetterTypes";
import { useState } from "react";
import AddAnalysisModal from "../AddModal/AddAnalysisModal";
import {
  Bookmark,
  Calendar,
  Eye,
  MapPin,
  BriefcaseBusiness,
  Info,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import ReadCorporate from "@/pages/CorporateResearch/components/ReadCorporate";
import ReadJob from "@/pages/JobResearch/components/ReadJob";

function ReportList({ nowStep }: ReportListProps) {
  const reportBlockLayout =
    "px-6 w-full border rounded-2xl h-45 flex justify-center items-center cursor-pointer ";
  const hoverReportBlockLayout =
    "duration-100 hover:outline-2 hover:outline-primary hover:bg-secondary-light";
  const selectedStyle = "outline-2 outline-primary bg-secondary-light ";

  //modal 관련 state
  const [openJobAnalysisDetail, setOpenJobAnalysisDetail] = useState(false);
  const [openCompanyAnalysisDetail, setOpenCompanyAnalysisDetail] =
    useState(false);
  const [analysisId, setAnalysisId] = useState(0);
  const [addCompanyAnalysisModalOpen, setAddCompanyAnalysisModalOpen] =
    useState(false);
  const [addJobAnalysisModalOpen, setAddJobAnalysisModalOpen] = useState(false);

  // store
  const { company } = useSelectCompanyStore();
  const { setCompanyAnalysisId, setJobRoleAnalysisId, inputData } =
    useCoverLetterInputStore();

  //react query
  const companyBookMarksQuery = useGetCompanyBookMarks(company.companyId);
  const jobBookMarksQuery = useGetJobBookMarks(company.companyId);
  const companyDataRefetch = companyBookMarksQuery.refetch;
  const jobDataRefetch = jobBookMarksQuery.refetch;

  //data adapt
  const data =
    nowStep === 1 ? companyBookMarksQuery.data : jobBookMarksQuery.data;
  const adaptData = (
    data: JobBookMarkResponse[] | CompanyBookMarkResponse[],
    nowStep: number
  ) => {
    if (!data || data.length === 0) {
      return [];
    }

    if (nowStep === 1) {
      return (data as CompanyBookMarkResponse[]).map((item) => ({
        id: item.companyAnalysisId,
        firstLetter: item.companyName[0],
        title: item.companyAnalysisTitle,
        name: item.companyName,
        date: item.createdAt,
        viewCount: item.companyViewCount,
        location: item.companyLocation,
        bookmarkCount: item.companyAnalysisBookmarkCount,
      }));
    } else if (nowStep === 2) {
      return (data as JobBookMarkResponse[]).map((item) => ({
        id: item.jobRoleAnalysisId,
        firstLetter: item.companyName[0],
        title: item.jobRoleAnalysisTitle,
        name: item.jobRoleName,
        date: item.updatedAt,
        viewCount: item.jobRoleViewCount,
        location: item.jobRoleCategory,
        bookmarkCount: item.jobRoleBookmarkCount,
      }));
    }
  };
  if (!data) return;
  const reports = adaptData(data, nowStep);

  //handler 함수
  const handleSelect = (analysisId: number) => {
    if (nowStep === 1) {
      inputData.companyAnalysisId === analysisId
        ? setCompanyAnalysisId(null)
        : setCompanyAnalysisId(analysisId);
    } else if (nowStep === 2) {
      inputData.jobRoleAnalysisId === analysisId
        ? setJobRoleAnalysisId(null)
        : setJobRoleAnalysisId(analysisId);
    }
  };

  //modal 관련 handler
  const handleAddCompanyModalClose = () => {
    companyDataRefetch().then(() => setAddCompanyAnalysisModalOpen(false));
  };
  const handleAddCompanyModalOpen = () => {
    setAddCompanyAnalysisModalOpen(true);
  };

  const handleAddJobModalOpen = () => {
    setAddJobAnalysisModalOpen(true);
  };
  const handleAddJobModalClose = () => {
    jobDataRefetch().then(() => setAddJobAnalysisModalOpen(false));
  };

  const handleOpenDetail = (analysisId: number) => {
    setAnalysisId(analysisId);
    console.log(analysisId);
    if (nowStep === 1) {
      setOpenCompanyAnalysisDetail(true);
    } else {
      setOpenJobAnalysisDetail(true);
    }
  };

  const handleCloseDetail = () => {
    if (nowStep === 1) {
      setOpenCompanyAnalysisDetail(false);
    } else {
      setOpenJobAnalysisDetail(false);
    }
  };

  return (
    <>
      {openJobAnalysisDetail && (
        <div className="modal-overlay gap-6">
          <ReadJob
            id={analysisId}
            onClose={handleCloseDetail}
            companyId={String(company.companyId)}
          ></ReadJob>
        </div>
      )}
      {openCompanyAnalysisDetail && (
        <div className="modal-overlay gap-6">
          <ReadCorporate
            id={analysisId}
            onClose={handleCloseDetail}
            companyId={String(company.companyId)}
          ></ReadCorporate>
        </div>
      )}
      {addCompanyAnalysisModalOpen && (
        <AddAnalysisModal type="company" onClose={handleAddCompanyModalClose} />
      )}
      {addJobAnalysisModalOpen && (
        <AddAnalysisModal type="job" onClose={handleAddJobModalClose} />
      )}
      <div className="grid md:grid-cols-3 grid-cols-2 gap-4 ">
        {reports &&
          reports.map((report) => {
            const isSelected =
              nowStep === 1
                ? inputData.companyAnalysisId === report.id
                : inputData.jobRoleAnalysisId === report.id;
            return (
              <div
                onClick={() => handleSelect(report.id)}
                key={report.id}
                className={`${
                  isSelected && selectedStyle
                } ${reportBlockLayout} ${hoverReportBlockLayout} relative  group active:bg-active`}
              >
                <div className="absolute right-1.5 top-1.5 text-text-disabled hover:text-primary duration-150  ">
                  <Info onClick={() => handleOpenDetail(report.id)} size={24} />
                </div>
                <div className="flex items-start ">
                  {/* 회사 첫 글자 아바타 */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                      {report.firstLetter}
                    </div>
                  </div>

                  {/* 컨텐츠 영역 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg w-50 font-semibold text-gray-900 mb-1 truncate">
                      {report.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-2 truncate">
                      {report.name}
                    </p>

                    {/* 메타 정보 영역 */}
                    <div className="flex flex-wrap items-center text-xs text-gray-500 gap-3">
                      <div className="flex items-center">
                        {report.location && nowStep === 1 ? (
                          <MapPin size={14} className="mr-1" />
                        ) : (
                          <BriefcaseBusiness size={14} className="mr-1" />
                        )}

                        <span>{report.location}</span>
                      </div>
                      <div className="flex w-full justify-end gap-2">
                        <div className="flex items-center">
                          <Eye size={14} className="mr-1" />
                          <span>{report.viewCount.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center">
                          <Bookmark size={14} className="mr-1" />
                          <span>{report.bookmarkCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          <span>{formatDate(report.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        <div
          onClick={
            nowStep === 1 ? handleAddCompanyModalOpen : handleAddJobModalOpen
          }
          className={`${reportBlockLayout} ${hoverReportBlockLayout} flex-col`}
        >
          <div>{nowStep === 1 ? "기업분석" : "직무분석"} 추가하기</div>
          <div className="text-3xl text-primary">+</div>
        </div>
      </div>
    </>
  );
}

export default ReportList;
