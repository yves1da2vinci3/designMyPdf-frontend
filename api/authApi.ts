export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authApi = {
  login: (loginInfo: LoginDto) => {
    console.log(loginInfo)
  },
};
