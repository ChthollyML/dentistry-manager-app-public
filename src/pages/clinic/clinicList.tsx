import {
  Card,
  Button,
  Form,
  Input,
  Table,
  Space,
  Modal,
  message,
  Popconfirm,
  Select,
  Descriptions,
  Image,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  getClinicList,
  deleteClinic,
  forbidClinic,
  getClinicInfo,
} from "../../api/clinic";
import { dalImg } from "../../utils/tools";

// 定义诊所信息接口
interface Clinic {
  clinic_id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description: string;
  qualifications: {
    medicalInstitutionLicense?: string;
    businesLicense?: string;
    taxCertificate?: string;
  };
  status: "pending" | "approved" | "rejected" | "deactivated";
  isforbid: boolean;
  submitted_by: number;
  submitted_at: string;
  audited_by?: number;
  audited_at?: string;
  created_at: string;
}

function ClinicList() {
  const [query, setQuery] = useState({});
  const [data, setData] = useState<Clinic[]>([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

  // 加载诊所列表数据
  const loadData = (query: any) => {
    getClinicList(query)
      .then((res: any) => {
        try {
          const clinicList = res.data || [];
          if (clinicList && !Array.isArray(clinicList)) {
            if (typeof clinicList === "object") {
              setData([clinicList]);
            } else {
              setData([]);
            }
          } else {
            setData(clinicList);
          }
        } catch (error) {
          console.error("处理诊所数据时出错:", error);
          setData([]);
          message.error("获取诊所列表失败");
        }
      })
      .catch((error) => {
        console.error("请求诊所列表失败:", error);
        setData([]);
        message.error("获取诊所列表失败");
      });
  };

  useEffect(() => {
    loadData(query);
  }, [query]);

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: "orange", text: "待审核" },
      approved: { color: "green", text: "已通过" },
      rejected: { color: "red", text: "已拒绝" },
      deactivated: { color: "default", text: "已注销" },
    };
    const { color, text } = statusMap[status as keyof typeof statusMap] || {
      color: "default",
      text: "未知",
    };
    return <span style={{ color }}>{text}</span>;
  };

  const handleView = async (clinicId: number) => {
    try {
      const res = await getClinicInfo(clinicId.toString());
      setCurrentClinic(res.data);
      setIsViewModalVisible(true);
    } catch (error) {
      console.error("获取诊所详情失败:", error);
      message.error("获取诊所详情失败");
    }
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
          <Form.Item label="状态" name="status" key="status-search">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              <Select.Option value="pending" key="pending">
                待审核
              </Select.Option>
              <Select.Option value="approved" key="approved">
                已通过
              </Select.Option>
              <Select.Option value="rejected" key="rejected">
                已拒绝
              </Select.Option>
              <Select.Option value="deactivated" key="deactivated">
                已注销
              </Select.Option>
            </Select>
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
          rowKey={(record) => record.clinic_id}
          columns={[
            {
              title: "序号",
              width: 60,
              align: "center",
              render(v, r, i) {
                return <span key={`seq-${r.clinic_id}`}>{i + 1}</span>;
              },
            },
            {
              title: "诊所名称",
              dataIndex: "name",
              width: 150,
            },
            {
              title: "地址",
              dataIndex: "address",
              width: 200,
            },
            {
              title: "联系电话",
              dataIndex: "phone",
              width: 120,
            },
            {
              title: "状态",
              dataIndex: "status",
              width: 100,
              render(status) {
                return getStatusTag(status);
              },
            },
            {
              title: "禁用状态",
              dataIndex: "isforbid",
              width: 100,
              render(isforbid) {
                return (
                  <span style={{ color: isforbid ? "red" : "green" }}>
                    {isforbid ? "已禁用" : "正常"}
                  </span>
                );
              },
            },
            {
              title: "提交时间",
              dataIndex: "submitted_at",
              width: 160,
            },
            {
              title: "操作",
              align: "center",
              width: 180,
              render(v, r: Clinic) {
                return (
                  <Space key={`action-${r.clinic_id}`}>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => handleView(r.clinic_id)}
                      key={`view-${r.clinic_id}`}
                    >
                      查看
                    </Button>
                    <Popconfirm
                      title={`是否确认${r.isforbid ? "启用" : "禁用"}此诊所?`}
                      onConfirm={async () => {
                        try {
                          await forbidClinic(r.clinic_id.toString());
                          message.success(
                            `${r.isforbid ? "启用" : "禁用"}成功`
                          );
                          loadData(query);
                        } catch (error) {
                          console.error("操作失败:", error);
                          message.error("操作失败");
                        }
                      }}
                      key={`forbid-${r.clinic_id}`}
                    >
                      <Button
                        type="primary"
                        icon={<StopOutlined />}
                        size="small"
                        danger={!r.isforbid}
                        key={`forbid-btn-${r.clinic_id}`}
                      >
                        {r.isforbid ? "启用" : "禁用"}
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="是否确认删除此诊所?"
                      onConfirm={async () => {
                        try {
                          await deleteClinic(r.clinic_id.toString());
                          message.success("删除成功");
                          loadData(query);
                        } catch (error) {
                          console.error("删除诊所失败:", error);
                          message.error("删除失败");
                        }
                      }}
                      key={`popconfirm-${r.clinic_id}`}
                    >
                      <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        key={`delete-${r.clinic_id}`}
                      />
                    </Popconfirm>
                  </Space>
                );
              },
            },
          ]}
        />
      </Space>

      <Modal
        title="诊所详细信息"
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setCurrentClinic(null);
        }}
        footer={null}
        width={800}
      >
        {currentClinic && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="诊所名称">
                {currentClinic.name}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(currentClinic.status)}
              </Descriptions.Item>
              <Descriptions.Item label="地址">
                {currentClinic.address}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {currentClinic.phone}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {currentClinic.email || "未设置"}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {currentClinic.created_at}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {currentClinic.submitted_at}
              </Descriptions.Item>
              <Descriptions.Item label="审核时间">
                {currentClinic.audited_at || "未审核"}
              </Descriptions.Item>
              <Descriptions.Item label="诊所简介" span={2}>
                {currentClinic.description || "暂无简介"}
              </Descriptions.Item>
            </Descriptions>

            <Card title="资质信息" style={{ marginTop: 16 }}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="医疗机构执业许可证">
                  {currentClinic.qualifications.medicalInstitutionLicense ? (
                    <Image
                      src={dalImg(
                        currentClinic.qualifications.medicalInstitutionLicense
                      )}
                      alt="医疗机构执业许可证"
                      style={{ maxWidth: 300 }}
                    />
                  ) : (
                    "未上传"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="营业执照">
                  {currentClinic.qualifications.businesLicense ? (
                    <Image
                      src={dalImg(currentClinic.qualifications.businesLicense)}
                      alt="营业执照"
                      style={{ maxWidth: 300 }}
                    />
                  ) : (
                    "未上传"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="税务登记证">
                  {currentClinic.qualifications.taxCertificate ? (
                    <Image
                      src={dalImg(currentClinic.qualifications.taxCertificate)}
                      alt="税务登记证"
                      style={{ maxWidth: 300 }}
                    />
                  ) : (
                    "未上传"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Modal>
    </Card>
  );
}

export default ClinicList;
