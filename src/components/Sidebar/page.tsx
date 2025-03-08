import { ChartArea, LayoutDashboard } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  return (
    <aside className="fixed top-16 left-0 w-64 h-full bg-teal-950 border-r p-4 overflow-y-auto sm:block hidden">
      <nav className="space-y-8 font-semibold text-green-300 pt-10">
        <Link href="/" className="flex gap-2 p-2 hover:bg-teal-700 rounded">
          <LayoutDashboard size={24} />
          <p>Dashboard</p>
        </Link>
        <Link
          href="/analysis"
          className="flex gap-2 p-2 hover:bg-teal-700 rounded"
        >
          <ChartArea size={24} />
          <p>Analysis</p>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
