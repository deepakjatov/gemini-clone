import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export function OtpVerification() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { toast } = useToast();
  const { setUser, setOtpSent, setAuthenticating } = useAppStore();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const otpValue = watch("otp") || "";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: OtpFormData) => {
    setLoading(true);

    // Simulate OTP verification
    setTimeout(() => {
      // In a real app, you'd verify the OTP with your backend
      // For demo purposes, accept any 6-digit code
      const mockUser = {
        id: crypto.randomUUID(),
        phone: "+1 234 567 8900", // This would come from the previous step
        countryCode: "+1",
        isAuthenticated: true,
      };

      setUser(mockUser);
      setOtpSent(false);
      setAuthenticating(false);
      setLoading(false);

      toast({
        title: "Login Successful",
        description: "Welcome to Gemini!",
      });
    }, 1500);
  };

  const resendOtp = () => {
    setCountdown(30);
    toast({
      title: "OTP Resent",
      description: "A new verification code has been sent to your phone.",
    });
  };

  const goBack = () => {
    setOtpSent(false);
    setAuthenticating(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Verify Phone Number
          </CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to your phone
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(value) => setValue("otp", value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {errors.otp && (
              <p className="text-sm text-destructive text-center">
                {errors.otp.message}
              </p>
            )}

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in {countdown}s
                </p>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={resendOtp}
                  className="p-0"
                >
                  Resend OTP
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || otpValue.length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={goBack}
            >
              Back
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
