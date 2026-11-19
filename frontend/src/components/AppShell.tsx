import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SCHOOL_NAME } from "../config";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { getSavedUser, removeAuthToken, apiFetch } from "../lib/api";

export interface NavItem {
  label: string;
  path: string;
}

export interface AppShellProps {
  role: "admin" | "teacher" | "student";
  navItems: NavItem[];
  children: React.ReactNode;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const AppShell: React.FC<AppShellProps> = ({ role, navItems, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState<{ fullName?: string; username?: string; role?: string } | null>(null);

  // Admin Notification States
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const fetchNotifications = async () => {
    if (role !== "admin") return;
    try {
      const res = await apiFetch<{ notifications: NotificationItem[]; unreadCount: number }>("/notifications");
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // ignore in offline mode
    }
  };

  useEffect(() => {
    setUser(getSavedUser());
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (role === "admin") {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => {
        clearInterval(interval);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [role]);

  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/notifications/mark-all-read", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    } catch {}
  };

  const handleLogout = () => {
    removeAuthToken();
    navigate("/login");
  };

  // Find active navigation item label for topbar breadcrumb
  const currentItem = navItems.find((item) => {
    if (item.path === `/${role}`) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  });
  const currentTitle = currentItem ? currentItem.label : "Dashboard";

  const userDisplayName = user?.fullName || user?.username || (role === "admin" ? "Principal Office" : role === "teacher" ? "Faculty Member" : "Registered Student");
  const userInitials = (userDisplayName.substring(0, 2) || "BS").toUpperCase();

  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark">BS</div>
          <div className="brand-text">
            <span className="brand-title">{SCHOOL_NAME}</span>
            <span className="brand-subtitle">{role} portal</span>
          </div>
        </div>

        <div className="sidebar-section-title">Navigation</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== `/${role}` && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar-badge">{userInitials}</div>
            <div className="user-meta">
              <span className="user-name" title={userDisplayName}>{userDisplayName}</span>
              <span className="user-role">{role} &bull; 2026-27</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout} fullWidth>
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <Button
              variant="secondary"
              size="sm"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              Menu
            </Button>
            <div className="topbar-breadcrumbs">
              <span>{SCHOOL_NAME}</span>
              <span className="breadcrumb-separator">/</span>
              <span>{role.toUpperCase()}</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{currentTitle}</span>
            </div>
          </div>

          <div className="topbar-right">
            {role === "admin" && (
              <div className="notifications-wrapper">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setNotificationsOpen((o) => !o)}
                >
                  Alerts {unreadCount > 0 && `(${unreadCount})`}
                </Button>

                {notificationsOpen && (
                  <div className="notifications-panel">
                    <div className="notifications-header">
                      <h4>Admin Notifications</h4>
                      {unreadCount > 0 && (
                        <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <div className="notifications-list">
                      {notifications.length === 0 ? (
                        <div className="notifications-empty">No active notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`notification-item ${!n.isRead ? "unread" : ""}`}
                          >
                            <div className="notification-title">{n.title}</div>
                            <div className="notification-message">{n.message}</div>
                            <div className="notification-time">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} &bull; {new Date(n.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Badge variant={isOnline ? "active" : "inactive"}>
              <span className="badge-dot" />
              {isOnline ? "Online" : "Offline"}
            </Badge>

            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </header>

        {/* Page Body */}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
