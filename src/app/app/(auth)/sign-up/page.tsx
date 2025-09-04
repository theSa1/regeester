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
import {
  PublicKeyCredentialCreationOptionsJSON,
  startRegistration,
  WebAuthnError,
} from "@simplewebauthn/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import z from "zod";
import { client } from "@/lib/orpc";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
});

const Page = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const data = await client.auth.getRegistrationOptions({
        email: values.email,
        name: values.name,
      });

      if (!data.success || !data.data) {
        toast.error(`Error: ${data.message}`);
        setIsLoading(false);
        return;
      }

      let attResp;
      try {
        attResp = await startRegistration({
          optionsJSON: data.data as PublicKeyCredentialCreationOptionsJSON,
        });
      } catch (error) {
        if (
          error instanceof WebAuthnError &&
          error.name === "InvalidStateError"
        ) {
          toast.error(
            "This authenticator is already registered. Please try signing in instead."
          );
        } else {
          toast.error("Registration failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      const verificationData = await client.auth.verifyRegistration({
        email: values.email,
        name: values.name,
        registrationResponse: attResp,
      });

      if (verificationData.success && verificationData.user) {
        toast.success("Registration successful! Welcome!");
        router.push("/app");
      } else {
        toast.error(`Registration failed: ${verificationData.message}`);
        setIsLoading(false);
      }
    } catch {
      toast.error("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-secondary-background">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create your account with a passkey for secure, passwordless
            authentication.
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
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your email address for sign in.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your full name for display.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up with Passkey"}
              </Button>
            </form>
          </Form>
          <p className="text-center mt-4 text-sm text-foreground/70">
            Already have an account?{" "}
            <Link
              href="/app/sign-in"
              className="text-main-foreground underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default Page;
