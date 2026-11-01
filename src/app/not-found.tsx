import Link from "next/link";
import { BookNookButton } from "@/components/ui/booknook-button";
import { RiBookLine, RiHome4Line } from "react-icons/ri";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="size-16 rounded-3xl bg-[#15251d] border border-[#1f362b] shadow-md flex items-center justify-center text-[#8fd9a8] mb-6">
        <RiBookLine className="size-8" />
      </div>

      <span className="text-[11px] font-bold uppercase tracking-widest text-[#e0915a] mb-2">
        Error 404 • Missing Volume
      </span>

      <h1 className="font-heading font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-md">
        Volume Not Found on the Shelf
      </h1>

      <p className="text-xs sm:text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
        The literary page or book volume you are seeking appears to have been re-shelved, relocated, or has never been cataloged in this collection.
      </p>

      <div className="mt-8">
        <Link href="/">
          <BookNookButton size="default" className="gap-2">
            <RiHome4Line className="size-4" />
            <span>Back to Home</span>
          </BookNookButton>
        </Link>
      </div>
    </div>
  );
}
