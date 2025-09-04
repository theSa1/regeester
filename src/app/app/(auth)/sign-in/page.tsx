"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { startAuthentication, WebAuthnError } from "@simplewebauthn/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import z from "zod";
import { client } from "@/lib/orpc";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const Page = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const data = await client.auth.getAuthenticationOptions({
        email: values.email,
      });

      if (!data.success) {
        toast.error(`Error: ${data.message}`);
        setIsLoading(false);
        return;
      }

      let authResp;
      try {
        // Pass the options to the authenticator and wait for a response
        authResp = await startAuthentication({
          optionsJSON: data.data as any,
          useBrowserAutofill: true,
        });
      } catch (error) {
        if (error instanceof WebAuthnError) {
          toast.error("Authentication failed. Please try again.");
        } else {
          toast.error("Authentication failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      const verificationData = await client.auth.verifyAuthentication({
        email: values.email,
        authenticationResponse: authResp,
      });

      if (verificationData.success && verificationData.user) {
        toast.success("Logged in successfully!");
        router.push("/app");
      } else {
        toast.error(`Authentication failed: ${verificationData.message}`);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-secondary-background">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Please enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        autoComplete="webauthn"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Please enter your email address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In with Passkey"}
              </Button>
            </form>
          </Form>
          <p className="text-center mt-4 text-sm text-foreground/70">
            Don't have an account?{" "}
            <Link
              href="/app/sign-up"
              className="text-main-foreground underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default Page;
