
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

export default function AppLayout() {
  const [menuOpen,setMenuOpen]=useState<boolean>(false)
  return <div className="flex min-h-dvh">
  <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
  <div className="flex min-w-0 flex-1 flex-col">
    <Header onMenuClick={() => setMenuOpen(true)} />
    <main className="flex-1 p-4 md:p-8">
      <Outlet />
    </main>
  </div>
</div>;
}
