import React, { Component } from 'react';
import uuid from 'uuid';
import axios from 'axios';

import { Upload, Modal, Icon, message } from 'antd';

import enhanceArray from '../../utils/enhanceArray.js';

import * as appConfig from '../../utils/appConfig';
import * as utils from '../../utils/utils';

enhanceArray();

export const setDefaultFileList = (imgUrls = []) => {
  const defaultFileList = [];

  !imgUrls && (imgUrls = []);

  let item = '';
  let id = '';
  for (item of imgUrls) {
    if (item) {
      id = uuid.v4();

      defaultFileList.push({
        uid: id,
        picname: `UploadImgs-${id}.png`,
        status: 'done',
        url: item,
      });
    }
  }

  return defaultFileList;
};

const uploadButton = (
  <div>
    <Icon type="plus" />
    <div>上传</div>
  </div>
);

/* 上传图片成功后，后台返回的json数据，图片url的key */
const RESPONSE_IMG = 'key';

class UploadImgs extends Component {
  static defaultProps = {
    // action: API.uploadToQiniu, 使用七牛的直传
    // name: 'file',
    // 限制多少个（limit）
    limit: 1,
    multiple: false,
    listType: 'picture-card',
    errorMsg: '图片上传失败',
    isEnhanceSingle: true,
  };

  constructor(props) {
    super(props);

    const { defaultFileList = [] } = this.props;

    this.state = {
      flay: false,
      data: null,
      fileList: defaultFileList,
      limitNum: 1,
      previewImage: '',

      isPreviewVisible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { defaultFileList = [] } = nextProps;

    const propsFileList = this.props.defaultFileList || [];

    if (!propsFileList.equals(defaultFileList)) {
      this.setState({ fileList: [...defaultFileList] });
    }
  }

  beforeUpload = (file, fileList) => {
    const token = utils.getSSItem('token', true) || '';
    const key = utils.getUuidFileName();
    const param = {
      url: `${appConfig.getQiniuToken}?key=${key}`,
      method: 'get',
      // headers: {
      //     Authorization: `token ${token}`
      // }
    };

    return axios(param).then((response) => {
      const data = {
        key,
        token: response.data,
      };
      this.setState({ data });
    });
  };

  handleChange = ({ file, fileList }) => {
    if (file.status === 'error') message.error(this.props.errorMsg, 2);

    let key = '';
    const doneFileList = [];
    for (key of fileList) {
      if (key.status === 'done') doneFileList.push(key);
    }

    this.setState({ fileList });
    this.toggleChangeCallback(doneFileList);
  };

  toggleChangeCallback = (doneFileList) => {
    const {
      isEnhanceSingle,
      handleUploadChange = null,
      handleEnhanceSingleUploadChange = null,
    } = this.props;

    if (handleUploadChange) handleUploadChange(doneFileList);

    let imgUrl = '';
    if (isEnhanceSingle) {
      const { response = {} } = doneFileList[0] || {};
      const responseImg = response[RESPONSE_IMG];

      if (responseImg) imgUrl = `${appConfig.qiniuDomain}/${responseImg}`;
      if (handleEnhanceSingleUploadChange) handleEnhanceSingleUploadChange(imgUrl);
    }
  };

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      isPreviewVisible: true,
    });
  };

  handleCancel = () => this.setState({ isPreviewVisible: false });

  render() {
    const { fileList } = this.state;
    const isHideUploadButton = fileList.length >= this.props.limit;
    return (
      <div>
        <Upload
          action={appConfig.qiniuUploadApi}
          data={this.state.data}
          multiple={this.props.multiple}
          listType={this.props.listType}
          fileList={fileList}
          beforeUpload={this.beforeUpload}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
        >
          {isHideUploadButton ? null : uploadButton}
        </Upload>

        <Modal
          title="图片预览"
          width={620}
          visible={this.state.isPreviewVisible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img style={{ width: '100%' }} src={this.state.previewImage} alt="" />
        </Modal>
      </div>
    );
  }
}

export default UploadImgs;
