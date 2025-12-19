import { ReactNode } from "react";
import { Home, Users, BookOpen, Settings, Calendar } from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: <Home size={18} />, path: "/admin" },
  { name: "User Management", icon: <Users size={18} />, path: "/admin/users" },
  { name: "Courses & Classes", icon: <BookOpen size={18} />, path: "/admin/courses" },
  { name: "Timetable Management", icon: <Calendar size={18} />, path: "/admin/timetable" },
  { name: "System Oversight", icon: <Settings size={18} />, path: "/admin/system" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 font-bold text-xl text-blue-600">SHS Admin</div>
        <nav className="flex-1">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.path}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 text-gray-700"
                >
                  {item.icon}
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow px-6 py-4 flex justify-between">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Logout
          </button>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
