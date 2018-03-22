import React, { Component } from 'react';
import { connect } from 'dva';
import {
  Row,
  Card,
  Col,
  Button,
  Input,
  Table,
  Popconfirm,
  Modal,
  Form,
  message,
  Avatar,
  Select,
} from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import UploadImgs from '../../components/UploadImgs/UploadImgs';
import { qiniuDomain } from '../../utils/appConfig';

const FormItem = Form.Item;

@connect(({ staff, loading, department }) => ({
  staff,
  department,
  loading: loading.models.staff,
}))
@Form.create()
export class Checked extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    id: '', // 表格数据
    name: '',
    post: '',
    photo: '',
    departmentID: '', // 表格数据--所属部门
    department: '',
    real_name: '',

    titleSearch: '', // 员工搜索标题
    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数

    department: [], // 后台获取的部门列表
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'staff/fetch',
      payload: {
        currentPage,
        curPageSize,
      },
    });

    this.props.dispatch({
      type: 'department/fetch',
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.staff;
    const { content = [], totalElements } = data;

    this.setState({
      tableData: content,
      tableDataTotal: totalElements,
      department: nextProps.department.data,
    });
  };

  handleRowEditClick = (index, record) => {
    const { id = -1, name, post, photo, department, real_name } = record;
    this.tableCurIndex = index;

    const defaultFileList = [];

    if (photo) {
      defaultFileList.push({
        uid: photo,
        picname: `p-${photo}.png`,
        status: 'done',
        url: photo,
      });
    }

    this.setState({
      id,
      modalVisible: true,
      editFormTitle: record.title,
      defaultFileList,
      editFormFlag: 'update',
      tableCurIndex: index,
      departmentID: department,
    });

    this.props.form.setFieldsValue({
      name,
      post,
      photo,
      department,
      real_name,
    });
  };

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'staff/delete',
      payload: {
        id,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`《${record.name}》已删除 ☠️`);
  };

  handleSetBannerWeight = async (value, recode) => {
    await this.props.dispatch({
      type: 'staff/put',
      payload: {
        id: recode.id,
        weight: value,
      },
    });

    message.success('知错能改，善莫大焉 🛠 ');
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag,
      editFormFlag: 'add',
      editFormTitle: '新增条目',
      defaultFileList: [],
    });

    this.props.form.resetFields();
  };

  /**
   * 表单提交事件，判断是创建员工还是更新员工，分别调用 create 方法和 update 方法
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { editFormFlag, id } = this.state;

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        if (editFormFlag === 'add') {
          await this.props.dispatch({
            type: 'staff/add',
            payload: values,
          });
          this.handleSucceedAdd();
        } else if (editFormFlag === 'update') {
          await this.props.dispatch({
            type: 'staff/put',
            payload: {
              id,
              ...values,
            },
          });
          this.handleSucceedUpdate();
        }
      }
    });
  };

  /**
   * 员工增加成功之后的处理方法，将员工插入到表格最前面
   */
  handleSucceedAdd = () => {
    const { tableData } = this.state;

    tableData.unshift(this.props.staff.append);

    this.setState({
      tableDataTotal: this.state.tableDataTotal + 1,
      curPageSize: this.state.curPageSize + 1,
      tableData,
    });

    this.handleModalVisible(false);
  };
  /**
   * 员工增加更新之后的处理方法，直接修改员工列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.staff.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);
  };

  /**
   * 处理图片上传组件成功上传之后返回的数据
   *
   * @param  {object} [fileList]       文件数据对象数组
   * @param  {string} tag     图片上传组件对应的表单字段
   */
  handleUploadChange = (fileList, tag) => {
    const valueObj = {};

    if (fileList.length > 0) {
      const imageURL = `${qiniuDomain}/${fileList[0].response.key}`;
      valueObj[tag] = imageURL;
      this.props.form.setFieldsValue(valueObj);
    }
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'staff/fetch',
      payload: {
        currentPage: current,
        curPageSize,
      },
    });

    this.setState({ currentPage: current });
  };

  render() {
    const columns = [
      {
        title: '照片',
        className: 'ant-tableThead',
        dataIndex: 'photo',
        render: (text) => {
          return <Avatar shape="square" src={text} size="large" />;
        },
      },
      {
        title: '昵称',
        className: 'ant-tableThead',
        dataIndex: 'name',
      },
      {
        title: '真实姓名',
        className: 'ant-tableThead',
        dataIndex: 'real_name',
      },
      {
        title: '岗位',
        className: 'ant-tableThead',
        dataIndex: 'post',
      },
      {
        title: '部门',
        className: 'ant-tableThead',
        dataIndex: 'sort_name',
      },
      {
        title: '创建时间',
        className: 'ant-tableThead',
        dataIndex: 'create_time',
        width: 160,
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD')}</span>;
        },
      },
      {
        title: '操作',
        className: 'ant-tableThead',
        key: 'action',
        width: 300,
        render: (text, record, index) => {
          const { id = -1 } = record;

          return (
            <span>
              <Button icon="edit" onClick={() => this.handleRowEditClick(index, record)}>
                编辑
              </Button>
              <span className="ant-divider" />

              <Popconfirm
                title="确定要删除吗？"
                placement="topRight"
                onConfirm={() => this.handleRowDeleteClick(id, index, record)}
              >
                <Button type="danger" icon="delete">
                  删除
                </Button>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
        md: { span: 18 },
      },
    };

    const customRules = [
      {
        required: true,
        message: '必填',
      },
    ];

    const { loading } = this.props;
    const {
      modalVisible,
      editFormTitle,
      currentPage,
      curPageSize,
      tableDataTotal,
      department,
    } = this.state;

    return (
      <PageHeaderLayout
        title="员工管理"
        content="在 “关于我们” 子页面中可以看到各个部门的员工， 请确保真实姓名是正确的，会和案例页面中的员工名字相关联。"
      >
        <Card>
          <Row gutter={24}>
            <Col span={4}>
              <h4>员工标题：</h4>
            </Col>
            <Col span={4}>
              <Input />
            </Col>
            <Col span={8}>
              <Button icon="search">查询</Button>
            </Col>
            <Col span={4} offset={2}>
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增员工
              </Button>
            </Col>
          </Row>
        </Card>

        <Row>
          <Table
            columns={columns}
            rowKey={record => record.id || 0}
            dataSource={this.state.tableData}
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: curPageSize,
              total: tableDataTotal,
            }}
            onChange={this.handleTableChange}
          />
        </Row>

        <Modal
          title={editFormTitle}
          visible={modalVisible}
          width={600}
          onOk={this.handleSubmit}
          onCancel={() => this.handleModalVisible(false)}
        >
          <Form onSubmit={this.handleSubmit} width={800}>
            <FormItem {...formItemLayout} label="昵称">
              {getFieldDecorator('name', {
                rules: customRules,
                initialValue: this.state.name,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="真实姓名">
              {getFieldDecorator('real_name', {
                rules: customRules,
                initialValue: this.state.real_name,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="岗位">
              {getFieldDecorator('post', {
                rules: customRules,
                initialValue: this.state.post,
              })(<Input placeholder="产品经理" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="部门">
              {getFieldDecorator('department', {
                rules: customRules,
                initialValue: this.state.departmentID,
              })(
                <Select>
                  {department.map(item => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.sort_name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="照片">
              {getFieldDecorator('photo', { rules: customRules })(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileList}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'photo')}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default Checked;
