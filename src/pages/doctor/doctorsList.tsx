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
  InputNumber,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  getDoctorList,
  addDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../api/doctor";
import MyUpload from "../../components/MyUpload";
import { dalImg, getToken } from "../../utils/tools";

// 定义医生信息接口
interface Doctor {
  doctor_id: number;
  clinic_id: number;
  name: string;
  avatar?: string;
  gender: string;
  phone: string;
  email: string;
  specialty: string;
  title: string;
  experience_years: number;
  qualifications: {
    degree: string;
    license: string;
  };
  description: string;
}

function DoctorsList() {
  const [isShow, setIsShow] = useState(false); // 控制modal显示和隐藏
  const [myForm] = Form.useForm(); // 可以获取表单元素实例
  const [query, setQuery] = useState({}); // 查询条件
  const [data, setData] = useState<Doctor[]>([]); // 列表数据
  const [currentId, setCurrentId] = useState(""); // 当前id，如果为空表示新增
  const [imageUrl, setImageUrl] = useState<string>(""); // 上传之后的数据
  const [clinicId, setClinicId] = useState<number>(0); // 诊所id

  // 加载医生列表数据
  const loadData = (query: any) => {
    getDoctorList(query)
      .then((res: any) => {
        try {
          // 确保数据是数组
          const doctorList = res.data || [];
          // 如果返回的不是数组，而是单个对象或其他格式，转换为数组
          if (doctorList && !Array.isArray(doctorList)) {
            if (typeof doctorList === "object") {
              setData([doctorList]);
            } else {
              setData([]);
            }
          } else {
            setData(doctorList);
          }
        } catch (error) {
          console.error("处理医生数据时出错:", error);
          setData([]);
          message.error("获取医生列表失败");
        }
      })
      .catch((error) => {
        console.error("请求医生列表失败:", error);
        setData([]);
        message.error("获取医生列表失败");
      });
  };

  // 监听query变化，重新加载数据
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    setClinicId(user.associated_id);
    loadData({ clinic_id: user.associated_id });
  }, [query]);

  // 关闭弹窗时重置数据
  useEffect(() => {
    if (!isShow) {
      setCurrentId("");
      setImageUrl("");
    }
  }, [isShow]);

  // 渲染页面
  return (
    <>
      <Card>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Form
            layout="inline"
            onFinish={(v) => {
              setQuery(v);
            }}
          >
            <Form.Item label="姓名" name="name" key="name-search">
              <Input placeholder="请输入医生姓名" allowClear />
            </Form.Item>
            <Form.Item label="专业" name="specialty" key="specialty-search">
              <Input placeholder="请输入专业" allowClear />
            </Form.Item>
            <Form.Item key="search-button">
              <Button
                htmlType="submit"
                type="primary"
                icon={<SearchOutlined />}
              />
            </Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsShow(true);
              }}
              key="add-button"
            />
          </Form>
          <Table
            dataSource={data}
            rowKey={(record) => record.doctor_id}
            columns={[
              {
                title: "序号",
                width: 60,
                align: "center",
                render(v, r, i) {
                  return <span key={`seq-${r.doctor_id}`}>{i + 1}</span>;
                },
              },
              {
                title: "姓名",
                dataIndex: "name",
                width: 100,
              },
              {
                title: "头像",
                width: 80,
                align: "center",
                render(v, r: Doctor) {
                  return r.avatar ? (
                    <img
                      key={`avatar-${r.doctor_id}`}
                      className="t-img"
                      src={dalImg(r.avatar)}
                      alt={r.name}
                      style={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                  ) : (
                    <span key={`no-avatar-${r.doctor_id}`}>暂无头像</span>
                  );
                },
              },
              {
                title: "性别",
                dataIndex: "gender",
                width: 60,
                render(gender, record) {
                  return (
                    <span key={`gender-${record.doctor_id}`}>
                      {gender === "male"
                        ? "男"
                        : gender === "female"
                        ? "女"
                        : "未知"}
                    </span>
                  );
                },
              },
              {
                title: "电话",
                dataIndex: "phone",
                width: 120,
              },
              {
                title: "专业",
                dataIndex: "specialty",
                width: 100,
              },
              {
                title: "职称",
                dataIndex: "title",
                width: 100,
              },
              {
                title: "从业年限",
                dataIndex: "experience_years",
                width: 80,
                render: (years, record) => (
                  <span key={`years-${record.doctor_id}`}>{`${years}年`}</span>
                ),
              },
              {
                title: "学历",
                dataIndex: ["qualifications", "degree"],
                width: 100,
              },
              {
                title: "执业证号",
                dataIndex: ["qualifications", "license"],
                width: 100,
              },
              {
                title: "操作",
                align: "center",
                width: 120,
                render(v, r: Doctor) {
                  return (
                    <Space key={`action-${r.doctor_id}`}>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => {
                          const formData = {
                            ...r,
                            degree: r.qualifications?.degree,
                            license: r.qualifications?.license,
                          };
                          setIsShow(true);
                          setCurrentId(r.doctor_id.toString());
                          setImageUrl(r.avatar || "");
                          // 使用 setTimeout 确保在 Modal 打开后再设置表单值
                          setTimeout(() => {
                            myForm.setFieldsValue(formData);
                          }, 0);
                        }}
                        key={`edit-${r.doctor_id}`}
                      />
                      <Popconfirm
                        title="是否确认删除此医生?"
                        onConfirm={async () => {
                          try {
                            await deleteDoctor(r.doctor_id.toString());
                            message.success("删除成功");
                            loadData({ clinic_id: clinicId }); // 重新加载数据
                          } catch (error) {
                            console.error("删除医生失败:", error);
                            message.error("删除失败");
                          }
                        }}
                        key={`popconfirm-${r.doctor_id}`}
                      >
                        <Button
                          type="primary"
                          icon={<DeleteOutlined />}
                          size="small"
                          danger
                          key={`delete-${r.doctor_id}`}
                        />
                      </Popconfirm>
                    </Space>
                  );
                },
              },
            ]}
          />
        </Space>
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title={currentId ? "编辑医生" : "添加医生"}
        open={isShow}
        maskClosable={false}
        onCancel={() => {
          setIsShow(false);
          myForm.resetFields();
        }}
        destroyOnClose
        width={700}
        afterClose={() => {
          myForm.resetFields();
        }}
        onOk={() => {
          myForm.submit();
        }}
      >
        <Form
          preserve={true}
          onFinish={async (values) => {
            // 处理qualifications嵌套对象
            const { degree, license, ...restValues } = values;

            const submitData = {
              ...restValues,
              qualifications: {
                degree,
                license,
              },
            };

            try {
              if (currentId) {
                await updateDoctor({ id: currentId, ...submitData });
                message.success("更新成功");
              } else {
                await addDoctor({ ...submitData, clinic_id: clinicId });
                message.success("添加成功");
              }
              setIsShow(false);
              loadData({ clinic_id: clinicId }); // 重新加载数据
            } catch (error) {
              console.error("保存医生信息失败:", error);
              message.error("操作失败");
            }
          }}
          labelCol={{ span: 4 }}
          form={myForm}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: "请输入医生姓名" }]}
            key="name"
          >
            <Input placeholder="请输入医生姓名" />
          </Form.Item>
          <Form.Item label="头像" key="avatar">
            <MyUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
          </Form.Item>

          <Form.Item
            label="性别"
            name="gender"
            rules={[{ required: true, message: "请选择性别" }]}
            key="gender"
          >
            <Select placeholder="请选择性别">
              <Select.Option value="male" key="male">
                男
              </Select.Option>
              <Select.Option value="female" key="female">
                女
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="电话"
            name="phone"
            rules={[{ required: true, message: "请输入电话号码" }]}
            key="phone"
          >
            <Input placeholder="请输入电话号码" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
            key="email"
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="专业"
            name="specialty"
            rules={[{ required: true, message: "请输入专业" }]}
            key="specialty"
          >
            <Input placeholder="请输入专业" />
          </Form.Item>

          <Form.Item
            label="职称"
            name="title"
            rules={[{ required: true, message: "请输入职称" }]}
            key="title"
          >
            <Input placeholder="请输入职称，例如：主任医师" />
          </Form.Item>

          <Form.Item
            label="从业年限"
            name="experience_years"
            rules={[{ required: true, message: "请输入从业年限" }]}
            key="experience_years"
          >
            <InputNumber
              placeholder="请输入从业年限"
              min={0}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="学历"
            name="degree"
            rules={[{ required: true, message: "请输入学历" }]}
            key="degree"
          >
            <Input placeholder="请输入学历，例如：医学博士" />
          </Form.Item>

          <Form.Item
            label="执业证号"
            name="license"
            rules={[{ required: true, message: "请输入执业证号" }]}
            key="license"
          >
            <Input placeholder="请输入执业证号" />
          </Form.Item>

          <Form.Item label="简介" name="description" key="description">
            <Input.TextArea placeholder="请输入简介" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default DoctorsList;
