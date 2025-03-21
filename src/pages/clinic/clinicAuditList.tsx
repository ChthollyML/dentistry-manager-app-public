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
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getClinicAuditLogs, auditClinic } from "../../api/clinic";
import { dalImg } from "../../utils/tools";
import dayjs from "dayjs";

interface AuditLog {
  log_id: number;
  clinic_id: number;
  action: "submit" | "update" | "delete";
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
  const [currentLog, setCurrentLog] = useState<AuditLog | null>(null);
  const [query, setQuery] = useState({});

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
    loadData(query);
  }, [query]);

  const handleAudit = async (values: any) => {
    if (!currentLog) return;

    try {
      await auditClinic(currentLog.clinic_id.toString(), {
        auditRes: values.auditRes,
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

  const getActionText = (action: string) => {
    const actionMap = {
      submit: "提交申请",
      update: "修改信息",
      delete: "删除申请",
    };
    return actionMap[action as keyof typeof actionMap] || action;
  };

  const getAuditResultText = (result: string) => {
    const resultMap = {
      approved: { text: "通过", color: "green" },
      rejected: { text: "拒绝", color: "red" },
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
                          setIsModalVisible(true);
                        }}
                        key={`audit-${r.log_id}`}
                      >
                        审核
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
      >
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
            <Input.TextArea rows={4} placeholder="请输入审核意见" />
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
      </Modal>
    </Card>
  );
}

export default ClinicAudit;
