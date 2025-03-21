import { Card, Descriptions, Image, Tag, Button, Modal, message } from "antd";
import { useEffect, useState } from "react";
import { getClinicInfo, deactivateClinic } from "../../api/clinic";
import { dalImg } from "../../utils/tools";

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
  submitted_by: number;
  submitted_at: string;
  audited_by?: number;
  audited_at?: string;
  created_at: string;
}

function ClinicInfo() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeactivateModalVisible, setIsDeactivateModalVisible] =
    useState(false);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (user.associated_id) {
      loadClinicInfo(user.associated_id);
    }
  }, []);

  const loadClinicInfo = async (id: string) => {
    try {
      const res = await getClinicInfo(id);
      setClinic(res.data);
    } catch (error) {
      console.error("获取诊所信息失败:", error);
    } finally {
      setLoading(false);
    }
  };

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
    return <Tag color={color}>{text}</Tag>;
  };

  const handleDeactivate = async () => {
    if (!clinic) return;
    try {
      await deactivateClinic(clinic.clinic_id.toString());
      message.success("诊所注销成功");
      setIsDeactivateModalVisible(false);
      loadClinicInfo(clinic.clinic_id.toString());
    } catch (error) {
      console.error("诊所注销失败:", error);
      message.error("诊所注销失败");
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!clinic) {
    return <div>未找到诊所信息</div>;
  }

  return (
    <Card
      title="诊所详细信息"
      extra={
        clinic.status === "approved" && (
          <Button danger onClick={() => setIsDeactivateModalVisible(true)}>
            注销诊所
          </Button>
        )
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="诊所名称">{clinic.name}</Descriptions.Item>
        <Descriptions.Item label="状态">
          {getStatusTag(clinic.status)}
        </Descriptions.Item>
        <Descriptions.Item label="地址">{clinic.address}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{clinic.phone}</Descriptions.Item>
        <Descriptions.Item label="邮箱">
          {clinic.email || "未设置"}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {clinic.created_at}
        </Descriptions.Item>
        <Descriptions.Item label="提交时间">
          {clinic.submitted_at}
        </Descriptions.Item>
        <Descriptions.Item label="审核时间">
          {clinic.audited_at || "未审核"}
        </Descriptions.Item>
        <Descriptions.Item label="诊所简介" span={2}>
          {clinic.description || "暂无简介"}
        </Descriptions.Item>
      </Descriptions>

      <Card title="资质信息" style={{ marginTop: 16 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="医疗机构执业许可证">
            {clinic.qualifications.medicalInstitutionLicense ? (
              <Image
                src={dalImg(clinic.qualifications.medicalInstitutionLicense)}
                alt="医疗机构执业许可证"
                style={{ maxWidth: 300 }}
              />
            ) : (
              "未上传"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="营业执照">
            {clinic.qualifications.businesLicense ? (
              <Image
                src={dalImg(clinic.qualifications.businesLicense)}
                alt="营业执照"
                style={{ maxWidth: 300 }}
              />
            ) : (
              "未上传"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="税务登记证">
            {clinic.qualifications.taxCertificate ? (
              <Image
                src={dalImg(clinic.qualifications.taxCertificate)}
                alt="税务登记证"
                style={{ maxWidth: 300 }}
              />
            ) : (
              "未上传"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="注销诊所"
        open={isDeactivateModalVisible}
        onOk={handleDeactivate}
        onCancel={() => setIsDeactivateModalVisible(false)}
      >
        <p>确定要注销该诊所吗？此操作不可恢复。</p>
      </Modal>
    </Card>
  );
}

export default ClinicInfo;
