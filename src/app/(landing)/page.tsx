import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Calendar,
  Github,
  QrCode,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  return (
    <main>
      <section className="h-[80vh] border-b-4">
        <div className="container mx-auto p-5 grid grid-cols-2 h-full">
          <div className="flex justify-center flex-col h-full">
            <h2 className="text-7xl font-black text-">
              EVENT
              <br />
              REGISTRATION
              <br />
              <span className="-rotate-2 inline-block px-2 bg-main border-4">
                SIMPLIFIED
              </span>
            </h2>
            <p className="text-2xl font-semibold mt-5">
              Create beautiful event forms in minutes. Get instant QR codes for
              seamless check-ins. Free, open-source, and ridiculously easy to
              use.
            </p>
            <div className="mt-8">
              <Link href="/app/sign-up">
                <Button size="lg" className="bg-green-400 font-black uppercase">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="w-[400px] bg-secondary-background">
              <CardHeader>
                <CardTitle>Event Registration</CardTitle>
                <CardDescription>
                  Simplify your event registration process with our easy-to-use
                  platform.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="bg-blue-500 border-b-4 border-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-16">
            POWERFUL FEATURES
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <Calendar className="h-12 w-12 text-black mb-4" />
              <h3 className="text-xl font-black text-black mb-3">
                FORM BUILDER
              </h3>
              <p className="text-black font-bold">
                Create custom registration forms with drag-and-drop simplicity
              </p>
            </div>
            <div className="bg-green-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <QrCode className="h-12 w-12 text-black mb-4" />
              <h3 className="text-xl font-black text-black mb-3">
                QR CHECK-IN
              </h3>
              <p className="text-black font-bold">
                Instant QR code generation and lightning-fast scanning
              </p>
            </div>
            <div className="bg-pink-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <Users className="h-12 w-12 text-black mb-4" />
              <h3 className="text-xl font-black text-black mb-3">
                ATTENDEE TRACKING
              </h3>
              <p className="text-black font-bold">
                Real-time attendance monitoring and participant management
              </p>
            </div>
            <div className="bg-orange-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200">
              <Shield className="h-12 w-12 text-black mb-4" />
              <h3 className="text-xl font-black text-black mb-3">
                SECURE & PRIVATE
              </h3>
              <p className="text-black font-bold">
                Open source transparency with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-400 border-b-4 border-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl md:text-5xl font-black text-black text-center mb-16">
            HOW IT WORKS
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white border-4 border-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-3xl font-black text-black">1</span>
              </div>
              <h3 className="text-2xl font-black text-black mb-4">
                CREATE FORM
              </h3>
              <p className="text-black font-bold text-lg">
                Build your event registration form with our intuitive
                drag-and-drop builder
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white border-4 border-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-3xl font-black text-black">2</span>
              </div>
              <h3 className="text-2xl font-black text-black mb-4">
                SHARE LINK
              </h3>
              <p className="text-black font-bold text-lg">
                Share your registration link and watch participants sign up
                instantly
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white border-4 border-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-3xl font-black text-black">3</span>
              </div>
              <h3 className="text-2xl font-black text-black mb-4">
                SCAN & TRACK
              </h3>
              <p className="text-black font-bold text-lg">
                Scan QR codes at your event for instant check-in and real-time
                tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-yellow-400 border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-black mb-6">
            READY TO SIMPLIFY YOUR EVENTS?
          </h2>
          <p className="text-xl font-bold text-black mb-8">
            Join thousands of organizers who trust Regeester for their events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button className="bg-pink-500 text-white font-black px-10 py-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 text-lg flex items-center justify-center">
              GET STARTED FREE
              <ArrowRight className="ml-2 h-5 w-5" />
            </button> */}
            <Button
              size="lg"
              variant="neutral"
              className="font-black uppercase"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400 font-bold">
              © 2025 Regeester. Free and open source software.{" "}
              <span className="text-yellow-400">
                Built with ❤️ for the community.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
