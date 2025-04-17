import useAuthStore from "../../store/authStore";

function Home() {
  const { isLogin, login, logout } = useAuthStore();

  return (
    <>
      <h1>라우터 테스트</h1>
      {isLogin ? (
        <button onClick={logout}>로그아웃</button>
      ) : (
        <button onClick={login}>로그인</button>
      )}
    </>
  );
}

export default Home;
