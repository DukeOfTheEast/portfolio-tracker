import { ChartArea, LayoutDashboard } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="fixed top-16 left-0 w-64 h-full bg-teal-950 border-r p-4 overflow-y-auto sm:block hidden">
      <nav className="space-y-8 font-semibold text-green-300 pt-10">
        <a href="#" className="flex gap-2 p-2 hover:bg-teal-700 rounded">
          <LayoutDashboard size={24} />
          <p>Dashboard</p>
        </a>
        <a
          href="/skill-test"
          className="flex gap-2 p-2 hover:bg-teal-700 rounded"
        >
          <ChartArea size={24} />
          <p>Analysis</p>
        </a>
        {/* <a href="#" className="flex gap-2 p-2 hover:bg-teal-700 rounded">
          <File size={24} />
          <p>Internship</p>
        </a> */}
      </nav>
    </aside>
  );
};

export default Sidebar;
