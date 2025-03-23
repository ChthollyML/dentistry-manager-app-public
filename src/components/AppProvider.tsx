import { createContext, useEffect, useState } from "react";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import Dashboard from "../pages/dashboard";
import Info from "../pages/info/info";
import ClinicList from "../pages/clinic/clinicList";
import ClinicAuditList from "../pages/clinic/clinicAuditList";
import DoctorsList from "../pages/doctor/doctorsList";
import ClinicInfo from "../pages/clinic/clinicInfo";
import ClinicApplication from "../pages/clinic/clinicApplication";
import ClinicApplicationList from "../pages/clinic/clinicApplicationList";
export const context = createContext<any>({});

// 如果需要再加新的页面，只需要写好组件之后 改这个数组就好
const sideMenuData = [
  {
    key: "/admin/dashboard",
    icon: <DashboardOutlined />,
    element: <Dashboard />,
    label: "看板",
  },
  {
    key: "/admin/info",
    icon: <UserOutlined />,
    element: <Info />,
    label: "个人中心",
    roles: ["doctor"],
  },
  {
    key: "/admin/clinic",
    icon: <UploadOutlined />,
    label: "诊所管理",
    roles: ["clinic_manager", "admin"],
    children: [
      {
        label: "诊所列表",
        key: "/admin/clinic/list",
        roles: ["admin"],
        element: <ClinicList />,
      },
      {
        label: "诊所审核",
        key: "/admin/clinic/audit",
        roles: ["admin"],
        element: <ClinicAuditList />,
      },
      {
        label: "诊所详情",
        key: "/admin/clinic/info",
        roles: ["clinic_manager"],
        element: <ClinicInfo />,
      },
      {
        label: "信息修改",
        key: "/admin/clinic/application",
        roles: ["clinic_manager"],
        element: <ClinicApplication />,
      },
      {
        label: "审核记录",
        key: "/admin/clinic/audit-log",
        roles: ["clinic_manager"],
        element: <ClinicApplicationList />,
      },
    ],
  },
  {
    key: "/admin/doctor",
    icon: <UploadOutlined />,
    label: "医生管理",
    roles: ["clinic_manager"],
    children: [
      {
        label: "医生列表",
        key: "/admin/doctor/list",
        roles: ["clinic_manager"],
        element: <DoctorsList />,
      },
    ],
  },
];

/**
 * 根据role角色生成侧边栏菜单
 * @param role
 * @returns
 */
function findRoles(role: string) {
  const arr: any = [];
  findInfo(sideMenuData);
  function findInfo(data: any, parent: any = null) {
    data.forEach((item: any) => {
      const { children, ...info } = item;
      if (children) {
        info.children = [];
        findInfo(children, info.children);
        info.children.length == 0 ? delete info.children : null;
      }
      if (info.roles) {
        if (info.roles?.includes(role))
          parent ? parent.push(info) : arr.push(info);
      } else {
        parent ? parent.push(info) : arr.push(info);
      }
    });
  }

  return arr;
}

/**
 * 根据侧边栏实现路由信息的扁平化处理
 * @param menus
 * @returns
 */
function flatRoutes(menus: any) {
  const arr: any = [];
  function findInfo(data: any) {
    data.forEach((item: any) => {
      const { children, ...info } = item;
      arr.push(info);
      if (children) {
        findInfo(children);
      }
    });
  }
  findInfo(menus);
  return arr;
}

function AppProvider({ children }: any) {
  // 初始化的时候从本地存储获取角色信息
  let defaultMenus = [];
  let defaultRoutes = [];
  const oldRole = sessionStorage.getItem("role");
  if (oldRole) {
    defaultMenus = findRoles(oldRole);
    defaultRoutes = flatRoutes(defaultMenus);
  }
  const [menus, setMenus] = useState(defaultMenus);
  const [routes, setRoutes] = useState(defaultRoutes);

  // 根据当前的角色生成路由数组和侧边栏数组
  const resetMenus = (role: string) => {
    sessionStorage.setItem("role", role);
    // 此处重置菜单和路由数据
    const tmpMenu = findRoles(role);
    setMenus(tmpMenu);
    setRoutes(flatRoutes(tmpMenu));
  };
  console.log(menus, routes);
  return (
    <context.Provider value={{ menus, routes, resetMenus }}>
      {children}
    </context.Provider>
  );
}

export default AppProvider;
