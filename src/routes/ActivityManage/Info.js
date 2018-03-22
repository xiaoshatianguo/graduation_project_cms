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
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import UploadImgs from '../../components/UploadImgs/UploadImgs';
import CaseCommentModal from './CaseCommentModal';
import { qiniuDomain } from '../../utils/appConfig';

const FormItem = Form.Item;
const { TextArea } = Input;
const fileListKeys = ['cover', 'mobile_cover', 'icon', 'banner', 'mobile_banner', 'qrcode'];

@connect(({ projectCase, loading }) => ({
  projectCase,
  loading: loading.models.projectCase,
}))
@Form.create()
export class Info extends Component {
  state = {
    tableData: [],
    modalVisible: false,
    editFormTitle: '',

    id: '', // 表格数据
    title: '',
    weight: '',
    cover: '',
    mobile_cover: '',
    icon: '',
    describe: '',
    banner: '',
    mobile_banner: '',
    case_type: '',
    system_platform: '',
    solution: '',
    qrcode: '',
    mainbody: '',

    articleSearch: '', // 项目搜索标题
    editFormFlag: '', // 信息框的标记，add--添加，update--更新
    tableCurIndex: '', // 当前编辑的行数
    currentPage: 1, // 当前页数
    curPageSize: 10, // 当前页面的条数
    defaultFileListObj: {}, // 图片预览对象

    commentModalVisible: false, // 评论编辑弹窗
    commentModalRecord: {}, //  当前编辑评论对应的行记录
    commentModalComment: [], // 当前编辑的评论列表
  };

