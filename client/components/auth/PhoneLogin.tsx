import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export function PhoneLogin() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setOtpSent, setAuthenticating } = useAppStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const selectedCountryCode = watch("countryCode");

  useEffect(() => {
    // Fetch countries from REST Countries API
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2",
        );
        const data = await response.json();

        const formattedCountries: Country[] = data
          .filter((country: any) => country.idd?.root && country.idd?.suffixes)
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2,
            dialCode: country.idd.root + (country.idd.suffixes[0] || ""),
            flag: country.flag,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);

        // Set default to US
        const us = formattedCountries.find((c) => c.code === "US");
        if (us) {
          setValue("countryCode", us.dialCode);
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toast({
          title: "Error",
          description:
            "Failed to load country codes. Please refresh and try again.",
          variant: "destructive",
        });
      }
    };

    fetchCountries();
  }, [setValue, toast]);

  const onSubmit = async (data: PhoneFormData) => {
    setLoading(true);
    setAuthenticating(true);

    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${data.countryCode} ${data.phoneNumber}`,
      });
    }, 1500);
  };

  const selectedCountry = countries.find(
    (c) => c.dialCode === selectedCountryCode,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Gemini
          </CardTitle>
          <CardDescription className="text-center">
            Enter your phone number to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={selectedCountryCode}
                onValueChange={(value) => setValue("countryCode", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.dialCode}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-muted-foreground">
                          {country.dialCode}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.countryCode && (
                <p className="text-sm text-destructive">
                  {errors.countryCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">
                  {selectedCountry && (
                    <>
                      <span className="mr-1">{selectedCountry.flag}</span>
                      <span>{selectedCountryCode}</span>
                    </>
                  )}
                </div>
                <Input
                  {...register("phoneNumber")}
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  className="rounded-l-none"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
