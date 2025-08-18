import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import Navbar from "@/components/navigation/Navbar";
import { ProfileDraftProvider } from "@/providers/ProfileDraftProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProfileDraftProvider>
      <Navbar />
      <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </ProfileDraftProvider>
  );
}
