import React, { Component } from 'react';
import { connect } from 'dva';

import { Card, Button, Input, Modal, Form, Select, List } from 'antd';
import Ellipsis from '../../components/Ellipsis';

import UploadImgs from '../../components/UploadImgs/UploadImgs';
import styles from './CaseCommentModal.less';
import { qiniuDomain } from '../../utils/appConfig';

const FormItem = Form.Item;
const { TextArea } = Input;

const userType = ['客户', '员工'];

const formItemLayout = {
  labelCol: {
    xs: { span: 8 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 12 },
    sm: { span: 10 },
    md: { span: 8 },
  },
};

@connect(({ projectCase, loading }) => ({
  projectCase,
  loading: loading.models.projectCase,
}))
@Form.create()
export class CaseCommentModal extends Component {
  state = {
    record: {}, // 当前编辑行的记录
    commentList: [], // 评论数组
    defaultFileList: [],
  };

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      record: nextProps.record,
      commentList: nextProps.commentList,
    });
  };

  handleAppendComment = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.props.addComment({
          userType: values.userType,
          comment: values.comment,
          userName: values.title,
          avatar: values.avatar,
        });
      }
    });
  };

  handleUpdateRecord = () => {
    const { record, commentList } = this.state;

    record.commentList = JSON.stringify(commentList);
    this.props.update(record);
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

  handleClose = () => {
    this.props.onCancel();
  };

  render() {
    const { loading } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const customRules = [
      {
        required: true,
        message: '必填',
      },
    ];
    return (
      <div>
        <Modal
          title="优质案例评论编辑"
          visible={this.props.visible}
          width={800}
          onOk={this.handleUpdateRecord}
          onCancel={this.handleClose}
          confirmLoading={loading}
        >
          <Card>
            <Form onSubmit={this.handleAppendComment} width={800}>
              <FormItem {...formItemLayout} label="评论类型">
                {getFieldDecorator('userType', {
                  rules: customRules,
                  initialValue: userType[0],
                })(
                  <Select>
                    {userType.map(item => (
                      <Select.Option key={item} value={item}>
                        {item}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label={`${getFieldValue('userType')}姓名：`}>
                {getFieldDecorator('title', {
                  rules: customRules,
                  initialValue: this.state.title,
                })(<Input />)}
              </FormItem>

              <FormItem {...formItemLayout} label="评论">
                {getFieldDecorator('comment', {
                  rules: customRules,
                  initialValue: this.state.comment,
                })(
                  <TextArea
                    placeholder="请录入 MarkDown 格式的文章正文"
                    autosize={{ minRows: 6, maxRows: 20 }}
                  />
                )}
              </FormItem>

              {getFieldValue('userType') === userType[0] ? (
                <FormItem {...formItemLayout} label="客户头像">
                  {getFieldDecorator('avatar', { rules: customRules })(
                    <UploadImgs
                      isEnhanceSingle
                      limit={1}
                      defaultFileList={this.state.defaultFileList}
                      handleUploadChange={fileList => this.handleUploadChange(fileList, 'avatar')}
                    />
                  )}
                </FormItem>
              ) : (
                ''
              )}

              <FormItem
                wrapperCol={{
                  xs: { span: 24, offset: 0 },
                  sm: { span: 16, offset: 4 },
                }}
              >
                <Button type="primary" htmlType="submit">
                  增加评论
                </Button>
              </FormItem>
            </Form>

            <div className={styles.cardList}>
              <List
                rowKey="id"
                loading={loading}
                grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
                dataSource={this.state.commentList}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <Card
                      hoverable
                      className={styles.card}
                      actions={[<a onClick={() => this.props.deleteComment(index)}>删除</a>]}
                    >
                      <Card.Meta
                        avatar={<img alt="" className={styles.cardAvatar} src={item.avatar} />}
                        title={<a href="#">{item.userName}</a>}
                        description={
                          <Ellipsis className={styles.item} lines={3}>
                            {item.comment}
                          </Ellipsis>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Modal>
      </div>
    );
  }
}

export default CaseCommentModal;
