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
} from "antd";
import { SearchOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getClinicAuditLogs, auditClinic } from "../../api/clinic";
import { dalImg } from "../../utils/tools";

const { Text } = Typography;

interface AuditLog {
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

function ClinicAudit() {
  const [form] = Form.useForm();
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<AuditLog | null>(null);
  const [previousLog, setPreviousLog] = useState<AuditLog | null>(null);
  const [query, setQuery] = useState({});
  const [user, setUser] = useState<any>(null);

  const loadData = (params: any) => {
    setLoading(true);
    getClinicAuditLogs(params)
      .then((res: any) => {
        setData(res.data || []);
      })
      .catch((error) => {
        console.error("获取审核记录失败:", error);
        message.error("获取审核记录失败");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    console.log(user);
    setUser(user);
    loadData(query);
  }, [query]);

  // 找到上一次的审核记录
  const findPreviousLog = (currentLog: AuditLog) => {
    if (!data || data.length <= 1) return null;

    // 按操作时间排序
    const sortedData = [...data].sort((a, b) => {
      return (
        new Date(b.operation_time).getTime() -
        new Date(a.operation_time).getTime()
      );
    });

    // 找到当前记录的索引
    const currentIndex = sortedData.findIndex(
      (log) => log.log_id === currentLog.log_id
    );

    // 如果找到且不是最后一条记录，返回上一条记录
    if (currentIndex >= 0 && currentIndex < sortedData.length - 1) {
      return sortedData[currentIndex + 1];
    }

    return null;
  };

  const handleAudit = async (values: any) => {
    if (!currentLog) return;

    try {
      await auditClinic({
        log_id: currentLog.log_id,
        user_id: user.user_id,
        action: values.auditRes,
        comment: values.comment,
      });
      message.success("审核操作成功");
      setIsModalVisible(false);
      loadData(query);
    } catch (error) {
      console.error("审核操作失败:", error);
      message.error("审核操作失败");
    }
  };

  // 比较两个字段是否有变化
  const hasChanged = (current: any, previous: any, field: string) => {
    if (!previous) return false;

    // 如果字段不存在于任一对象中，返回false
    if (!(field in current) || !(field in previous)) return false;

    // 比较值是否相同
    return current[field] !== previous[field];
  };

  // 定义统一的图片容器样式和图片样式
  const imageContainerStyle = {
    padding: 8,
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: 220,
    alignItems: "center",
    // border: "1px solid #bae7ff",
    borderRadius: 4,
  };

  const imageStyle = {
    maxWidth: "100%",
    maxHeight: 180,
    display: "block",
    objectFit: "contain" as const,
  };

  // 渲染对比字段
  const renderCompareField = (fieldName: string, fieldLabel: string) => {
    if (!currentLog) return null;

    // 获取当前值
    const currentValue = currentLog[fieldName as keyof AuditLog];

    // 获取上一个值和是否变化
    let previousValue = null;
    let isChanged = false;

    if (previousLog) {
      previousValue = previousLog[fieldName as keyof AuditLog];
      isChanged = hasChanged(currentLog, previousLog, fieldName);
    }

    if (isChanged) {
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
            <Text delete type="danger" style={{ color: "#cf1322" }}>
              {String(previousValue || "-")}
            </Text>
            <ArrowRightOutlined
              style={{ margin: "0 12px", color: "#1890ff" }}
            />
            <Text strong type="success" style={{ color: "#389e0d" }}>
              {String(currentValue || "-")}
            </Text>
          </div>
        </div>
      );
    }

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

  // 渲染对比图片
  const renderCompareImage = (fieldName: string, fieldLabel: string) => {
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

    // 获取上一个值
    let previousValue = "";
    let isChanged = false;

    if (previousLog) {
      const previousQualifications = previousLog.qualifications || {};
      previousValue = previousQualifications[
        fieldName as keyof typeof previousQualifications
      ] as string;

      // 如果不存在，尝试从licenses数组中获取
      if (
        !previousValue &&
        previousQualifications.licenses &&
        previousQualifications.licenses.length > 0
      ) {
        const license = previousQualifications.licenses.find(
          (lic) =>
            lic.license_number.includes(fieldName) ||
            lic.issued_by.includes(fieldName)
        );
        if (license) {
          previousValue = license.certificate_url;
        }
      }

      isChanged = currentValue !== previousValue;
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

        {isChanged ? (
          <div
            style={{
              border: "1px solid #bae7ff",
              borderRadius: 4,
              padding: 16,
            }}
          >
            <Row gutter={24}>
              {/* 左侧：上一版图片 */}
              {previousValue && (
                <Col span={12}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      type="danger"
                      style={{ marginBottom: 8, color: "#cf1322" }}
                    >
                      变更前
                    </Text>
                    <div style={imageContainerStyle}>
                      {previousValue && (
                        <Image
                          src={dalImg(previousValue)}
                          alt={`之前的${fieldLabel}`}
                          style={imageStyle}
                          preview={{
                            mask: "点击预览",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </Col>
              )}

              {/* 右侧：当前图片 */}
              <Col span={previousValue ? 12 : 24}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Text
                    type="success"
                    style={{ marginBottom: 8, color: "#389e0d" }}
                  >
                    {isChanged ? "变更后" : ""}
                  </Text>
                  <div style={imageContainerStyle}>
                    {currentValue ? (
                      <Image
                        src={dalImg(currentValue)}
                        alt={fieldLabel}
                        style={imageStyle}
                        preview={{
                          mask: "点击预览",
                        }}
                      />
                    ) : (
                      <Text type="secondary">无图片</Text>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        ) : (
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
        )}
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
      approved: { text: "通过", color: "green" },
      rejected: { text: "拒绝", color: "red" },
    };
    const { text, color } = resultMap[result as keyof typeof resultMap] || {
      text: "待审",
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
            setQuery(v);
          }}
        >
          <Form.Item label="诊所名称" name="name" key="name-search">
            <Input placeholder="请输入诊所名称" allowClear />
          </Form.Item>
          <Form.Item label="审核结果" name="auditRes" key="auditRes-search">
            <Select
              placeholder="请选择审核结果"
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
          <Form.Item label="操作时间" name="operation_time" key="time-search">
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
              title: "操作类型",
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
              title: "操作时间",
              dataIndex: "operation_time",
              width: 160,
            },
            {
              title: "审核结果",
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
              width: 120,
              render(v, r: AuditLog) {
                return (
                  <Space key={`action-${r.log_id}`}>
                    {r.auditRes === "pending" && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          setCurrentLog(r);
                          setPreviousLog(findPreviousLog(r));
                          setIsModalVisible(true);
                        }}
                        key={`audit-${r.log_id}`}
                      >
                        审核
                      </Button>
                    )}
                    {(r.auditRes === "approved" ||
                      r.auditRes === "rejected") && (
                      <Button
                        type="default"
                        size="small"
                        onClick={() => {
                          setCurrentLog(r);
                          setPreviousLog(findPreviousLog(r));
                          setIsViewModalVisible(true);
                        }}
                        key={`view-${r.log_id}`}
                      >
                        查看
                      </Button>
                    )}
                  </Space>
                );
              },
            },
          ]}
        />
      </Space>

      <Modal
        title="诊所审核"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={900}
      >
        {currentLog && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                操作类型: {getActionText(currentLog.action)}
              </Text>
              <Text type="secondary" style={{ marginLeft: 16 }}>
                操作时间: {currentLog.operation_time}
              </Text>
            </div>

            {previousLog && (
              <Alert
                message="信息变更提示"
                description="红色删除线标记的是变更前内容，绿色文字标记的是变更后内容。对比区域会直观显示变化内容。点击图片可放大预览。"
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

            {renderCompareField("name", "诊所名称")}
            {renderCompareField("address", "地址")}
            {renderCompareField("phone", "联系电话")}
            {renderCompareField("email", "邮箱")}
            {renderCompareField("description", "诊所简介")}

            <Divider
              orientation="left"
              style={{ borderWidth: 2, margin: "24px 0" }}
            >
              <Text strong style={{ fontSize: 16 }}>
                资质证书
              </Text>
            </Divider>

            <Image.PreviewGroup>
              {renderCompareImage(
                "medicalInstitutionLicense",
                "医疗机构执业许可证"
              )}
              {renderCompareImage("businesLicense", "营业执照")}
              {renderCompareImage("taxCertificate", "税务登记证")}
            </Image.PreviewGroup>

            <Divider
              orientation="left"
              style={{ borderWidth: 2, margin: "24px 0" }}
            >
              <Text strong style={{ fontSize: 16 }}>
                审核操作
              </Text>
            </Divider>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleAudit}
              initialValues={{
                auditRes: "approved",
              }}
            >
              <Form.Item
                label="审核结果"
                name="auditRes"
                rules={[{ required: true, message: "请选择审核结果" }]}
              >
                <Select>
                  <Select.Option value="approved">通过</Select.Option>
                  <Select.Option value="rejected">拒绝</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="审核意见"
                name="comment"
                rules={[
                  {
                    required: true,
                    message: "请输入审核意见",
                  },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder={
                    previousLog
                      ? "请对变更内容进行审核，并输入审核意见"
                      : "请输入审核意见"
                  }
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                  <Button
                    onClick={() => {
                      setIsModalVisible(false);
                      form.resetFields();
                    }}
                  >
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        title="审核详情"
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
        }}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
        bodyStyle={{ maxHeight: "80vh", overflow: "auto" }}
      >
        {currentLog && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                操作类型: {getActionText(currentLog.action)}
              </Text>
              <Text type="secondary" style={{ marginLeft: 16 }}>
                操作时间: {currentLog.operation_time}
              </Text>
              <Text type="secondary" style={{ marginLeft: 16 }}>
                审核结果: {getAuditResultText(currentLog.auditRes)}
              </Text>
            </div>

            {currentLog.comment && (
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

            {previousLog && (
              <Alert
                message="信息变更提示"
                description="红色删除线标记的是变更前内容，绿色文字标记的是变更后内容。对比区域会直观显示变化内容。点击图片可放大预览。"
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

            {renderCompareField("name", "诊所名称")}
            {renderCompareField("address", "地址")}
            {renderCompareField("phone", "联系电话")}
            {renderCompareField("email", "邮箱")}
            {renderCompareField("description", "诊所简介")}

            <Divider
              orientation="left"
              style={{ borderWidth: 2, margin: "24px 0" }}
            >
              <Text strong style={{ fontSize: 16 }}>
                资质证书
              </Text>
            </Divider>

            <Image.PreviewGroup>
              {renderCompareImage(
                "medicalInstitutionLicense",
                "医疗机构执业许可证"
              )}
              {renderCompareImage("businesLicense", "营业执照")}
              {renderCompareImage("taxCertificate", "税务登记证")}
            </Image.PreviewGroup>
          </div>
        )}
      </Modal>
    </Card>
  );
}

export default ClinicAudit;
