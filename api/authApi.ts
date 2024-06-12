export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface SignupDto {
  email: string;
  password: string;
}
export interface updateUserDTO {
  userName?: string;
  password?: string;
  confirmPassword?: string;
}
export interface ForgotPasswordDto {
  email: string;
}

export const authApi = {
  login: (loginInfo: LoginDto) => {
    console.log(loginInfo)
  },
  signup: (signup: SignupDto) => {
    console.log(signup)
  },
  update: (updateUser: updateUserDTO) => {
    console.log(updateUser)
  },
};