  componentDidMount = () => {
    const { currentPage, curPageSize } = this.state;

    this.props.dispatch({
      type: 'projectCase/fetch',
      payload: {
        currentPage,
        curPageSize,
      },
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const { data } = nextProps.projectCase;
    const { content = [], totalElements } = data;

    this.setState({ tableData: content, tableDataTotal: totalElements });
  };

  handleRowEditClick = (index, record) => {
    const {
      id = -1,
      title,
      weight,
      describe,
      case_type,
      system_platform,
      solution,
      mainbody,
      cover,
      mobile_cover,
      icon,
      banner,
      mobile_banner,
      qrcode,
    } = record;

    this.tableCurIndex = index;
    this.handleDefaultFileListObj({
      cover,
      mobile_cover,
      icon,
      banner,
      mobile_banner,
      qrcode,
    });

    this.setState({
      id,
      modalVisible: true,
      editFormTitle: record.title,
      editFormFlag: 'update',
      tableCurIndex: index,
    });

    this.props.form.setFieldsValue({
      title,
      weight,
      describe,
      case_type,
      system_platform,
      solution,
      mainbody,
      cover,
      mobile_cover,
      icon,
      banner,
      mobile_banner,
      qrcode,
    });
  };

  /**
   * 将图片链接封装成对象，方便组件中获取
   * @param  {string[]} fileList    需要进行处理的图片链接地址数组
   */
  handleDefaultFileListObj = (recordObj) => {
    const defaultFileListObj = {};

    fileListKeys.forEach((item, index) => {
      defaultFileListObj[item] = [
        {
          uid: recordObj[item] || index,
          picname: `p-${recordObj[item] || '请添加图片'}.png`,
          status: 'done',
          url: recordObj[item] || 'http://oudfgqwcq.bkt.clouddn.com/lyctea/1516351046468.jpg',
        },
      ];
    });

    this.setState({ defaultFileListObj });
  };

  handleRowDeleteClick = async (id, index, record) => {
    await this.props.dispatch({
      type: 'projectCase/delete',
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
      type: 'projectCase/put',
      payload: {
        id: recode.id,
        weight: value,
      },
    });

    message.success('知错能改，善莫大焉 🛠 ');
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag,
      editFormFlag: 'add',
      editFormTitle: '新增项目',
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
            type: 'projectCase/add',
            payload: values,
          });
          this.handleSucceedAdd();
        } else if (editFormFlag === 'update') {
          await this.props.dispatch({
            type: 'projectCase/put',
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

    tableData.unshift(this.props.projectCase.append);

    this.setState({
      tableDataTotal: this.state.tableDataTotal + 1,
      curPageSize: this.state.curPageSize + 1,
      tableData,
    });

    this.handleModalVisible(false);
  };
  /**
   * 项目增加更新之后的处理方法，直接修改项目列表对应数据
   */
  handleSucceedUpdate = () => {
    const { tableData, tableCurIndex } = this.state;

    tableData[tableCurIndex] = this.props.projectCase.updete;

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

    // TODO: 更新上传的图片
  };

  /**
   * 表格分页改变相应事件
   * @param {object} pagination   分页数据对象，标记着当前页、页大小、总数
   */
  handleTableChange = (pagination) => {
    const current = pagination.current || 1;

    const { curPageSize } = this.state;

    this.props.dispatch({
      type: 'projectCase/fetch',
      payload: {
        currentPage: current,
        curPageSize,
      },
    });

    this.setState({ currentPage: current });
  };

  /**
   * 优质案例评论编辑关闭
   */
  commentModalClose = () => {
    this.setState({
      commentModalVisible: false,
    });
  };

  /**
   * 优质案例评论编辑打开
   */
  handlecommentModalOpen = (record) => {
    this.setState({
      commentModalVisible: true,
      commentModalRecord: record,
      commentModalComment: JSON.parse(record.commentList || '[]'),
    });
  };

  /**
   * 更新优质案例评论
   */
  handleUpdateComment = async () => {
    const { commentModalRecord, commentModalComment } = this.state;

    await this.props.dispatch({
      type: 'projectCase/put',
      payload: {
        id: commentModalRecord.id,
        commentList: JSON.stringify(commentModalComment),
      },
    });

    this.handleSucceedUpdate();
    this.setState({ commentModalVisible: false });
  };

  /**
   * 增加当前编辑行的评论
   * @param {Object} comment  评论对象
   */
  handleAddComment = (comment) => {
    const { commentModalComment } = this.state;
    commentModalComment.push(comment);

    this.setState({ commentModalComment });
  };

  /**
   * 删除当前编辑行的评论
   * @param {Object} comment  评论对象
   */
  handleDeleteComment = (index) => {
    const { commentModalComment } = this.state;
    commentModalComment.splice(index, 1);

    this.setState({ commentModalComment });
  };

  render() {
    const columns = [
      {
        title: '标题',
        className: 'ant-tableThead',
        dataIndex: 'title',
        width: 100,
      },
      {
        title: '封面描述',
        className: 'ant-tableThead',
        dataIndex: 'describe',
        width: 400,
      },
      {
        title: '创建时间',
        className: 'ant-tableThead',
        dataIndex: 'create_time',
        width: 200,
        render: (text) => {
          return <span>{text}</span>;
        },
      },
      {
        title: '精选权重',
        className: 'ant-tableThead',
        dataIndex: 'weight',
        render: (text, record, index) => {
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
        width: 400,
        render: (text, record, index) => {
          const { id = -1 } = record;

          return (
            <span>
              <Button icon="edit" onClick={() => this.handleRowEditClick(index, record)}>
                编辑
              </Button>
              <span className="ant-divider" />
              <Button icon="edit" onClick={() => this.handlecommentModalOpen(record)}>
                评论
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
        title="优质案例"
        content="用于在 “项目案例” 页面中，作为精选案例的案例，可跳转到该案例的详情页中。"
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
                新增项目
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
            <FormItem {...formItemLayout} label="项目名">
              {getFieldDecorator('title', {
                rules: customRules,
                initialValue: this.state.title,
              })(<Input placeholder="请输入项目名" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="封面描述">
              {getFieldDecorator('describe', {
                rules: customRules,
                initialValue: this.state.describe,
              })(<Input placeholder="请输入项目名" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="pc封面大图">
              {getFieldDecorator('cover', {})(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileListObj.cover}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'cover')}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="mobile封面大图">
              {getFieldDecorator('mobile_cover', {})(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileListObj.mobile_cover}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'mobile_cover')}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="封面小图标">
              {getFieldDecorator('icon', {})(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileListObj.icon}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'icon')}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="pc详情页banner">
              {getFieldDecorator('banner', {})(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileListObj.banner}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'banner')}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="mobile详情页banner">
              {getFieldDecorator('mobile_banner', {})(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileListObj.mobile_banner}
                  handleUploadChange={fileList =>
                    this.handleUploadChange(fileList, 'mobile_banner')
                  }
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="二维码">
              {getFieldDecorator('qrcode', {})(
                <UploadImgs
                  isEnhanceSingle
                  limit={1}
                  defaultFileList={this.state.defaultFileListObj.qrcode}
                  handleUploadChange={fileList => this.handleUploadChange(fileList, 'qrcode')}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label={(<span>案例类型&nbsp;<Tooltip title="友情提示：以英文标点逗号分隔"><Icon type="info-circle-o" /></Tooltip></span>)}>
              {getFieldDecorator('case_type', {
                rules: customRules,
                initialValue: this.state.case_type,
              })(<Input placeholder="出行,共享平台" />)}
            </FormItem>

            <FormItem {...formItemLayout} label={(<span>系统平台&nbsp;<Tooltip title="友情提示：以英文标点逗号分隔"><Icon type="info-circle-o" /></Tooltip></span>)}>
              {getFieldDecorator('system_platform', {
                rules: customRules,
                initialValue: this.state.system_platform,
              })(<Input placeholder="安卓,IOS" />)}
            </FormItem>

            <FormItem {...formItemLayout} label={(<span>解决方案&nbsp;<Tooltip title="友情提示：以英文标点逗号分隔"><Icon type="info-circle-o" /></Tooltip></span>)}>
              {getFieldDecorator('solution', {
                rules: customRules,
                initialValue: this.state.solution,
              })(<Input placeholder="账户系统,计价系统,地图导航,钱包系统" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="详情正文">
              {getFieldDecorator('mainbody', {
                rules: customRules,
                initialValue: this.state.mainbody,
              })(
                <TextArea
                  placeholder="请录入 MarkDown 格式的项目正文"
                  autosize={{ minRows: 6, maxRows: 20 }}
                />
              )}
            </FormItem>
          </Form>
        </Modal>

        <CaseCommentModal
          visible={this.state.commentModalVisible}
          record={this.state.commentModalRecord}
          commentList={this.state.commentModalComment}
          addComment={this.handleAddComment}
          deleteComment={this.handleDeleteComment}
          onCancel={this.commentModalClose}
          update={record => this.handleUpdateComment(record)}
        />
      </PageHeaderLayout>
    );
  }
}

export default Info;
