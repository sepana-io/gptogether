import Image from "next/image";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "components/atoms";

const Login = () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const signIn = async () => {
    await signInWithPopup(auth, provider);
  };

  return (
    <Button
      size="xl"
      variant="secondary"
      className="w-full items-center justify-center relative"
      leftElement={
        <Image
          width={20}
          height={20}
          alt="google-logo"
          src="/images/google-logo.svg"
          className="absolute top-1/2 left-[20px] transform -translate-y-1/2"
        />
      }
      onClick={signIn}
    >
      Sign in with Google
    </Button>
  );
};

export default Login;
