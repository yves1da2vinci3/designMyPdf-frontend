export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface ForgotPasswordDto {
  email: string;
}

export const authApi = {
  login: (loginInfo: LoginDto) => {
    console.log(loginInfo)
  },
};
