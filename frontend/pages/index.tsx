import Image from "next/image";
import { Text } from "components/atoms";
import GoogleLoginButton from "components/login/GoogleLoginButton";

function LoginPage() {
  return (
    <div className="container mx-auto pt-[40px] pb-[80px] min-h-screen flex items-center flex-col justify-center">
      <div className="max-w-[481px] w-auto mx-auto mb-[24px]">
        <Image
          alt="gpt-logo"
          height={88}
          width={481}
          src="/images/gptogether-logo.png"
        />
      </div>
      <div className="max-w-[456px] mx-auto flex flex-col items-center">
        <Text
          size="text-size_heading6"
          className="mb-[40px] text-center text-gray-900"
        >
          Connect and collaborate based on your ChatGPT prompts
        </Text>
        <GoogleLoginButton />
      </div>
    </div>
  );
}

export default LoginPage;
