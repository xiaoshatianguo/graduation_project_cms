import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Button, Table, Popconfirm, Form, message, Switch } from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

@connect(({ formManage, loading }) => ({
  formManage,
  loading: loading.models.formManage,
}))
@Form.create()
export class Message extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    id: '', // 表格数据
    user_id: '',
    content: '',
    creat_time: '',
    status: '',

    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'formManage/fetch',
      payload: {
        currentPage,
        curPageSize,
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.formManage;
    const { content = [], totalElements } = data;

    this.setState({ tableData: content, tableDataTotal: totalElements });
  };

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'formManage/delete',
      payload: {
        id,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`${record.name} 已删除 ☠️`);
  };

  handleSetStatus = async (checked, record) => {
    let message = '';

    switch (checked) {
      case true:
        checked = 1 * 1;
        message = '该客户标记为已联系 ☎';
        break;

      case false:
        checked = 0 * 1;
        message = '该客户标记为未联系 ≯(๑° . °๑)≮';
        break;

      default:
        break;
    }

    await this.props.dispatch({
      type: 'formManage/put',
      payload: {
        id: record.id,
        status: checked,
      },
    });

    message.success(message);
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'formManage/fetch',
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
        title: '姓名',
        className: 'ant-tableThead',
        dataIndex: 'name',
        width: 100,
      },
      {
        title: '联系方式',
        className: 'ant-tableThead',
        dataIndex: 'phone',
        width: 150,
      },
      {
        title: '公司名称',
        className: 'ant-tableThead',
        dataIndex: 'company',
        width: 150,
      },
      {
        title: '联系邮箱',
        className: 'ant-tableThead',
        dataIndex: 'email',
        width: 200,
      },
      {
        title: '问题描述',
        className: 'ant-tableThead',
        dataIndex: 'info',
        width: 300,
      },
      {
        title: '参考作品',
        className: 'ant-tableThead',
        dataIndex: 'reference',
        width: 300,
      },
      {
        title: '创建时间',
        className: 'ant-tableThead',
        dataIndex: 'create_time',
        width: 200,
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
              <Switch
                checkedChildren="已联系"
                unCheckedChildren="未联系"
                defaultChecked={record.status === 1}
                onChange={checked => this.handleSetStatus(checked, record)}
              />

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
        sm: { span: 18 },
        md: { span: 16 },
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
      <PageHeaderLayout title="表单管理" content="表单咨询页面所填写的表单提交内容的管理。">
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
      </PageHeaderLayout>
    );
  }
}

export default Message;
