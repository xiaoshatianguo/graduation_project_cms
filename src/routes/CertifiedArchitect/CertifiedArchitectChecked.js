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
  InputNumber,
  Modal,
  Form,
  Avatar,
  Select,
  message,
  Tooltip,
  Icon,
  Switch,
} from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import UploadImgs from '../../components/UploadImgs/UploadImgs';
import { qiniuDomain } from '../../utils/appConfig';

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

let sexList = {
  '0': '男',
  '1': '女',
};

@connect(({ certifiedArchitect, loading }) => ({
  certifiedArchitect,
  loading: loading.models.certifiedArchitect,
}))

@Form.create()
export class CertifiedArchitectChecked extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    // number: '',
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
    disabled: '',
    status: '',
    sort: '',

    searchNumber: '',
    searchNickName: '',

    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'certifiedArchitect/fetch',
      payload: {
        currentPage,
        curPageSize,
        status: 1,
        sort: 2
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.certifiedArchitect;
    const { content = [], totalElements } = data;

    this.setState({ tableData: content, tableDataTotal: totalElements });
  };

  handleRowEditClick = (index, record) => {
    let {
      id = -1,
      // number,
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
    } = record;

    this.tableCurIndex = index;

    sex += '';

    this.setState({
      id,
      modalVisible: true,
      editFormTitle: '编辑信息',
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      // number,
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
    });
  };

  handleAudit= async (index, record) => {
    let { 
      id = -1,
      // number,
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
    } = record;
    this.tableCurIndex = index;

    this.setState({
      id,
      modalVisible: true,
      editFormTitle: '审核认证师信息',
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      // number,
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
    });
  }

  handleAuditSucceed = async () => {
    let { id=-1 } = this.state;

    await this.props.dispatch({
      type: 'certifiedArchitect/put',
      payload: {
        id,
        status: 0,
      },
    });

    message.success("审核通过");

    this.handleModalVisible(false);

    let pagination={
      current: this.state.currentPage,
      pageSize: this.state.curPageSize,
      total: this.state.tableDataTotal,
    };

    this.handleTableChange(pagination);
  }

  handleAuditFailure = async () => {
    let { id=-1 } = this.state;

    await this.props.dispatch({
      type: 'certifiedArchitect/put',
      payload: {
        id,
        status: 1,
      },
    });

    message.success("审核不通过");

    this.handleModalVisible(false);
    
    let pagination={
      current: this.state.currentPage,
      pageSize: this.state.curPageSize,
      total: this.state.tableDataTotal,
    };

    this.handleTableChange(pagination);
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag,
      editFormFlag: 'add',
      editFormTitle: '新增认证师',
      defaultFileListObj: {},
    });
    
    this.props.form.resetFields();
  };

  /**
   * 项目增加更新之后的处理方法，直接修改项目列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.certifiedArchitect.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);

    message.info(`认证师信息已更新`);
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'certifiedArchitect/fetch',
      payload: {
        currentPage: current,
        curPageSize,
        status: 1,
        sort: 2
      },
    });

    this.setState({ currentPage: current });
  };

   /**
   * 处理查询按钮点击事件
   */
  handleSearchSubmit = () => {
    let {
      searchNumber= '',
      searchNickName= '',
    } = this.state;
    
    const { currentPage, curPageSize } = this.state;
    
    this.props.dispatch({
      type: 'certifiedArchitect/fetch',
      payload: {
        currentPage,
        curPageSize,
        // number: searchNumber,
        name: searchNickName,
        status: 1,
        sort: 2
      },
    });
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
        [name]: value
    });
  }

  render() {
    const columns = [
      // {
      //   title: '编号',
      //   className: 'ant-tableThead',
      //   dataIndex: 'number',
      //   width: 80,
      //   fixed: 'left',
      // },
      {
        title: '昵称',
        className: 'ant-tableThead',
        dataIndex: 'nickname',
        width: 100,
        fixed: 'left',
      },
      {
        title: '真实名字',
        className: 'ant-tableThead',
        dataIndex: 'name',
        width: 100,
        fixed: 'left',
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
      // {
      //   title: '密码',
      //   className: 'ant-tableThead',
      //   dataIndex: 'password',
      //   width: 100,
      // },
      
      {
        title: '性别',
        className: 'ant-tableThead',
        dataIndex: 'sex',
        render: (text) => {
          return <span>{ sexList[text] }</span>;
        },
      },
      {
        title: '年龄',
        className: 'ant-tableThead',
        dataIndex: 'age',
        render: (text) => {
          return <span>{ text }岁</span>;
        },
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
        render: (text) => {
          return <Avatar shape="square" src={text} size="large" />;
        },
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
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
        },
      },
      // {
      //   title: '最后登录时间',
      //   className: 'ant-tableThead',
      //   dataIndex: 'lastest_login_time',
      //   width: 160,
      //   render: (text) => {
      //     return <span>{ !!text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' }</span>;
      //   },
      // },
      {
        title: '操作',
        className: 'ant-tableThead',
        key: 'action',
        width: 300,
        fixed: 'right',
        render: (text, record, index) => {
          const { id = -1 } = record;

          return (
            <span>
              <Button icon="check-circle" onClick={() => this.handleAudit(index, record)}>
                审核
              </Button>
            </span>
          );
        },
      },
    ];
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
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
    const { modalVisible, editFormTitle, currentPage, curPageSize, tableDataTotal } = this.state;
    return (
      <PageHeaderLayout
        title="认证师审核"
        content="审核认证师提交的认证师申请。"
      >
        <Card>
          <Row className="lw-top-col" type="flex" align="middle" justify="space-between">
            <Form layout="inline">
              <FormItem label="认证师昵称：">
                  <Input
                      name="searchNickName"
                      placeholder="请输入认证师昵称"
                      defaultValue={this.state.searchNickName}
                      onChange={this.handleInputChange}
                  />
              </FormItem>

              <FormItem>
                  <Button icon="search" type="primary" onClick={this.handleSearchSubmit} htmlType="submit">查询</Button>
              </FormItem>
            </Form>
          </Row>
          {/* <Row gutter={24}>
            <Col span={3}>
              <h4>认证师编号：</h4>
            </Col>
            <Col span={4}>
              <Input 
                name="searchNumber"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col span={3}>
              <h4>认证师昵称：</h4>
            </Col>
            <Col span={4}>
              <Input 
                name="searchNickName"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col span={2}>
              <Button icon="search" htmlType="submit" onClick={this.handleSearchSubmit}>查询</Button>
            </Col>
          </Row> */}
        </Card>

        <Row>
          <Table
            width={800}
            scroll={{ x: 1930 }}
            columns={columns}
            rowKey={record => record.id || 0}
            dataSource={this.state.tableData}
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: curPageSize,
              total: tableDataTotal,
            }}
            style={{'backgroundColor':'#fff'}}
            onChange={this.handleTableChange}
          />
        </Row>

        <Modal
          title={editFormTitle}
          visible={modalVisible}
          width={800}
          onOk={this.handleAuditSucceed}
          onCancel={() => this.handleModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => this.handleModalVisible(false)}>取消</Button>,
            <Button key="failure" type="danger" onClick={this.handleAuditFailure}>审核不通过</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleAuditSucceed}>
              审核通过
            </Button>,
          ]}
        >
          <Form onSubmit={this.handleSubmit} width={800}>
            {/* <FormItem {...formItemLayout} label="编号">
              {getFieldDecorator('number', {
                rules: customRules,
                initialValue: this.state.number,
              })(<Input placeholder="请输入编号" />)}
            </FormItem> */}

            <FormItem {...formItemLayout} label="昵称">
              {getFieldDecorator('nickname', {
                rules: customRules,
                initialValue: this.state.nickname,
              })(<Input placeholder="请输入昵称" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="真实姓名">
              {getFieldDecorator('name', {
                rules: customRules,
                initialValue: this.state.name,
              })(<Input placeholder="请输入真实姓名" />)}
            </FormItem>
            
            <FormItem {...formItemLayout} label="邮箱">
              {getFieldDecorator('email', {
                rules: customRules,
                initialValue: this.state.email,
              })(<Input placeholder="请输入邮箱" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="手机">
              {getFieldDecorator('phone', {
                rules: customRules,
                initialValue: this.state.phone,
              })(<Input placeholder="请输入手机" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="性别">
              {getFieldDecorator('sex', {
                rules: customRules,
                initialValue: this.state.sex,
              })(
                <Select>
                  <Option value="0">男</Option>
                  <Option value="1">女</Option>
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="年龄">
              {getFieldDecorator('age', {
                rules: customRules,
                initialValue: this.state.age,
              })(<Input placeholder="请输入年龄" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="地址">
              {getFieldDecorator('address', {
                rules: customRules,
                initialValue: this.state.address,
              })(<Input placeholder="请输入地址" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="密码">
              {getFieldDecorator('password', {
                rules: customRules,
                initialValue: this.state.password,
              })(<Input placeholder="请输入密码" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="积分">
              {getFieldDecorator('integral', {
                rules: customRules,
                initialValue: this.state.integral,
              })(<Input placeholder="请输入积分" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="头像">
              {getFieldDecorator('portrait', {
                rules: customRules,
                initialValue: this.state.portrait,
              })(<Input placeholder="请输入头像" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="个人宣言">
              {getFieldDecorator('personal_statement', {
                rules: customRules,
                initialValue: this.state.personal_statement,
              })(<Input placeholder="请输入个人宣言" />)}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default CertifiedArchitectChecked;
