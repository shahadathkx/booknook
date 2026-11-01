import { redirect } from "next/navigation";

export default function BooksAddRedirect() {
  redirect("/add-book");
}
