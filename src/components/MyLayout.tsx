import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Dropdown, Layout, Menu, message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { defaultImg as logo } from "../utils/tools";
import { context } from "./AppProvider";

const { Header, Sider, Content } = Layout;

/**
 * 查找当前选中的menu菜单的值
 * @param key
 * @returns
 */
const findOpenKeys = (key: string, menus: any) => {
  const result: string[] = [];
  const findInfo = (arr: any) => {
    arr.forEach((item: any) => {
      if (key.includes(item.key)) {
        result.push(item.key);
        if (item.children) {
          findInfo(item.children); // 使用递归的方式查找当前页面刷新之后的默认选中项
        }
      }
    });
  };
  findInfo(menus);
  return result;
};

/**
 * 获取当前选中的数据的所有父节点
 * @param key
 * @returns
 */
const findDeepPath = (key: string, menus: any) => {
  const result: any = []; // 处理完所有的menu数据成为一个一维数组
  const findInfo = (arr: any) => {
    arr.forEach((item: any) => {
      const { children, ...info } = item;
      result.push(info);
      if (children) {
        findInfo(children); // 递归处理子节点
      }
    });
  };
  findInfo(menus);
  // 根据当前传递的key值过滤数据，获取到当前用来显示的menu item数据
  const tmpData = result.filter((item: any) => key.includes(item.key));
  if (tmpData.length > 0) {
    return [{ label: "首页", key: "/admin/dashboard" }, ...tmpData];
  }
  return [];
};

const MyLayout = ({ children }: any) => {
  const { menus } = useContext(context);
  const [collapsed, setCollapsed] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<any>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 监听路由变化，更新菜单选中状态
  useEffect(() => {
    const currentKeys = findOpenKeys(pathname, menus);
    setSelectedKeys(currentKeys);
    setOpenKeys(currentKeys);
    setBreadcrumbs(findDeepPath(pathname, menus));
  }, [pathname, menus]);

  return (
    <Layout
      style={{ width: "100vw", height: "100vh" }}
      id="components-layout-demo-custom-trigger"
    >
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <img src={logo} alt="牙医生" />
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onClick={({ key }) => {
            setSelectedKeys([key]);
            navigate(key);
          }}
          onOpenChange={(keys) => {
            setOpenKeys(keys);
          }}
          items={menus}
        />
      </Sider>
      <Layout
        className="site-layout"
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Header className="site-layout-background" style={{ padding: 0 }}>
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
            }
          )}
          <span className="app-title">牙医生平台管理系统</span>
          <Dropdown
            menu={{
              items: [
                {
                  label: (
                    <div
                      onClick={() => {
                        navigate("/admin/info");
                        setSelectedKeys(["/admin/info"]);
                      }}
                      style={{ width: "100%", padding: "5px 0" }}
                    >
                      个人中心
                    </div>
                  ),
                  key: "userCenter",
                },
                {
                  label: (
                    <div
                      onClick={() => {
                        navigate("/");
                      }}
                      style={{ width: "100%", padding: "5px 0" }}
                    >
                      退出
                    </div>
                  ),
                  key: "logOut",
                },
              ],
            }}
          >
            <img
              src={logo}
              style={{
                width: "30px",
                borderRadius: "50%",
                float: "right",
                marginTop: "16px",
                marginRight: "20px",
                cursor: "pointer",
              }}
            />
          </Dropdown>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: "8px",
            padding: 24,
            minHeight: 280,
            overflow: "auto",
            flex: 1,
          }}
        >
          <Breadcrumb
            style={{
              marginBottom: "16px",
            }}
          >
            {breadcrumbs.map((item: any) => (
              <Breadcrumb.Item key={item.key}>{item.label}</Breadcrumb.Item>
            ))}

            {/* <Breadcrumb.Item>Ant Design</Breadcrumb.Item> */}
          </Breadcrumb>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyLayout;
