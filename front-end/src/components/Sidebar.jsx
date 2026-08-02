import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useThemeStore from "../store/useThemeStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search } from "lucide-react";

const Sidebar = () => {
  const { theme } = useThemeStore();
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  // Filter users to show only those who are online
  const onlineUserList = users.filter(user => onlineUsers.includes(user._id));
  
  // Filter by search query
  const filteredUsers = onlineUserList.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className={`h-full w-20 lg:w-64 border-r flex flex-col transition-all duration-200 ${
      theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}>
      {/* Header & Search */}
      <div className={`border-b w-full p-3.5 space-y-2.5 ${
        theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`size-4 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <span className={`font-semibold text-sm hidden lg:block ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Active People
            </span>
          </div>
          <span className={`hidden lg:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
            theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            {onlineUsers.length} online
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-8 pr-3 py-1 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full flex-1 divide-y divide-gray-100 dark:divide-gray-800/40">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 transition-colors ${
              theme === 'dark' ? 
                selectedUser?._id === user._id ? 'bg-blue-900/40 border-l-4 border-blue-500' : 'hover:bg-gray-700/60' : 
                selectedUser?._id === user._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <div className="relative mx-auto lg:mx-0 shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name || user.fullName}
                className={`size-10 object-cover rounded-full border-2 ${
                  theme === 'dark' ? 'border-gray-800' : 'border-white'
                }`}
              />
              <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className={`font-medium truncate text-xs ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {user.fullName}
              </div>
              <div className="text-[10px] text-emerald-500 font-medium truncate">
                Active now
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className={`text-center py-8 px-4 text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {searchTerm ? "No users match your search" : "No users online right now"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

