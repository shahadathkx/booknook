import { Spinner } from "@/components/ui/spinner";
import { RiBookReadLine } from "react-icons/ri";

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="size-12 rounded-2xl bg-[#15251d] border border-[#1f362b] shadow-sm flex items-center justify-center text-[#8fd9a8] mb-4">
        <RiBookReadLine className="size-6 animate-pulse" />
      </div>

      <Spinner size="lg" className="mb-3" />

      <p className="font-heading font-serif text-base font-bold text-foreground">
        BookNook Library
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Preparing curated library shelves...
      </p>
    </div>
  );
}
