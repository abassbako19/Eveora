import type { Metadata } from "next";
import SendMoneyExperience from "@/components/send-money/send-money-experience";

export const metadata: Metadata = {
  title: "Send Money | Eveora",
  description:
    "Explore Eveora's planned international money transfer experience.",
};

export default function SendMoneyPage() {
  return <SendMoneyExperience />;
}
