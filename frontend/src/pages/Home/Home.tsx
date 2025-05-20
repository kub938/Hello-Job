import Header from "@/components/Common/Header";
import WaveAnimation from "@/components/WaveAnimation";
import { FaRegBuilding } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";
import { PiNotePencilBold } from "react-icons/pi";
import { MdPeopleAlt } from "react-icons/md";

import LocateBtn from "./components/LocateBtn";
import Modal from "@/components/Modal";
import { useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  console.log(`
    ██╗  ██╗███████╗██╗     ██╗      ██████╗      ██╗ ██████╗ ██████╗ 
    ██║  ██║██╔════╝██║     ██║     ██╔═══██╗     ██║██╔═══██╗██╔══██╗
    ███████║█████╗  ██║     ██║     ██║   ██║     ██║██║   ██║██████╔╝
    ██╔══██║██╔══╝  ██║     ██║     ██║   ██║██   ██║██║   ██║██╔══██╗
    ██║  ██║███████╗███████╗███████╗╚██████╔╝╚█████╔╝╚██████╔╝██████╔╝
    ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝  ╚════╝  ╚═════╝ ╚═════╝ 
    `);

  const openModal = ({ title }: { title: string }) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  return (
    <div className="relative flex flex-col w-full h-screen overflow-hidden">
      <Header isMinimize={true} />
      <WaveAnimation />
      {/* 기존 홈페이지 내용 */}
      <main className="grow max-w-screen-xl mx-auto z-10 w-full px-10 pb-20 flex flex-col justify-center">
        <div>
          <h1 className="text-9xl font-bold mb-2">
            HELLO<span className="text-[#6F52E0]">JOB</span>
          </h1>
          <h2 className="text-4xl font-semibold">취업 준비 A부터 Z까지</h2>
        </div>
        <div className="flex justify-between mt-[10vh]">
          <div
            onClick={() => openModal({ title: "인적사항 관리 기능 준비 중!" })}
          >
            <LocateBtn
              to="/"
              iconComponent={<HiOutlineDocumentText className="w-10 h-10" />}
              title="인적사항 관리"
              description="인적 사항을 이곳에 저장해두고 자동 입력 기능을 사용하세요!"
              disabled={true}
            />
          </div>
          <LocateBtn
            to="/corporate-search"
            iconComponent={<FaRegBuilding className="w-9 h-9" />}
            title="기업/직무분석"
            description="공시와 뉴스를 활용한 기업분석과 자세한 직무 분석을 확인해보세요!"
          />
          <LocateBtn
            to="/cover-letter"
            iconComponent={<PiNotePencilBold className="w-10 h-10" />}
            title="자기소개서 작성"
            description="AI를 활용해 자기소개서 초안을 작성하고 첨삭을 받아보세요!"
          />
          <LocateBtn
            to="/interview/select"
            iconComponent={<MdPeopleAlt className="w-10 h-10" />}
            title="AI 모의 면접"
            description="면접관의 시선으로 본 당신의 답변, 지금 확인하세요"
          />
        </div>
      </main>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div>3차 배포를 기대해주세요!</div>
      </Modal>
    </div>
  );
}
