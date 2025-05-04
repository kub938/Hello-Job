import { authApi } from "./instance";

export const userAuthApi = {
  getLoginUserInfo: () => {
    return authApi.get("/api/v1/auth/login");
  },
};
