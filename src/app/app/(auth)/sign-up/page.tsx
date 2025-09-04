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
import { startRegistration, WebAuthnError } from "@simplewebauthn/browser";
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
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phoneNumber: z.string().optional(),
});

const Page = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = await client.auth.getRegistrationOptions({
        username: values.username,
        email: values.email || undefined,
        phoneNumber: values.phoneNumber || undefined,
      });

      if (!data.success || !data.data) {
        toast.error(`Error: ${data.message}`);
        return;
      }

      let attResp;
      try {
        attResp = await startRegistration({ optionsJSON: data.data as any });
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
        return;
      }

      const verificationData = await client.auth.verifyRegistration({
        username: values.username,
        email: values.email || undefined,
        phoneNumber: values.phoneNumber || undefined,
        registrationResponse: attResp,
      });

      if (verificationData.success && verificationData.user) {
        toast.success("Registration successful! Welcome!");
        router.push("/app");
      } else {
        toast.error(`Registration failed: ${verificationData.message}`);
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional email address for notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional phone number for notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Sign Up with Passkey
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
