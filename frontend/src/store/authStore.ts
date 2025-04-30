import { create } from "zustand";
import { toast } from "sonner";

interface AuthState {
  isLogin: boolean;
  login: () => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLogin: false,
  login: () => {
    set({ isLogin: true });
    toast("로그인 되었습니다");
  }, //토글 되어서는 안되는 경우가 있기 때문에 다음과 같이 설정
  logout: () => {
    set({ isLogin: false });
    toast("로그아웃 되었습니다");
  },
}));

export default useAuthStore;
