import "@/styles/landing-page-styles.css";
import Hero from "@/components/landing/Hero";

export default function Home() {
  return (
    <>
      <main className="relative min-h-screen w-screen overflow-x-hidden">
        <Hero />
      </main>
    </>
  );
}
