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

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

@connect(({ production, loading, productionSort }) => ({
  production,
  productionSort,
  loading: loading.models.production,
}))

@Form.create()
export class ProductionInfo extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    number: '',
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

    defaultFileList: [],

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
        status: 0,
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
        categoriesObject[categoriesData[i].id] = categoriesData[i].name;
        categoriesArr.push({
          key: categoriesData[i].id,
          value: categoriesData[i].name,
        })
      }
    }

    this.setState({ tableData: content, tableDataTotal: totalElements, categoriesList: categoriesObject, categoriesArr });
  };

  handleRowEditClick = (index, record) => {
    let {
      id = -1,
      number,
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

    const defaultFileList = [];

    if (cover) {
      defaultFileList.push({
        uid: cover,
        picname: `p-${cover}.png`,
        status: 'done',
        url: cover,
      });
    }

    this.setState({
      id,
      modalVisible: true,
      editFormTitle: '编辑信息',
      defaultFileList,
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      number,
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

  handleRowSwitchClick = async (checked, record) => {
    let message = '';

    switch (checked) {
      case false:
      checked = 1*1;
      message = "作品已屏蔽";
        break;
    
      case true:
      checked = 0*1;
      message = "作品正常";
        break;
    
      default:
        break;
    }

    await this.props.dispatch({
      type: 'production/put',
      payload: {
        id: record.id,
        disabled: checked,
      },
    });

    message.success(message);
  }

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'production/delete',
      payload: {
        id,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`《${record.name}》已删除 ☠`);
  };

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
   * 表单提交事件，判断是创建项目还是更新项目，分别调用 create 方法和 update 方法
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { editFormFlag, id } = this.state;

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        if (editFormFlag === 'add') {
          await this.props.dispatch({
            type: 'production/add',
            payload: values,
          });
          this.handleSucceedAdd();
        } else if (editFormFlag === 'update') {
          await this.props.dispatch({
            type: 'production/put',
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

    tableData.unshift(this.props.production.append);

    this.setState({
      tableDataTotal: this.state.tableDataTotal + 1,
      curPageSize: this.state.curPageSize + 1,
      tableData,
    });

    this.handleModalVisible(false);

    message.info(`新增作品成功`);
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
      type: 'production/fetch',
      payload: {
        currentPage: current,
        curPageSize,
        status: 0,
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
        number: searchNumber,
        name: searchName,
        author: searchAuthor,
        sort: searchSort,
        status: 0,
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
      {
        title: '编号',
        className: 'ant-tableThead',
        dataIndex: 'number',
      },
      {
        title: '作品名称',
        className: 'ant-tableThead',
        dataIndex: 'name',
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
        width: 80,
        render: (text) => {
          return <img src={text} style={{width:80}} />
        }
      },
      {
        title: '简介',
        className: 'ant-tableThead',
        dataIndex: 'describe',
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
              <span className="ant-divider" />

              <Switch 
                checkedChildren='正常'
                unCheckedChildren='屏蔽'
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
        title="作品管理"
        content="管理用户和认证师的作品。"
      >
        <Card>
          <Row gutter={24}>
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
            <Col span={4} offset={4}>
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增作品
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
          width={800}
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

            <FormItem {...formItemLayout} label="作品分类">
              {getFieldDecorator('sort', {
                rules: customRules,
                initialValue: this.state.sort,
              })(
                <Select>
                  { categoriesOption }
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="作品上传">
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

            <FormItem {...formItemLayout} label="简介">
              {getFieldDecorator('describe', {
                rules: customRules,
                initialValue: this.state.describe,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="摄影道具">
              {getFieldDecorator('photography_props', {
                rules: customRules,
                initialValue: this.state.photography_props,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="摄影地点">
              {getFieldDecorator('photography_site', {
                rules: customRules,
                initialValue: this.state.photography_site,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="内容">
              {getFieldDecorator('content', {
                rules: customRules,
                initialValue: this.state.content,
              })(<Input />)}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default ProductionInfo;
