import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  message,
  Tabs,
  Select,
} from "antd";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { context } from "../components/AppProvider";
import { AccountStatus, loginAPI, registerAPI, Role } from "../api/auth";
import { defaultImg, setToken } from "../utils/tools";
import { DentalClinicLogo, DentalBackground } from "../components/DentalIcons";
import {
  Fade,
  Scale,
  Slide,
  AnimationStyles,
} from "../components/AnimatedTransition";
import styles from "./login.module.css";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

// 定义登录表单数据类型
interface LoginFormData {
  username: string;
  password: string;
}

// 定义注册表单数据类型
interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
  role: Role;
  status: AccountStatus;
}

function Login() {
  const navigate = useNavigate();
  const { resetMenus } = useContext(context);
  const [activeTab, setActiveTab] = useState("login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleLogin = async (values: LoginFormData) => {
    console.log(values);
    const res = await loginAPI({
      username: values.username,
      password: values.password,
    });
    if (res.code === 0) {
      message.success("登录成功");
      sessionStorage.setItem("user", JSON.stringify(res.data));
      setToken("12312"); // 此处可以使用服务器返回的用户角色数据
      resetMenus(res.data.role); // 重置路由菜单
      navigate("/admin/dashboard");
    } else {
      console.log(res);
      message.error("用户名或密码错误");
    }
  };

  const handleRegister = async (values: RegisterFormData) => {
    const res = await registerAPI({
      username: values.username,
      password: values.password,
      email: values.email,
      phone: values.phone,
      role: values.role,
      status: AccountStatus.ACTIVE,
    });
    if (res.code === 0) {
      message.success("注册成功，请登录");
      setActiveTab("login");
    } else {
      console.log(res);
      message.error("注册失败：" + (res.error?.message || "未知错误"));
    }
  };

  return (
    <div className={styles.loginContainer}>
      <AnimationStyles />
      <DentalBackground />

      <Scale in={mounted} duration={800}>
        <div className={styles.loginCard}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <DentalClinicLogo />
            </div>
          </div>

          <h1 className={styles.cardTitle}>牙医生平台管理系统</h1>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            className={styles.customTabs}
            items={[
              {
                key: "login",
                label: "登录",
                children: (
                  <Fade
                    key="login-form"
                    in={activeTab === "login"}
                    duration={500}
                  >
                    <div className={styles.tabContent}>
                      <Form
                        layout="vertical"
                        onFinish={handleLogin}
                        size="large"
                      >
                        <Form.Item
                          label="用户名"
                          name="username"
                          className={styles.formItem}
                          rules={[
                            {
                              required: true,
                              message: "请输入用户名",
                            },
                          ]}
                        >
                          <Input placeholder="请输入用户名" />
                        </Form.Item>
                        <Form.Item
                          label="密码"
                          name="password"
                          className={styles.formItem}
                          rules={[
                            {
                              required: true,
                              message: "请输入密码",
                            },
                          ]}
                        >
                          <Input.Password
                            placeholder="请输入密码"
                            iconRender={(visible) =>
                              visible ? (
                                <EyeTwoTone />
                              ) : (
                                <EyeInvisibleOutlined />
                              )
                            }
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            htmlType="submit"
                            type="primary"
                            className={styles.submitButton}
                          >
                            登录
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                  </Fade>
                ),
              },
              {
                key: "register",
                label: "注册",
                children: (
                  <Fade
                    key="register-form"
                    in={activeTab === "register"}
                    duration={500}
                  >
                    <div className={styles.tabContent}>
                      <Form
                        layout="vertical"
                        onFinish={handleRegister}
                        size="large"
                      >
                        <Form.Item
                          label="用户名"
                          name="username"
                          className={styles.formItem}
                          rules={[
                            {
                              required: true,
                              message: "请输入用户名",
                            },
                          ]}
                        >
                          <Input placeholder="请输入用户名" />
                        </Form.Item>
                        <Form.Item
                          label="密码"
                          name="password"
                          className={styles.formItem}
                          rules={[
                            {
                              required: true,
                              message: "请输入密码",
                            },
                          ]}
                        >
                          <Input.Password
                            placeholder="请输入密码"
                            iconRender={(visible) =>
                              visible ? (
                                <EyeTwoTone />
                              ) : (
                                <EyeInvisibleOutlined />
                              )
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          label="确认密码"
                          name="confirmPassword"
                          className={styles.formItem}
                          dependencies={["password"]}
                          rules={[
                            {
                              required: true,
                              message: "请确认密码",
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (
                                  !value ||
                                  getFieldValue("password") === value
                                ) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error("两次输入的密码不一致")
                                );
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            placeholder="请确认密码"
                            iconRender={(visible) =>
                              visible ? (
                                <EyeTwoTone />
                              ) : (
                                <EyeInvisibleOutlined />
                              )
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          label="身份"
                          name="role"
                          className={styles.formItem}
                          rules={[
                            {
                              required: true,
                              message: "请选择身份",
                            },
                          ]}
                        >
                          <Select placeholder="请选择身份">
                            <Select.Option value={Role.ADMIN}>
                              平台管理员
                            </Select.Option>
                            <Select.Option value={Role.DOCTOR}>
                              医生
                            </Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label="邮箱"
                          name="email"
                          className={styles.formItem}
                          rules={[
                            {
                              required: true,
                              message: "请输入邮箱",
                            },
                            {
                              type: "email",
                              message: "请输入有效的邮箱地址",
                            },
                          ]}
                        >
                          <Input placeholder="请输入邮箱" />
                        </Form.Item>
                        <Form.Item
                          label="手机号码"
                          name="phone"
                          className={styles.formItem}
                          rules={[
                            {
                              required: true,
                              message: "请输入手机号码",
                            },
                            {
                              pattern: /^1[3-9]\d{9}$/,
                              message: "请输入有效的手机号码",
                            },
                          ]}
                        >
                          <Input placeholder="请输入手机号码" />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            htmlType="submit"
                            type="primary"
                            className={styles.submitButton}
                          >
                            注册
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                  </Fade>
                ),
              },
            ]}
          />
        </div>
      </Scale>
    </div>
  );
}

export default Login;
