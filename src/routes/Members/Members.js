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
  Switch,
} from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import UploadImgs from '../../components/UploadImgs/UploadImgs';
import { qiniuDomain } from '../../utils/appConfig';

const FormItem = Form.Item;
const Option = Select.Option;

let sexList = {
  '0': '男',
  '1': '女',
};

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
    disabled: '',
    status: '',

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
      type: 'members/fetch',
      payload: {
        currentPage,
        curPageSize,
        sort: '0',
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
    let { 
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
      integral
    });
  };

  handleRowSwitchClick = async (checked, record) => {
    let message = '';

    switch (checked) {
      case false:
      checked = 1*1;
      message = "用户已禁用";
        break;
    
      case true:
      checked = 0*1;
      message = "用户正常";
        break;
    
      default:
        break;
    }

    await this.props.dispatch({
      type: 'members/put',
      payload: {
        id: record.id,
        disabled: checked,
      },
    });

    message.success(message);
  }

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

    message.info(`${record.number}${record.nickname}已删除 ☠`);
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
        sort: '0',
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
      type: 'members/fetch',
      payload: {
        currentPage,
        curPageSize,
        number: searchNumber,
        nickname: searchNickName,
        sort: '0',
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
      {
        title: '编号',
        className: 'ant-tableThead',
        dataIndex: 'number',
        width: 80,
        fixed: 'left',
      },
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
        width: 200,
      },
      {
        title: '手机',
        className: 'ant-tableThead',
        dataIndex: 'phone',
        width: 120,
      },
      {
        title: '密码',
        className: 'ant-tableThead',
        dataIndex: 'password',
        width: 100,
      },
      
      {
        title: '性别',
        className: 'ant-tableThead',
        dataIndex: 'sex',
        width: 80,
        render: (text) => {
          return <span>{ sexList[text] }</span>;
        },
      },
      {
        title: '年龄',
        className: 'ant-tableThead',
        dataIndex: 'age',
        width: 80,
        render: (text) => {
          return <span>{ text }岁</span>;
        },
      },
      {
        title: '地址',
        className: 'ant-tableThead',
        dataIndex: 'address',
        width: 150,
      },
      {
        title: '头像',
        className: 'ant-tableThead',
        dataIndex: 'portrait',
        width: 80,
        render: (text) => {
          return <Avatar shape="square" src={text} size="large" />;
        },
      },
      {
        title: '宣言',
        className: 'ant-tableThead',
        dataIndex: 'personal_statement',
        width: 200,
      },
      {
        title: '积分',
        className: 'ant-tableThead',
        dataIndex: 'integral',
        width: 80,
      },
      {
        title: '创建时间',
        className: 'ant-tableThead',
        dataIndex: 'create_time',
        width: 160,
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
        },
      },
      {
        title: '最后登录时间',
        className: 'ant-tableThead',
        dataIndex: 'lastest_login_time',
        width: 160,
        render: (text) => {
          return <span>{ !!text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' }</span>;
        },
      },
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
              <Button icon="edit" onClick={() => this.handleRowEditClick(index, record)}>
                编辑
              </Button>
              <span className="ant-divider" />

              <Switch 
                checkedChildren='正常'
                unCheckedChildren='禁用'
                defaultChecked= { record.disabled === 0 }
                onChange={checked => this.handleRowSwitchClick(checked, record)}
              />
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
              <Input 
                name="searchNumber"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col span={3}>
              <h4>用户昵称：</h4>
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
            <Col span={4} offset={2}>
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增用户
              </Button>
            </Col>
          </Row>
        </Card>

        <Row>
          <Table
            width={800}
            scroll={{ x: 1990 }}
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
          width={800}
          onOk={this.handleSubmit}
          onCancel={() => this.handleModalVisible(false)}
        >
          <Form onSubmit={this.handleSubmit} width={800}>
            <FormItem {...formItemLayout} label="编号">
              {getFieldDecorator('number', {
                rules: customRules,
                initialValue: this.state.number,
              })(<Input placeholder="请输入编号" />)}
            </FormItem>

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

export default MembersManage;
