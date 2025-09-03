import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="border-b-4 bg-secondary-background fixed top-0 left-0 w-full z-50">
      <div className="p-5 container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-black">REGEESTER</h1>
        <Button>Sign In</Button>
      </div>
    </header>
  );
};
