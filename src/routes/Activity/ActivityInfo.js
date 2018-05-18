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
  DatePicker,
  Modal,
  Form,
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
import { TextToF } from '../../utils/utils';

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@connect(({ activity, loading }) => ({
  activity,
  // productionSort,
  loading: loading.models.activity,
}))

@Form.create()
export class ActivityInfo extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    // number: '',
    name: '',
    initiator: '',
    sort: '',
    topic: '',
    describe: '',
    content: '',
    rule: '',
    cover: '',
    banner: '',
    start_time: '',
    end_time: '',
    status: '',
    auditor: '',
    disabled: '',

    searchInitiator: '',
    searchName: '',
    searchSort: '',

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
        status: '0',
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.activity;
    const { content = [], totalElements } = data;

    this.setState({ tableData: content, tableDataTotal: totalElements,});
  };

  handleRowEditClick = (index, record) => {
    let {
      id = -1,
      name,
      initiator,
      topic,
      describe,
      content,
      rule,
      cover,
      banner,
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
      name,
      initiator,
      topic,
      describe,
      content,
      rule,
      cover,
      banner,
      start_time,
      end_time,
    });
  };

  handleRowSwitchClick = async (checked, record) => {
    let message = '';

    switch (checked) {
      case false:
      checked = 1*1;
      message = "活动已禁用";
        break;
    
      case true:
      checked = 0*1;
      message = "允许活动";
        break;
    
      default:
        break;
    }

    await this.props.dispatch({
      type: 'activity/put',
      payload: {
        id: record.id,
        disabled: checked,
      },
    });

    message.success(message);
  }

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'activity/delete',
      payload: {
        id,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`${record.name} 已删除`);
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
      const rangeTimeValue = values['range-time-picker'];

      values.start_time = rangeTimeValue[0].format('x');
      values.end_time = rangeTimeValue[1].format('x');

      delete values['range-time-picker'];

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
   * 项目增加成功之后的处理方法，将项目插入到表格最前面
   */
  handleSucceedAdd = () => {
    const { tableData } = this.state;

    tableData.unshift(this.props.activity.append);

    this.setState({
      tableDataTotal: this.state.tableDataTotal + 1,
      curPageSize: this.state.curPageSize + 1,
      tableData,
    });

    this.handleModalVisible(false);

    message.info(`新增活动成功`);
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
      type: 'activity/fetch',
      payload: {
        currentPage: current,
        curPageSize,
        status: '0',
      },
    });

    this.setState({ currentPage: current });
  };

  /**
   * 处理查询按钮点击事件
   */
  handleSearchSubmit = () => {
    let {
      searchInitiator = '',
      searchName = '',
      searchSort = '',
    } = this.state;
    
    const { currentPage, curPageSize } = this.state;
    
    this.props.dispatch({
      type: 'activity/fetch',
      payload: {
        currentPage,
        curPageSize,
        initiator: searchInitiator,
        name: searchName,
        status: '0',
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

  disabledDate = (current) => {
    return current && current < moment().endOf('day');
  }

  render() {
    const columns = [
      // {
      //   title: '发起者',
      //   className: 'ant-tableThead',
      //   dataIndex: 'initiator',
      //   width: 100,
      //   fixed: 'left',
      // },
      {
        title: '活动标题',
        className: 'ant-tableThead',
        dataIndex: 'name',
        fixed: 'left',
      },
      {
        title: '活动主题',
        className: 'ant-tableThead',
        dataIndex: 'topic',
      },
      {
        title: '活动封面',
        className: 'ant-tableThead',
        dataIndex: 'cover',
        render: (text) => {
          return <img src={text} style={{width:80}} />
        }
      },
      {
        title: '活动banner',
        className: 'ant-tableThead',
        dataIndex: 'banner',
        render: (text) => {
          return <img src={text} style={{width:80}} />
        }
      },
      {
        title: '活动简介',
        className: 'ant-tableThead',
        dataIndex: 'describe',
        render: TextToF
      },
      {
        title: '活动内容',
        className: 'ant-tableThead',
        dataIndex: 'content',
        render: TextToF
      },
      {
        title: '活动规则',
        className: 'ant-tableThead',
        dataIndex: 'rule',
        render: TextToF
      },
      {
        title: '开始时间',
        className: 'ant-tableThead',
        dataIndex: 'start_time',
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
        },
      },
      {
        title: '结束时间',
        className: 'ant-tableThead',
        dataIndex: 'end_time',
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
        },
      },
      {
        title: '创建时间',
        className: 'ant-tableThead',
        dataIndex: 'create_time',
        render: (text) => {
          return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
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

              <Popconfirm
                title="确定要删除吗？"
                placement="topRight"
                onConfirm={() => this.handleRowDeleteClick(id, index, record)}
              >
                <Button type="danger" icon="delete">
                  删除
                </Button>
              </Popconfirm>
              <span className="ant-divider" />

              <Switch 
                checkedChildren='允许'
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
        title="活动管理"
        content="管理已经通过审核的活动信息。"
      >
        <Card>
          <Row className="lw-top-col" type="flex" align="middle" justify="space-between">
            <Form layout="inline">
              {/* <FormItem label="活动发起人：">
                  <Input
                      name="searchInitiator"
                      placeholder="请输入活动发起人"
                      defaultValue={this.state.searchInitiator}
                      onChange={this.handleInputChange}
                  />
              </FormItem> */}

              <FormItem label="活动标题：">
                  <Input
                      name="searchName"
                      placeholder="请输入活动标题"
                      defaultValue={this.state.searchName}
                      onChange={this.handleInputChange}
                  />
              </FormItem>

              <FormItem>
                  <Button icon="search" type="primary" onClick={this.handleSearchSubmit} htmlType="submit">查询</Button>
              </FormItem>

              <FormItem>
                <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                  新增官方活动
                </Button>
              </FormItem>
            </Form>
          </Row>
          {/* <Row gutter={24}>
            <Col span={3}>
              <h4>活动发起人：</h4>
            </Col>
            <Col span={4}>
              <Input 
                name="searchInitiator"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col span={3}>
              <h4>活动名称：</h4>
            </Col>
            <Col span={4}>
              <Input 
                name="searchName"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col span={3}>
              <h4>活动类别：</h4>
            </Col>
            <Col span={4}>
              <Select
                  allowClear={true}
                  placeholder="选择活动类别"
                  style={{ width: 150}}
                  onChange={(value) => {
                      this.setState({searchSort: value});
                  }}
              >
                { categoriesOption }
              </Select>
            </Col>
            <Col span={2}>
              <Button icon="search" htmlType="submit" onClick={this.handleSearchSubmit}>查询</Button>
            </Col>
            <Col span={4} offset={4}>
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增官方活动
              </Button>
            </Col>
          </Row> */}
        </Card>

        <Row>
          <Table
            width={800}
            scroll={{ x: 2480 }}
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
          onOk={this.handleSubmit}
          onCancel={() => this.handleModalVisible(false)}
        >
          <Form onSubmit={this.handleSubmit} width={800}>

            <FormItem {...formItemLayout} label="活动标题">
              {getFieldDecorator('name', {
                rules: customRules,
                initialValue: this.state.name,
              })(<Input placeholder="请输入活动标题" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="主题">
              {getFieldDecorator('topic', {
                rules: customRules,
                initialValue: this.state.topic,
              })(<Input placeholder="请输入活动主题" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="封面">
              {getFieldDecorator('cover', {
                rules: customRules,
              })(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileList}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'cover')}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="banner">
              {getFieldDecorator('banner', {
                rules: customRules,
              })(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileList}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'banner')}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="活动简介">
              {getFieldDecorator('describe', {
                rules: customRules,
                initialValue: this.state.describe,
              })(
                <TextArea
                  placeholder="请录入活动简介"
                  autosize={{ minRows: 6, maxRows: 20 }}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="活动内容">
              {getFieldDecorator('content', {
                rules: customRules,
                initialValue: this.state.content,
              })(
                <TextArea
                  placeholder="请录入活动内容"
                  autosize={{ minRows: 6, maxRows: 20 }}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="活动规则">
              {getFieldDecorator('rule', {
                rules: customRules,
                initialValue: this.state.rule,
              })(
                <TextArea
                  placeholder="请录入活动规则"
                  autosize={{ minRows: 6, maxRows: 20 }}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="活动时间">
              {getFieldDecorator('range-time-picker', {
                rules: customRules,
              })(
                <RangePicker 
                  disabledDate={this.disabledDate}
                  showTime={{
                    hideDisabledOptions: true,
                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  }}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default ActivityInfo;
