import { redirect } from "next/navigation";

import { Logo } from "@/components/common";

export default function Home() {
  redirect("/dashboard");

  return (
    <>
      <Logo />
    </>
  );
}
