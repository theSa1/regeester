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
import z from "zod";
import { client } from "@/lib/orpc";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const Page = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = await client.auth.getAuthenticationOptions({
        username: values.username,
      });

      if (!data.success) {
        toast.error(`Error: ${data.message}`);
        return;
      }

      let authResp;
      try {
        // Pass the options to the authenticator and wait for a response
        authResp = await startAuthentication({ optionsJSON: data.data as any });
      } catch (error) {
        if (error instanceof WebAuthnError) {
          toast.error("Authentication failed. Please try again.");
        } else {
          toast.error("Authentication failed. Please try again.");
        }
        return;
      }

      const verificationData = await client.auth.verifyAuthentication({
        username: values.username,
        authenticationResponse: authResp,
      });

      if (verificationData.success && verificationData.user) {
        toast.success("Logged in successfully!");
        router.push("/app");
      } else {
        toast.error(`Authentication failed: ${verificationData.message}`);
      }
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="i.e. sa1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please enter your username.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign In with Passkey
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
