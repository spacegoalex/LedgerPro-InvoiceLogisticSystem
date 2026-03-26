import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
