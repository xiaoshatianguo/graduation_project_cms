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

@connect(({ production, loading, productionSort }) => ({
  production,
  productionSort,
  loading: loading.models.production,
}))

@Form.create()
export class ProductionChecked extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    // number: '',
    name: '',
    author: '',
    sort: '',
    cover: '',
    describe: '',
    photography_props: '',
    photography_site: '',
    content: '',
    disabled: '',
    status: '',

    categoriesList: {},
    categoriesArr: [],

    searchNumber: '',
    searchName: '',
    searchAuthor: '',
    searchSort: '',

    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'production/fetch',
      payload: {
        currentPage,
        curPageSize,
        status: 1,
      },
    });

    this.props.dispatch({
      type: 'productionSort/fetch',
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.production;
    const { content = [], totalElements } = data;

    // 获取分类对象进行处理、以及处理分类成数组
    const categoriesData = nextProps.productionSort.data.content;
    let categoriesObject = {};
    let categoriesArr =[];
    if(!!categoriesData) {
      for (var i = 0; i < categoriesData.length; i++) {
        categoriesObject[categoriesData[i].number] = categoriesData[i].name;
        categoriesArr.push({
          key: categoriesData[i].number,
          value: categoriesData[i].name,
        })
      }
    }

    this.setState({ tableData: content, tableDataTotal: totalElements, categoriesList: categoriesObject, categoriesArr });
  };

  handleRowEditClick = (index, record) => {
    let {
      id = -1,
      // number,
      name,
      author,
      sort,
      cover,
      describe,
      photography_props,
      photography_site,
      content,
    } = record;

    this.tableCurIndex = index;

    sort += '';

    this.setState({
      id,
      modalVisible: true,
      editFormTitle: '编辑信息',
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      // number,
      name,
      author,
      sort,
      cover,
      describe,
      photography_props,
      photography_site,
      content,
    });
  };

  handleAudit= async (index, record) => {
    let { 
      id = -1,
      // number,
      name,
      author,
      sort,
      cover,
      describe,
      photography_props,
      photography_site,
      content,
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
      name,
      author,
      sort,
      cover,
      describe,
      photography_props,
      photography_site,
      content,
    });
  }

  handleAuditSucceed = async () => {
    let { id=-1 } = this.state;

    await this.props.dispatch({
      type: 'production/put',
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
      type: 'production/put',
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
      editFormTitle: '新增作品',
      defaultFileListObj: {},
    });
    
    this.props.form.resetFields();
  };

  /**
   * 项目增加更新之后的处理方法，直接修改项目列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.production.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);

    message.info(`作品信息已更新`);
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'production/fetch',
      payload: {
        currentPage: current,
        curPageSize,
        status: 1,
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
      searchName= '',
      searchAuthor= '',
      searchSort= '',
    } = this.state;
    
    const { currentPage, curPageSize } = this.state;
    
    this.props.dispatch({
      type: 'production/fetch',
      payload: {
        currentPage,
        curPageSize,
        // number: searchNumber,
        name: searchName,
        author: searchAuthor,
        sort: searchSort,
        status: 1,
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
    let categoriesOption =[];
    
    if(!!this.state.categoriesArr) {
      this.state.categoriesArr.map((item, index)=>{
        categoriesOption.push(<Option key={item.key} value={item.key}>{item.value}</Option>)
      })
    }

    const columns = [
      // {
      //   title: '编号',
      //   className: 'ant-tableThead',
      //   dataIndex: 'number',
      // },
      {
        title: '作品名称',
        className: 'ant-tableThead',
        dataIndex: 'name',
        width: 160,
        fixed: 'left',
      },
      {
        title: '作者',
        className: 'ant-tableThead',
        dataIndex: 'author',
      },
      {
        title: '分类',
        className: 'ant-tableThead',
        dataIndex: 'sort',
        render: (text) => {
          return <span>{ this.state.categoriesList[text] }</span>;
        },
      },
      {
        title: '作品',
        className: 'ant-tableThead',
        dataIndex: 'cover',
        render: (text) => {
          return <img src={text} style={{width:80}} />
        }
      },
      {
        title: '简介',
        className: 'ant-tableThead',
        dataIndex: 'describe',
        render: TextToF,
      },
      {
        title: '摄影道具',
        className: 'ant-tableThead',
        dataIndex: 'photography_props',
      },
      {
        title: '摄影地点',
        className: 'ant-tableThead',
        dataIndex: 'photography_site',
      },
      {
        title: '描述详情',
        className: 'ant-tableThead',
        dataIndex: 'content',
        render: TextToF,
      },
      {
        title: '创建时间',
        className: 'ant-tableThead',
        dataIndex: 'create_time',
        render: (text) => {
          return <span>{ !!text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' }</span>;
        },
      },
      {
        title: '操作',
        className: 'ant-tableThead',
        key: 'action',
        width: 100,
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
        title="作品审核"
        content="审核认证师提交的作品申请。"
      >
        <Card>
          <Row className="lw-top-col" type="flex" align="middle" justify="space-between">
              <Form layout="inline">
                  <FormItem label="作品名称：">
                      <Input
                          name="searchName"
                          placeholder="请输入作品名称"
                          defaultValue={this.state.searchName}
                          onChange={this.handleInputChange}
                      />
                  </FormItem>

                  <FormItem label="作品作者：">
                      <Input
                          name="searchAuthor"
                          placeholder="请输入作品作者"
                          defaultValue={this.state.searchAuthor}
                          onChange={this.handleInputChange}
                      />
                  </FormItem>

                  <FormItem label="作品类别：">
                    <Select
                        allowClear={true}
                        placeholder="选择管理员类别"
                        style={{ width: 150}}
                        onChange={(value) => {
                            this.setState({searchCategories: value});
                        }}
                    >
                      { categoriesOption }
                    </Select>
                  </FormItem>

                  <FormItem>
                      <Button icon="search" type="primary" onClick={this.handleSearchSubmit} htmlType="submit">查询</Button>
                  </FormItem>
              </Form>
          </Row>
          {/* <Row gutter={24}>
            <Col span={3}>
              <h4>作品编号：</h4>
            </Col>
            <Col span={4}>
              <Input 
                name="searchNumber"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col span={3}>
              <h4>作品名称：</h4>
            </Col>
            <Col span={4}>
              <Input 
                name="searchName"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col span={3}>
              <h4>作品作者：</h4>
            </Col>
            <Col span={4}>
              <Input 
                name="searchAuthor"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col span={3}>
              <h4>作品类别：</h4>
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
                { categoriesOption }
              </Select>
            </Col>
            <Col span={2}>
              <Button icon="search" htmlType="submit" onClick={this.handleSearchSubmit}>查询</Button>
            </Col>
          </Row> */}
        </Card>

        <Row>
          <Table
            width={800}
            scroll={{ x: 1660 }}
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
              })(<Input />)}
            </FormItem> */}

            <FormItem {...formItemLayout} label="作品标题">
              {getFieldDecorator('name', {
                rules: customRules,
                initialValue: this.state.name,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="作者">
              {getFieldDecorator('author', {
                rules: customRules,
                initialValue: this.state.author,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="描述">
              {getFieldDecorator('describe', {
                rules: customRules,
                initialValue: this.state.describe,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="内容">
              {getFieldDecorator('content', {
                rules: customRules,
                initialValue: this.state.content,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="分类">
              {getFieldDecorator('sort', {
                rules: customRules,
                initialValue: this.state.sort,
              })(<Input />)}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default ProductionChecked;
