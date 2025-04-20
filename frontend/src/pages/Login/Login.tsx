import useAuthStore from "@/store/authStore";

function Login() {
  const { isLogin, login, logout } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-between h-screen relative">
      <main className="w-screen h-full">
        <div className="w-full h-full fixed z-[-2] background login-background"></div>
        <div>
          <h1>라우터 테스트</h1>
          {isLogin ? (
            <button onClick={logout}>로그아웃</button>
          ) : (
            <button onClick={login}>로그인</button>
          )}
        </div>
      </main>
    </div>
  );
}

export default Login;
