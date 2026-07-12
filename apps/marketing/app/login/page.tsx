import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/auth-form"), { ssr: false });

export default function LoginPage() {
  return <AuthForm />;
}
