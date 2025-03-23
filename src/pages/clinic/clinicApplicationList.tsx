import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Modal,
  message,
  Space,
  Select,
  DatePicker,
  Descriptions,
  Typography,
  Divider,
  Row,
  Col,
  Alert,
  Image,
  Popconfirm,
} from "antd";
import { SearchOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getMyClinicApplications, withdrawApplication } from "../../api/clinic";
import { dalImg } from "../../utils/tools";

const { Text } = Typography;

interface ApplicationLog {
  log_id: number;
  clinic_id: number;
  action: "submit" | "modify" | "delete";
  name: string;
  address: string;
  description: string;
  qualifications: {
    licenses: Array<{
      license_number: string;
      issued_by: string;
      issue_date: string;
      expiry_date: string;
      certificate_url: string;
    }>;
    medicalInstitutionLicense?: string;
    businesLicense?: string;
    taxCertificate?: string;
  };
  auditRes: "approved" | "rejected" | "pending";
  operated_by: number;
  operation_time: string;
  comment?: string;
}

function ClinicApplicationList() {
  const [data, setData] = useState<ApplicationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<ApplicationLog | null>(null);
  const [query, setQuery] = useState({});
  const [user, setUser] = useState<any>(null);

  const loadData = (params: any) => {
    setLoading(true);
    getMyClinicApplications(params)
      .then((res: any) => {
        setData(res.data || []);
      })
      .catch((error) => {
        console.error("获取申请记录失败:", error);
        message.error("获取申请记录失败");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    console.log(user);
    setUser(user);
    // 附加用户ID到查询参数
    loadData(user.associated_id);
  }, [query]);

  const handleWithdraw = async (log_id: number) => {
    try {
      await withdrawApplication(log_id);
      message.success("撤销申请成功");
      loadData(user.associated_id);
    } catch (error: any) {
      console.error("撤销申请失败:", error);
      message.error("撤销申请失败");
    }
  };

  // 定义统一的图片容器样式和图片样式
  const imageContainerStyle = {
    padding: 8,
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: 220,
    alignItems: "center",
    borderRadius: 4,
  };

  const imageStyle = {
    maxWidth: "100%",
    maxHeight: 180,
    display: "block",
    objectFit: "contain" as const,
  };

  // 渲染字段
  const renderField = (fieldName: string, fieldLabel: string) => {
    if (!currentLog) return null;

    // 获取当前值
    const currentValue = currentLog[fieldName as keyof ApplicationLog];

    return (
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            marginBottom: 8,
            marginLeft: 8,
            fontSize: 14,
          }}
        >
          {fieldLabel}:
        </div>
        <div
          style={{
            padding: 12,
            border: "1px solid #bae7ff",
            borderRadius: 4,
          }}
        >
          {String(currentValue || "-")}
        </div>
      </div>
    );
  };

  // 渲染图片
  const renderImage = (fieldName: string, fieldLabel: string) => {
    if (!currentLog) return null;

    const currentQualifications = currentLog.qualifications || {};

    // 获取当前值
    let currentValue = currentQualifications[
      fieldName as keyof typeof currentQualifications
    ] as string;

    // 如果不存在，尝试从licenses数组中获取
    if (
      !currentValue &&
      currentQualifications.licenses &&
      currentQualifications.licenses.length > 0
    ) {
      // 查找对应的证书
      const license = currentQualifications.licenses.find(
        (lic) =>
          lic.license_number.includes(fieldName) ||
          lic.issued_by.includes(fieldName)
      );
      if (license) {
        currentValue = license.certificate_url;
      }
    }

    return (
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            marginBottom: 8,
            marginLeft: 8,
            fontSize: 14,
          }}
        >
          {fieldLabel}:
        </div>

        <div
          style={{
            border: "1px solid #bae7ff",
            borderRadius: 4,
            padding: 16,
            textAlign: "center",
          }}
        >
          {currentValue ? (
            <div
              style={{
                ...imageContainerStyle,
                margin: "0 auto",
                maxWidth: 400,
              }}
            >
              <Image
                src={dalImg(currentValue)}
                alt={fieldLabel}
                style={imageStyle}
                preview={{
                  mask: "点击预览",
                }}
              />
            </div>
          ) : (
            <Text type="secondary">无图片</Text>
          )}
        </div>
      </div>
    );
  };

  const getActionText = (action: string) => {
    const actionMap = {
      submit: "提交申请",
      modify: "修改信息",
      delete: "申请注销",
    };
    return actionMap[action as keyof typeof actionMap] || action;
  };

  const getAuditResultText = (result: string) => {
    const resultMap = {
      approved: { text: "已通过", color: "green" },
      rejected: { text: "已拒绝", color: "red" },
      pending: { text: "待审核", color: "#1890ff" },
    };
    const { text, color } = resultMap[result as keyof typeof resultMap] || {
      text: "未知",
      color: "default",
    };
    return <span style={{ color }}>{text}</span>;
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Form
          layout="inline"
          onFinish={(v) => {
            setQuery({ ...v, user_id: user?.user_id });
          }}
        >
          <Form.Item label="诊所名称" name="name" key="name-search">
            <Input placeholder="请输入诊所名称" allowClear />
          </Form.Item>
          <Form.Item label="申请状态" name="auditRes" key="auditRes-search">
            <Select
              placeholder="请选择申请状态"
              allowClear
              style={{ width: 120 }}
            >
              <Select.Option value="approved" key="approved">
                已通过
              </Select.Option>
              <Select.Option value="rejected" key="rejected">
                已拒绝
              </Select.Option>
              <Select.Option value="pending" key="pending">
                待审核
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="申请时间" name="operation_time" key="time-search">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item key="search-button">
            <Button
              htmlType="submit"
              type="primary"
              icon={<SearchOutlined />}
            />
          </Form.Item>
        </Form>

        <Table
          dataSource={data}
          rowKey="log_id"
          loading={loading}
          columns={[
            {
              title: "序号",
              width: 60,
              align: "center",
              render(v, r, i) {
                return <span key={`seq-${r.log_id}`}>{i + 1}</span>;
              },
            },
            {
              title: "诊所名称",
              dataIndex: "name",
              width: 150,
            },
            {
              title: "申请类型",
              dataIndex: "action",
              width: 100,
              render(action) {
                return getActionText(action);
              },
            },
            {
              title: "地址",
              dataIndex: "address",
              width: 200,
            },
            {
              title: "申请时间",
              dataIndex: "operation_time",
              width: 160,
            },
            {
              title: "申请状态",
              dataIndex: "auditRes",
              width: 100,
              render(auditRes) {
                return getAuditResultText(auditRes);
              },
            },
            {
              title: "审核意见",
              dataIndex: "comment",
              width: 200,
            },
            {
              title: "操作",
              align: "center",
              width: 150,
              render(v, r: ApplicationLog) {
                return (
                  <Space key={`action-${r.log_id}`}>
                    <Button
                      type="default"
                      size="small"
                      onClick={() => {
                        setCurrentLog(r);
                        setIsViewModalVisible(true);
                      }}
                      key={`view-${r.log_id}`}
                    >
                      查看
                    </Button>
                    {r.auditRes === "pending" && (
                      <Popconfirm
                        title="确定要撤销这条申请吗？"
                        onConfirm={() => handleWithdraw(r.log_id)}
                        okText="确定"
                        cancelText="取消"
                        key={`withdraw-confirm-${r.log_id}`}
                      >
                        <Button
                          type="primary"
                          danger
                          size="small"
                          key={`withdraw-${r.log_id}`}
                        >
                          撤销
                        </Button>
                      </Popconfirm>
                    )}
                  </Space>
                );
              },
            },
          ]}
        />
      </Space>

      <Modal
        title="申请详情"
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
        }}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
        bodyStyle={{ maxHeight: "80vh", overflow: "auto" }}
      >
        {currentLog && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                申请类型: {getActionText(currentLog.action)}
              </Text>
              <Text type="secondary" style={{ marginLeft: 16 }}>
                申请时间: {currentLog.operation_time}
              </Text>
              <Text type="secondary" style={{ marginLeft: 16 }}>
                申请状态: {getAuditResultText(currentLog.auditRes)}
              </Text>
            </div>

            {currentLog.comment && currentLog.auditRes !== "pending" && (
              <Alert
                message={
                  <Text strong>
                    审核意见 (
                    {currentLog.auditRes === "approved" ? "已通过" : "已拒绝"})
                  </Text>
                }
                description={currentLog.comment}
                type={currentLog.auditRes === "approved" ? "success" : "error"}
                showIcon
                style={{
                  marginBottom: 16,
                  backgroundColor:
                    currentLog.auditRes === "approved" ? "#f6ffed" : "#fff2f0",
                  border: `1px solid ${
                    currentLog.auditRes === "approved" ? "#b7eb8f" : "#ffccc7"
                  }`,
                }}
              />
            )}

            {currentLog.auditRes === "pending" && (
              <Alert
                message="申请状态"
                description="您的申请正在审核中，请耐心等待。您可以点击「撤销」按钮撤回此申请。"
                type="info"
                showIcon
                style={{
                  marginBottom: 16,
                  backgroundColor: "#e6f7ff",
                  border: "1px solid #91d5ff",
                }}
              />
            )}

            <Divider
              orientation="left"
              style={{ borderWidth: 2, margin: "24px 0" }}
            >
              <Text strong style={{ fontSize: 16 }}>
                诊所基本信息
              </Text>
            </Divider>

            {renderField("name", "诊所名称")}
            {renderField("address", "地址")}
            {renderField("phone", "联系电话")}
            {renderField("email", "邮箱")}
            {renderField("description", "诊所简介")}

            <Divider
              orientation="left"
              style={{ borderWidth: 2, margin: "24px 0" }}
            >
              <Text strong style={{ fontSize: 16 }}>
                资质证书
              </Text>
            </Divider>

            <Image.PreviewGroup>
              {renderImage("medicalInstitutionLicense", "医疗机构执业许可证")}
              {renderImage("businesLicense", "营业执照")}
              {renderImage("taxCertificate", "税务登记证")}
            </Image.PreviewGroup>
          </div>
        )}
      </Modal>
    </Card>
  );
}

export default ClinicApplicationList;
