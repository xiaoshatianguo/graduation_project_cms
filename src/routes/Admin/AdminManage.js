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
import { pageableSize } from '../../utils/appConfig';

const FormItem = Form.Item;
const Option = Select.Option;

let sexList = {
  '0': '男',
  '1': '女',
};

let integralList = {
  '0': '超级管理员',
  '1': '普通管理员',
};

let categoriesList = {
  '0': '人物摄影类',
  '1': '动物摄影类',
  '2': '植物摄影类',
};

// 连接model层的state数据，然后通过this.props.state名(namespace)访问model层的state数据
@connect(({ admin, loading }) => ({
  admin,
  loading: loading.models.admin,
}))

@Form.create()
export class AdminManage extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    id: '', // 表格数据
    number: '',
    nick_name: '',
    password: '',
    sex: '',
    integral: '',
    create_time: '',
    lastest_login_time: '',
    manage_categories: '',
    status: '',

    searchCategories: '',
    searchIntegral: '',

    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'admin/fetch',
      payload: {
        currentPage,
        curPageSize,
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.admin;
    const { content = [], totalElements } = data;
    this.setState({
      tableData: content,
      tableDataTotal: totalElements,
    });
  };

  handleRowEditClick = (index, record) => {
    let { id = -1, number, nick_name, password, sex, integral, manage_categories, status } = record;
    this.tableCurIndex = index;

    sex += '';
    integral += '';
    manage_categories += '';

    this.setState({
      id,
      sex,
      integral,
      manage_categories,
      modalVisible: true,
      editFormTitle: '编辑信息',
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      number,
      nick_name,
      password,
      sex,
      integral,
      manage_categories,
    });
  };

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'admin/delete',
      payload: {
        id,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`《${record.number}${record.nick_name}》已删除 ☠️`);
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag,
      editFormFlag: 'add',
      editFormTitle: '新增管理员',
    });

    this.props.form.resetFields();
  };

  /**
   * 表单提交事件，判断是创建管理员还是更新管理员，分别调用 create 方法和 update 方法
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { editFormFlag, id } = this.state;

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        if (editFormFlag === 'add') {
          await this.props.dispatch({
            type: 'admin/add',
            payload: values,
          });
          this.handleSucceedAdd();
        } else if (editFormFlag === 'update') {
          await this.props.dispatch({
            type: 'admin/put',
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
   * 管理员增加成功之后的处理方法，将管理员插入到表格最前面
   */
  handleSucceedAdd = () => {
    const { tableData } = this.state;

    tableData.unshift(this.props.admin.append);

    this.setState({
      tableDataTotal: this.state.tableDataTotal + 1,
      curPageSize: this.state.curPageSize + 1,
      tableData,
    });

    this.handleModalVisible(false);

    message.info(`新增管理员成功`);
  };

  /**
   * 管理员增加更新之后的处理方法，直接修改管理员列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.admin.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);

    message.info(`管理员信息已更新`);
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'admin/fetch',
      payload: {
        currentPage: current,
        curPageSize,
      },
    });

    this.setState({ currentPage: current });
  };

  /**
   * 处理查询按钮点击事件
   */
  handleSearchSubmit = () => {
    let {
      searchIntegral = '',
      searchCategories= '',
    } = this.state;
    
    const { currentPage, curPageSize } = this.state;
    
    this.props.dispatch({
      type: 'admin/fetch',
      payload: {
        currentPage,
        curPageSize,
        integral: searchIntegral,
        manage_categories: searchCategories,
      },
    });
  }

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
        dataIndex: 'nick_name',
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
        render: (text) => {
          return <span>{ sexList[text] }</span>;
        },
      },
      {
        title: '权限',
        className: 'ant-tableThead',
        dataIndex: 'integral',
        render: (text) => {
          return <span>{ integralList[text] }</span>;
        },
      },
      {
        title: '管理类别',
        className: 'ant-tableThead',
        dataIndex: 'manage_categories',
        render: (text) => {
          return <span>{ categoriesList[text] }</span>;
        },
      },
      {
        title: '创建时间',
        className: 'ant-tableThead',
        dataIndex: 'create_time',
        width: 160,
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD HH:MM:SS')}</span>;
        },
      },
      {
        title: '最后登录时间',
        className: 'ant-tableThead',
        dataIndex: 'lastest_login_time',
        width: 160,
        render: (text) => {
          return <span>{ !!text ? moment(text).format('YYYY-MM-DD HH:MM:SS') : '-'}</span>;
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
        title="管理员"
        content="分配不同类别的管理员"
      >
        <Card>
          <Row gutter={24}>
            <Col span={3}>
              <h4>管理员权限：</h4>
            </Col>
            <Col span={4}>
              <Select
                  allowClear={true}
                  placeholder="选择管理员权限"
                  style={{ width: 150}}
                  onChange={(value) => {
                      this.setState({searchIntegral: value});
                  }}
              >
                <Option value="0">超级管理员</Option>
                <Option value="1">普通管理员</Option>
              </Select>
            </Col>
            <Col span={3}>
              <h4>管理员类别：</h4>
            </Col>
            <Col span={4}>
              <Select
                  allowClear={true}
                  placeholder="选择管理员类别"
                  style={{ width: 150}}
                  onChange={(value) => {
                      this.setState({searchCategories: value});
                  }}
              >
                <Option value="0">人物摄影类</Option>
                <Option value="1">动物摄影类</Option>
                <Option value="2">植物摄影类</Option>
              </Select>
            </Col>
            <Col span={2}>
              <Button icon="search" htmlType="submit" onClick={this.handleSearchSubmit}>查询</Button>
            </Col>
            <Col span={4} offset={2}>
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增管理员
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
              {getFieldDecorator('nick_name', {
                rules: customRules,
                initialValue: this.state.nick_name,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="密码">
              {getFieldDecorator('password', {
                rules: customRules,
                initialValue: this.state.post,
              })(<Input />)}
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

            <FormItem {...formItemLayout} label="权限">
              {getFieldDecorator('integral', {
                rules: customRules,
                initialValue: this.state.integral,
              })(
                <Select>
                  <Option value="0">超级管理员</Option>
                  <Option value="1">普通管理员</Option>
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="管理类别">
              {getFieldDecorator('manage_categories', {
                rules: customRules,
                initialValue: this.state.manage_categories,
              })(
                <Select>
                  <Option value="0">人物摄影类</Option>
                  <Option value="1">动物摄影类</Option>
                  <Option value="2">植物摄影类</Option>
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default AdminManage;
