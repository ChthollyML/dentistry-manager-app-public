import { Card, Form, Input, Button, message, Space, Upload, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  getClinicInfo,
  submitClinicApplication,
  updateClinicApplication,
} from "../../api/clinic";
import { dalImg, uploadImg } from "../../utils/tools";

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
  status: "pending" | "approved" | "rejected";
}

function ClinicApplication() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [qualifications, setQualifications] = useState({
    medicalInstitutionLicense: "",
    businesLicense: "",
    taxCertificate: "",
  });

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
      setQualifications(res.data.qualifications);
      form.setFieldsValue({
        ...res.data,
        ...res.data.qualifications,
      });
    } catch (error) {
      console.error("获取诊所信息失败:", error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const {
        medicalInstitutionLicense,
        businesLicense,
        taxCertificate,
        ...restValues
      } = values;

      const submitData = {
        ...restValues,
        qualifications: {
          medicalInstitutionLicense,
          businesLicense,
          taxCertificate,
        },
      };

      if (clinic) {
        await updateClinicApplication(submitData);
        message.success("更新申请成功");
      } else {
        await submitClinicApplication(submitData);
        message.success("提交申请成功");
      }
    } catch (error) {
      console.error("提交申请失败:", error);
      message.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: "file",
    action: uploadImg,
    headers: {
      authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    onChange(info: any) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  return (
    <Card title={clinic ? "修改诊所信息" : "申请诊所"}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "pending",
        }}
      >
        <Form.Item
          label="诊所名称"
          name="name"
          rules={[{ required: true, message: "请输入诊所名称" }]}
        >
          <Input placeholder="请输入诊所名称" />
        </Form.Item>

        <Form.Item
          label="地址"
          name="address"
          rules={[{ required: true, message: "请输入诊所地址" }]}
        >
          <Input placeholder="请输入诊所地址" />
        </Form.Item>

        <Form.Item
          label="联系电话"
          name="phone"
          rules={[{ required: true, message: "请输入联系电话" }]}
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item label="医疗机构执业许可证" name="medicalInstitutionLicense">
          <Space direction="vertical" style={{ width: "100%" }}>
            {qualifications.medicalInstitutionLicense && (
              <img
                src={dalImg(qualifications.medicalInstitutionLicense)}
                alt="医疗机构执业许可证"
                style={{ maxWidth: 200, marginBottom: 8 }}
              />
            )}
            <Upload {...uploadProps}>
              <Button icon={<PlusOutlined />}>上传医疗机构执业许可证</Button>
            </Upload>
          </Space>
        </Form.Item>

        <Form.Item label="营业执照" name="businesLicense">
          <Space direction="vertical" style={{ width: "100%" }}>
            {qualifications.businesLicense && (
              <img
                src={dalImg(qualifications.businesLicense)}
                alt="营业执照"
                style={{ maxWidth: 200, marginBottom: 8 }}
              />
            )}
            <Upload {...uploadProps}>
              <Button icon={<PlusOutlined />}>上传营业执照</Button>
            </Upload>
          </Space>
        </Form.Item>

        <Form.Item label="税务登记证" name="taxCertificate">
          <Space direction="vertical" style={{ width: "100%" }}>
            {qualifications.taxCertificate && (
              <img
                src={dalImg(qualifications.taxCertificate)}
                alt="税务登记证"
                style={{ maxWidth: 200, marginBottom: 8 }}
              />
            )}
            <Upload {...uploadProps}>
              <Button icon={<PlusOutlined />}>上传税务登记证</Button>
            </Upload>
          </Space>
        </Form.Item>

        <Form.Item label="诊所简介" name="description">
          <Input.TextArea rows={4} placeholder="请输入诊所简介" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {clinic ? "提交修改" : "提交申请"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default ClinicApplication;
