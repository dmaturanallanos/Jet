import { redirect } from "next/navigation";

export default function DailyReportsPage() {
  redirect(`/reports/daily/${new Date().toISOString().slice(0, 10)}`);
}
