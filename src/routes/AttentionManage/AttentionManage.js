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

@connect(({ article, loading }) => ({
  article,
  loading: loading.models.article,
}))
@Form.create()
export class AttentionManage extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    id: '', // 表格数据
    title: '', // 表格数据
    author: '', // 表格数据--作者
    mainbody: '', // 表格数据--富文本正文
    defaultFileList: [], // 表格数据--展示已经上传的封面
    defaultSelectCover: [], // 表格数据--展示已经上传的精选封面
    articleSearch: '', // 文章搜索标题
    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数

  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'article/fetch',
      payload: {
        currentPage,
        curPageSize,
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.article;
    const { content = [], totalElements } = data;

    this.setState({
      tableData: content,
      tableDataTotal: totalElements,
    });
  };

  handleRowEditClick = (index, record) => {
    const { id = -1, title, author, mainbody, cover, selectCover } = record;

    const defaultFileList = [];
    const defaultSelectCover = [];

    if (cover) {
      defaultFileList.push({
        uid: cover,
        picname: `p-${cover}.png`,
        status: 'done',
        url: cover,
      });
    }

    if (selectCover) {
      defaultSelectCover.push({
        uid: selectCover,
        picname: `p-${selectCover}.png`,
        status: 'done',
        url: selectCover,
      });
    }

    this.setState({
      id,
      modalVisible: true,
      editFormTitle: record.title,
      defaultFileList,
      defaultSelectCover,
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      title,
      author,
      mainbody,
      cover,
      selectCover,
    });
  };

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'article/delete',
      payload: {
        id,
      },
    });

    const { tableData } = this.state;
    tableData.splice(index, 1);

    this.setState({
      tableData,
    });

    message.info(`《${record.title}》已删除 ☠️`);
  };

  handleSetBannerWeight = async (value, recode) => {
    await this.props.dispatch({
      type: 'article/put',
      payload: {
        id: recode.id,
        set_banner: value,
      },
    });

    message.success('知错能改，善莫大焉 🛠 ');
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag,
      editFormFlag: 'add',
      editFormTitle: '新增文章',
      defaultSelectCover: [],
      defaultFileList: [],
    });

    this.props.form.resetFields();
  };

  /**
   * 表单提交事件，判断是创建文章还是更新文章，分别调用 create 方法和 update 方法
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { editFormFlag, id } = this.state;

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        if (editFormFlag === 'add') {
          await this.props.dispatch({
            type: 'article/add',
            payload: values,
          });
          this.handleSucceedAdd();
        } else if (editFormFlag === 'update') {
          await this.props.dispatch({
            type: 'article/put',
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
   * 文章增加成功之后的处理方法，将文章插入到表格最前面
   */
  handleSucceedAdd = () => {
    const { tableData } = this.state;

    tableData.unshift(this.props.article.append);

    this.setState({
      tableDataTotal: this.state.tableDataTotal + 1,
      curPageSize: this.state.curPageSize + 1,
      tableData,
    });

    this.handleModalVisible(false);
  };
  /**
   * 文章增加更新之后的处理方法，直接修改文章列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.article.updete;

    this.setState({ tableData });
    this.handleModalVisible(false);
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
      type: 'article/fetch',
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
        title: '标题',
        className: 'ant-tableThead',
        dataIndex: 'title',
      },
      {
        title: '作者',
        className: 'ant-tableThead',
        dataIndex: 'author',
        width: 100,
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
        title: 'Banner权重',
        className: 'ant-tableThead',
        dataIndex: 'set_banner',
        render: (text, record) => {
          return (
            <InputNumber
              defaultValue={text}
              min={0}
              max={100}
              onChange={value => this.handleSetBannerWeight(value, record)}
            />
          );
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
        title="博客文章"
        content="博客文章用户在博客页面中展示，单篇文章点击可跳转至文章详情。"
      >
        <Card>
          <Row gutter={24}>
            <Col span={2}>
              <h4>标题：</h4>
            </Col>
            <Col span={4}>
              <Input />
            </Col>
            <Col span={8}>
              <Button icon="search">查询</Button>
            </Col>
            <Col span={4} offset={4}>
              <Button type="primary" icon="plus" onClick={() => this.handleModalVisible(true)}>
                新增文章
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
          confirmLoading={loading}
        >
          <Form onSubmit={this.handleSubmit} width={800}>
            <FormItem {...formItemLayout} label="标题">
              {getFieldDecorator('title', {
                rules: customRules,
                initialValue: this.state.title,
              })(<Input placeholder="请输入文章标题" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="作者">
              {getFieldDecorator('author', {
                rules: customRules,
                initialValue: this.state.author,
              })(<Input placeholder="请输入文章作者" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="文章正文">
              {getFieldDecorator('mainbody', {
                rules: customRules,
                initialValue: this.state.mainbody,
              })(
                <TextArea
                  placeholder="请录入 MarkDown 格式的文章正文"
                  autosize={{ minRows: 6, maxRows: 20 }}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="封面">
              {getFieldDecorator('cover', {
                // rules: customRules,
                // initialValue: this.state.cover,
              })(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileList}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'cover')}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label={(<span>精选封面&nbsp;<Tooltip title="若不上传，则默认使用普通案例封面; 上传则优先使用精选封面"><Icon type="info-circle-o" /></Tooltip></span>)}>
              {getFieldDecorator('selectCover', {})(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultSelectCover}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'selectCover')}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

export default AttentionManage;
