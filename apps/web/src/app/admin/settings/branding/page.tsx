import { redirect } from "next/navigation";

export default function BrandingIndexPage() {
  redirect("/admin/settings/branding/logo");
}
