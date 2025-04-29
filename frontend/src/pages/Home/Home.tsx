import { Button } from "@/components/Button";
import Modal from "@/components/Modal";
import { useState } from "react";

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="flex flex-col flex-grow items-center justify-between">
      <Button onClick={() => setIsModalOpen(true)}>모달 열기</Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => setIsModalOpen(false)}
        title="모달 제목"
      >
        <p>
          모달 콘텐츠가 여기에 표시됩니다.모달 콘텐츠가 여기에 표시됩니다.모달
          콘텐츠가 여기에 표시됩니다.모달 콘텐츠가 여기에 표시됩니다.모달
        </p>
      </Modal>
    </div>
  );
}

export default Home;
