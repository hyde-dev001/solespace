import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";

// Assume these icons are imported from an icon library
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserIcon,
  UserCircleIcon,
  ShootingStarIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  route?: string; // Changed from path to route
  subItems?: { name: string; route: string; pro?: boolean; new?: boolean; superAdminOnly?: boolean }[];
  superAdminOnly?: boolean; // Flag for super admin only items
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, openSubmenu, toggleSubmenu } = useSidebar();
  const { url, props } = usePage();
  const auth = (props as any).auth;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  // Filter nav items based on role
  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      {
        icon: <UserIcon />,
        name: "Admin",
        subItems: [
          // Super Admin Only - Admin Management
          { name: "Admin Management", route: "admin.admin-management", pro: false, superAdminOnly: true },
          { name: "User Registration Management", route: "superAdmin.super-admin-user-management", pro: false },
          { name: "Shop Owner Registration Approvals", route: "superAdmin.shop-owner-registration-view", pro: false },
          { name: "Registered Shops", route: "admin.registered-shops", pro: false },
          { name: "Notification & Communication Tools", route: "superAdmin.notification-communication-tools", pro: false },
          { name: "Data & Report Access", route: "superAdmin.data-report-access", pro: false },
          { name: "System Monitoring Dashboard", route: "superAdmin.system-monitoring-dashboard", pro: false }
        ],
      },
    ];

    // Filter out super admin only items if not super admin
    return items.map(item => {
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(subItem => 
            !subItem.superAdminOnly || isSuperAdmin
          )
        };
      }
      return item;
    }).filter(item => !item.superAdminOnly || isSuperAdmin);
  };

  const navItems = getNavItems();
  const othersItems: NavItem[] = [];

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (routeName: string) => {
      try {
        const routeUrl = route(routeName);
        return url === routeUrl || url.startsWith(routeUrl);
      } catch {
        return false;
      }
    },
    [url]
  );

  useEffect(() => {
    let submenuMatched = false;
    let matchedKey: string | null = null;
    
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.route)) {
              const key = `${menuType}-${index}`;
              matchedKey = key;
              submenuMatched = true;
            }
          });
        }
      });
    });

    // Only update if we found a match and it's different from current
    if (submenuMatched && matchedKey && openSubmenu !== matchedKey) {
      toggleSubmenu(matchedKey);
    }
  }, [url, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = openSubmenu;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    const key = `${menuType}-${index}`;
    toggleSubmenu(key);
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    return (
      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => {
          const subItems = nav.subItems?.filter((s) => s.name !== "Create Admin") || nav.subItems;
          if (nav.subItems && (!subItems || subItems.length === 0)) {
            return null;
          }

          return (
            <li key={nav.name}>
              {subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu === `${menuType}-${index}`
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size  ${
                      openSubmenu === `${menuType}-${index}`
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu === `${menuType}-${index}`
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.route && (
                  <Link
                    href={route(nav.route)}
                    className={`menu-item group ${
                      isActive(nav.route) ? "menu-item-active" : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.route)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )
              )}

              {subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu === `${menuType}-${index}`
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={route(subItem.route)}
                          className={`menu-dropdown-item ${
                            isActive(subItem.route)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.route)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.route)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href={route("landing")} className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <ShootingStarIcon className="w-6 h-6 text-yellow-500 animate-pulse" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SoleSpace
              </span>
            </>
          ) : (
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SS
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>

      </div>
    </aside>
  );
};

export default AppSidebar;
