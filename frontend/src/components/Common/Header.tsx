import { Link } from "react-router";

interface HeaderProps {
  isMinimize?: boolean;
}

function Header({ isMinimize = false }: HeaderProps) {
  return (
    <>
      <header className="z-10 sticky top-0 max-w-screen-xl mx-auto w-full h-13 flex items-center justify-between">
        <Link to="/">
          <div className="font-bold text-2xl ml-5">
            <span>HELLO</span>
            <span className="text-primary">JOB</span>
          </div>
        </Link>
        {isMinimize ? (
          <Link
            className="shadow-xs border rounded-full px-4 py-1.5 text-sm"
            to="/mypage"
          >
            OOO님 정보
          </Link>
        ) : (
          <ul className="flex gap-3 mr-5">
            <li>
              <Link to="/resume">인적사항</Link>
            </li>
            <li>
              <Link to="/corporate-search">기업분석</Link>
            </li>
            <li>
              <Link to="/job-analysis">직무분석</Link>
            </li>
            <li>
              <Link to="/cover-letter">자기소개서</Link>
            </li>
            <li>
              <Link to="/interview">면접</Link>
            </li>
            <li>
              <Link to="/mypage">마이페이지</Link>
            </li>
          </ul>
        )}
      </header>
    </>
  );
}

export default Header;
