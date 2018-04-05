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

// 连接model层的state数据，然后通过this.props.state名(namespace)访问model层的state数据
@connect(({ members, loading }) => ({
  members,
  loading: loading.models.members,
}))

@Form.create()
export class MembersManage extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    number: '',
    email: '',
    phone: '',
    password: '',
    nickname: '',
    name: '',
    sex: '',
    age: '',
    address: '',
    portrait: '',
    personal_statement: '',
    integral: '',
    status: '',

    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'members/fetch',
      payload: {
        currentPage,
        curPageSize,
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.members;
    const { content = [], totalElements } = data;
    this.setState({
      tableData: content,
      tableDataTotal: totalElements,
    });
  };

  handleRowEditClick = (index, record) => {
    const { 
      id = -1, 
      number,
      email,
      phone,
      password,
      nickname,
      name,
      sex,
      age,
      address,
      portrait,
      personal_statement,
      integral,
      status,
    } = record;
    this.tableCurIndex = index;

    this.setState({
      id,
      modalVisible: true,
      editFormTitle: '编辑信息',
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      number,
      email,
      phone,
      nickname,
      sex,
      integral,
    });
  };

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'members/delete',
      payload: {
        id,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`《${record.number}${record.nickname}》已删除 ☠️`);
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag,
      editFormFlag: 'add',
      editFormTitle: '新增用户',
    });

    this.props.form.resetFields();
  };

  /**
   * 表单提交事件，判断是创建用户还是更新用户，分别调用 create 方法和 update 方法
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { editFormFlag, id } = this.state;

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        if (editFormFlag === 'add') {
          await this.props.dispatch({
            type: 'members/add',
            payload: values,
          });
          this.handleSucceedAdd();
        } else if (editFormFlag === 'update') {
          await this.props.dispatch({
            type: 'members/put',
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
   * 用户增加成功之后的处理方法，将用户插入到表格最前面
   */
  handleSucceedAdd = () => {
    const { tableData } = this.state;

    tableData.unshift(this.props.members.append);

    this.setState({
      tableDataTotal: this.state.tableDataTotal + 1,
      curPageSize: this.state.curPageSize + 1,
      tableData,
    });

    this.handleModalVisible(false);

    message.info(`新增用户成功`);
  };

  /**
   * 用户增加更新之后的处理方法，直接修改用户列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.members.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);

    message.info(`用户信息已更新`);
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'members/fetch',
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
        title: '编号',
        className: 'ant-tableThead',
        dataIndex: 'number',
      },
      {
        title: '昵称',
        className: 'ant-tableThead',
        dataIndex: 'nickname',
      },
      {
        title: '真实名字',
        className: 'ant-tableThead',
        dataIndex: 'name',
      },
      {
        title: '邮箱',
        className: 'ant-tableThead',
        dataIndex: 'email',
      },
      {
        title: '手机',
        className: 'ant-tableThead',
        dataIndex: 'phone',
      },
      {
        title: '密码',
        className: 'ant-tableThead',
        dataIndex: 'password',
      },
      
      {
        title: '性别',
        className: 'ant-tableThead',
        dataIndex: 'sex',
      },
      {
        title: '年龄',
        className: 'ant-tableThead',
        dataIndex: 'age',
      },
      {
        title: '地址',
        className: 'ant-tableThead',
        dataIndex: 'address',
      },
      {
        title: '头像',
        className: 'ant-tableThead',
        dataIndex: 'portrait',
      },
      {
        title: '宣言',
        className: 'ant-tableThead',
        dataIndex: 'personal_statement',
      },
      {
        title: '积分',
        className: 'ant-tableThead',
        dataIndex: 'integral',
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
        title: '最后登录时间',
        className: 'ant-tableThead',
        dataIndex: 'lastest_login_time',
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
    } = this.state;

    return (
      <PageHeaderLayout
        title="用户管理"
        content="用户列表管理"
      >
        <Card>
          <Row gutter={24}>
            <Col span={3}>
              <h4>用户编号：</h4>
            </Col>
            <Col span={4}>
              <Input />
            </Col>
            <Col span={3}>
              <h4>用户昵称：</h4>
            </Col>
            <Col span={4}>
              <Input />
            </Col>
            <Col span={2}>
              <Button icon="search">查询</Button>
            </Col>
            <Col span={4} offset={2}>
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增用户
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
            <FormItem {...formItemLayout} label="编号">
              {getFieldDecorator('number', {
                rules: customRules,
                initialValue: this.state.number,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="昵称">
              {getFieldDecorator('nickname', {
                rules: customRules,
                initialValue: this.state.nickname,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="邮箱">
              {getFieldDecorator('email', {
                rules: customRules,
                initialValue: this.state.email,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="手机">
              {getFieldDecorator('phone', {
                rules: customRules,
                initialValue: this.state.phone,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="性别">
              {getFieldDecorator('sex', {
                rules: customRules,
                initialValue: this.state.sex,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="积分">
              {getFieldDecorator('integral', {
                rules: customRules,
                initialValue: this.state.integral,
              })(<Input />)}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default MembersManage;
