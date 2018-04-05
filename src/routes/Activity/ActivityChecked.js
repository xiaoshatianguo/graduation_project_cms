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
  Select,
  message,
  Tooltip,
  Icon,
} from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import UploadImgs from '../../components/UploadImgs/UploadImgs';
import { qiniuDomain } from '../../utils/appConfig';

const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ activity, loading }) => ({
  activity,
  loading: loading.models.activity,
}))
@Form.create()
export class ActivityChecked extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    number: '',
    name: '',
    initiator: '',
    sort: '',
    topic: '',
    content: '',
    start_time: '',
    end_time: '',
    status: '',
    auditor: '',

    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'activity/fetch',
      payload: {
        currentPage,
        curPageSize,
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.activity;
    const { content = [], totalElements } = data;

    this.setState({ tableData: content, tableDataTotal: totalElements });
  };

  handleRowEditClick = (index, record) => {
    const {
      id = -1,
      number,
      name,
      initiator,
      sort,
      topic,
      content,
      start_time,
      end_time,
      status,
      auditor,
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
      name,
      initiator,
      sort,
      topic,
      content,
      start_time,
      end_time,
    });
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag,
      editFormFlag: 'add',
      editFormTitle: '新增活动',
      defaultFileListObj: {},
    });
    
    this.props.form.resetFields();
  };

  /**
   * 表单提交事件，判断是创建项目还是更新项目，分别调用 create 方法和 update 方法
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { editFormFlag, id } = this.state;

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        if (editFormFlag === 'add') {
          await this.props.dispatch({
            type: 'activity/add',
            payload: values,
          });
          this.handleSucceedAdd();
        } else if (editFormFlag === 'update') {
          await this.props.dispatch({
            type: 'activity/put',
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
   * 项目增加更新之后的处理方法，直接修改项目列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.activity.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);

    message.info(`活动信息已更新`);
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'activity/fetch',
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
        title: '活动名称',
        className: 'ant-tableThead',
        dataIndex: 'name',
      },
      {
        title: '发起者',
        className: 'ant-tableThead',
        dataIndex: 'initiator',
      },
      {
        title: '类别',
        className: 'ant-tableThead',
        dataIndex: 'sort',
      },
      {
        title: '主题',
        className: 'ant-tableThead',
        dataIndex: 'topic',
      },
      {
        title: '开始时间',
        className: 'ant-tableThead',
        dataIndex: 'start_time',
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD')}</span>;
        },
      },
      {
        title: '结束时间',
        className: 'ant-tableThead',
        dataIndex: 'end_time',
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD')}</span>;
        },
      },
      {
        title: '创建时间',
        className: 'ant-tableThead',
        dataIndex: 'create_time',
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
        title="活动审核"
        content="审核认证师提交的活动申请。"
      >
        <Card>
          <Row gutter={24}>
            <Col span={2}>
              <h4>活动名称：</h4>
            </Col>
            <Col span={4}>
              <Input />
            </Col>
            <Col span={8}>
              <Button icon="search">查询</Button>
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
          width={800}
          onOk={this.handleSubmit}
          onCancel={() => this.handleModalVisible(false)}
        >
          <Form onSubmit={this.handleSubmit} width={800}>
            <FormItem {...formItemLayout} label="活动编号">
              {getFieldDecorator('number', {
                rules: customRules,
                initialValue: this.state.number,
              })(<Input placeholder="请输入活动编号" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="活动名称">
              {getFieldDecorator('name', {
                rules: customRules,
                initialValue: this.state.name,
              })(<Input placeholder="请输入活动名称" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="发起者">
              {getFieldDecorator('initiator', {
                rules: customRules,
                initialValue: this.state.initiator,
              })(<Input placeholder="请输入活动发起者" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="类别">
              {getFieldDecorator('sort', {
                rules: customRules,
                initialValue: this.state.sort,
              })(<Input placeholder="请输入活动类别" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="主题">
              {getFieldDecorator('topic', {
                rules: customRules,
                initialValue: this.state.topic,
              })(<Input placeholder="请输入活动主题" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="活动详情正文">
              {getFieldDecorator('content', {
                rules: customRules,
                initialValue: this.state.content,
              })(
                <TextArea
                  placeholder="请录入 MarkDown 格式的活动详情正文"
                  autosize={{ minRows: 6, maxRows: 20 }}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default ActivityChecked;
