import { useGetToken } from "@/hooks/tokenHook";
import { useAuthStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { Link } from "react-router";

interface HeaderProps {
  isMinimize?: boolean;
}

function Header({ isMinimize = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, userName } = useAuthStore();
  const [token, setToken] = useState<number | undefined>();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY >= 52;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const tokenData = useGetToken(isLoggedIn && isMinimize);

  useEffect(() => {
    if (tokenData.data?.token) {
      setToken(tokenData.data.token);
    }
  }, [tokenData.data?.token]);

  return (
    <>
      <header
        className={`${
          scrolled && "bg-white"
        }  z-10 sticky top-0 transition-all duration-150 h-13 flex items-center justify-between`}
      >
        <Link to="/">
          <div className="font-bold text-2xl ml-5">
            <span>HELLO</span>
            <span className="text-primary">JOB</span>
          </div>
        </Link>
        {isMinimize ? (
          isLoggedIn ? (
            <div>
              <Link
                className="shadow-xs border rounded-full px-4 py-1.5 text-sm mr-5 bg-white"
                to="/mypage/account"
              >
                토큰:{" "}
                <span className="text-[#6F52E0]">{token ? token : "0"}</span>
              </Link>
              <Link
                className="shadow-xs border rounded-full px-4 py-1.5 text-sm mr-5 bg-white"
                to="/mypage"
              >
                {userName}님 정보
              </Link>
            </div>
          ) : (
            <Link
              className="shadow-xs border rounded-full px-4 py-1.5 text-sm mr-5 bg-white"
              to="/login"
            >
              로그인
            </Link>
          )
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
