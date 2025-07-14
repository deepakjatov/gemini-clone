import { PhoneLogin } from "./PhoneLogin";
import { OtpVerification } from "./OtpVerification";
import { useAppStore } from "@/store";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, otpSent } = useAppStore();

  if (!user?.isAuthenticated) {
    return otpSent ? <OtpVerification /> : <PhoneLogin />;
  }

  return <>{children}</>;
}
