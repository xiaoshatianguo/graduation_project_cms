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

@connect(({ admin }) => ({
  admin,
}))

@Form.create()
export class AdminManage extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    uuid: '', // 表格数据
    number: '',
    nick_name: '',
    password: '',
    sex: '',
    integral: '',
    create_time: '',
    lastest_login_time: '',
    manage_categories: '',
    status: '',

    titleSearch: '', // 员工搜索标题
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

  // componentWillReceiveProps = (nextProps) => {
  //   const { data } = nextProps.admin;
  //   const { content = [], totalElements } = data;

  //   this.setState({
  //     tableData: content,
  //     tableDataTotal: totalElements,
  //   });
  // };

  handleRowEditClick = (index, record) => {
    const { uuid = -1, nick_name, password, sex, integral, manage_categories, status } = record;
    this.tableCurIndex = index;

    const defaultFileList = [];

    // if (photo) {
    //   defaultFileList.push({
    //     uid: photo,
    //     picname: `p-${photo}.png`,
    //     status: 'done',
    //     url: photo,
    //   });
    // }

    this.setState({
      uuid,
      modalVisible: true,
      editFormTitle: record.title,
      defaultFileList,
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      nick_name,
      password,
      sex,
      integral,
      manage_categories,
      status
    });
  };

  handleRowDeleteClick = async (uuid, index, record) => {
    await this.props.dispatch({
      type: 'admin/delete',
      payload: {
        uuid,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`《${record.number}${record.nick_name}》已删除 ☠️`);
  };

  // handleSetBannerWeight = async (value, recode) => {
  //   await this.props.dispatch({
  //     type: 'admin/put',
  //     payload: {
  //       id: recode.id,
  //       weight: value,
  //     },
  //   });

  //   message.success('知错能改，善莫大焉 🛠 ');
  // };

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
   * 表单提交事件，判断是创建管理员还是更新管理员，分别调用 create 方法和 update 方法
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { editFormFlag, uuid } = this.state;

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
              uuid,
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
  };
  /**
   * 管理员增加更新之后的处理方法，直接修改管理员列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.admin.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);
  };

  /**
   * 处理图片上传组件成功上传之后返回的数据
   *
   * @param  {object} [fileList]       文件数据对象数组
   * @param  {string} tag     图片上传组件对应的表单字段
   */
  // handleUploadChange = (fileList, tag) => {
  //   const valueObj = {};

  //   if (fileList.length > 0) {
  //     const imageURL = `${qiniuDomain}/${fileList[0].response.key}`;
  //     valueObj[tag] = imageURL;
  //     this.props.form.setFieldsValue(valueObj);
  //   }
  // };

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
      },
      {
        title: '权限',
        className: 'ant-tableThead',
        dataIndex: 'integral',
      },
      {
        title: '管理类别',
        className: 'ant-tableThead',
        dataIndex: 'manage_categories',
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
        dataIndex: 'Lastest_login_time',
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
        title="管理员"
        content="分配不同类别的管理员"
      >
        <Card>
          <Row gutter={24}>
            <Col span={3}>
              <h4>管理员编号：</h4>
            </Col>
            <Col span={4}>
              <Input />
            </Col>
            <Col span={3}>
              <h4>管理员昵称：</h4>
            </Col>
            <Col span={4}>
              <Input />
            </Col>
            <Col span={2}>
              <Button icon="search">查询</Button>
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
            rowKey={record => record.uuid || 0}
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
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="权限">
              {getFieldDecorator('integral', {
                rules: customRules,
                initialValue: this.state.integral,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="管理类别">
              {getFieldDecorator('manage_categories', {
                rules: customRules,
                initialValue: this.state.manage_categories,
              })(<Input />)}
            </FormItem>

            {/* <FormItem {...formItemLayout} label="部门">
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
            </FormItem> */}

            {/* <FormItem {...formItemLayout} label="照片">
              {getFieldDecorator('photo', { rules: customRules })(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileList}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'photo')}
                />
              )}
            </FormItem> */}
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default AdminManage;
