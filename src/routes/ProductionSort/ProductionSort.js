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

@connect(({ productionSort, loading }) => ({
  productionSort,
  loading: loading.models.productionSort,
}))

@Form.create()
export class ProductionSort extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    number: '',
    name: '',
    is_show: '',

    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'productionSort/fetch',
      payload: {
        currentPage,
        curPageSize,
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.productionSort;
    const { content = [], totalElements } = data;

    this.setState({ tableData: content, tableDataTotal: totalElements });
  };

  handleRowEditClick = (index, record) => {
    const {
      id = -1,
      number,
      name,
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
    });
  };

  handleRowSwitchClick = async (checked, record) => {
    let message = '';

    switch (checked) {
      case false:
      checked = 1*1;
      message = "隐藏作品类型";
        break;
    
      case true:
      checked = 0*1;
      message = "显示作品类型";
        break;
    
      default:
        break;
    }

    await this.props.dispatch({
      type: 'productionSort/put',
      payload: {
        id: record.id,
        is_show: checked,
      },
    });

    message.success(message);
  }

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'productionSort/delete',
      payload: {
        id,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`《${record.name}》已删除`);
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag,
      editFormFlag: 'add',
      editFormTitle: '新增作品类型',
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
            type: 'productionSort/add',
            payload: values,
          });
          this.handleSucceedAdd();
        } else if (editFormFlag === 'update') {
          await this.props.dispatch({
            type: 'productionSort/put',
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

    tableData.unshift(this.props.productionSort.append);

    this.setState({
      tableDataTotal: this.state.tableDataTotal + 1,
      curPageSize: this.state.curPageSize + 1,
      tableData,
    });

    this.handleModalVisible(false);

    message.info(`新增作品类型成功`);
  };
  /**
   * 项目增加更新之后的处理方法，直接修改项目列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.productionSort.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);

    message.info(`作品类型信息已更新`);
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'productionSort/fetch',
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
    } = this.state;
    
    const { currentPage, curPageSize } = this.state;
    
    this.props.dispatch({
      type: 'productionSort/fetch',
      payload: {
        currentPage,
        curPageSize,
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
      },
      {
        title: '作品分类名称',
        className: 'ant-tableThead',
        dataIndex: 'name',
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
        title: '修改时间',
        className: 'ant-tableThead',
        dataIndex: 'update_time',
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
                checkedChildren='显示'
                unCheckedChildren='隐藏'
                defaultChecked= { record.is_show === 0 }
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
        title="作品分类管理"
        content="管理作品的所有类别。"
      >
        <Card>
          <Row gutter={24}>
            <Col span={2}>
              <h4>作品名称：</h4>
            </Col>
            <Col span={4}>
              <Input />
            </Col>
            <Col span={8}>
              <Button icon="search">查询</Button>
            </Col>
            <Col span={4} offset={4}>
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增作品类型
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

            <FormItem {...formItemLayout} label="作品分类名称">
              {getFieldDecorator('name', {
                rules: customRules,
                initialValue: this.state.name,
              })(<Input />)}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default ProductionSort;
