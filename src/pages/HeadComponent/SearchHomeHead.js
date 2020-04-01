import React from 'react'
import {
  Link,
} from 'react-router';
import { connect } from 'react-redux';
import { Layout, Divider, Modal, Form, Input, Menu, Col, Icon, Button, message, Dropdown,Avatar } from 'antd';
import Logo from '../../images/EvaluateLogo.png';
import { toQuery, encodePS } from "../../untils/utils";//封装的请求函数
const { Header, Content, Footer } = Layout;
import {
  getLog,
  getPic
} from '../../actions/enterprise_login';
import './SearchHomeHead.scss';

const FormItem = Form.Item;
var jwtDecode = require('jwt-decode');
let jwtExpire;
@connect(state => ({
  home: state.home
}))
export default class SearchHomeHead extends React.Component {
  constructor() {
    super();
    this.state = {
      user: '',
      action: 'login',
      hasLogined: false,
      ModalVisible: false,
      codeUrl: '',
      code: ''
    }
  };
  static childContextTypes = {
    location: React.PropTypes.object,
    route: React.PropTypes.object
  };
  static contextTypes = {
    router: React.PropTypes.object
  };

  login = () => {
    this.resetPic();
    this.setState({
      modalVisible: true,
    });
  };
  setModalVisible(value) {
    this.setState({
      modalVisible: value
    });
  };
  resetPic = () => {
    this.props.dispatch(getPic()).then(() => {
      let str = 'data:image/gif;base64,';
      this.setState({
        codeUrl: str + this.props.home.userPic.data.img,
        code: this.props.home.userPic.data.code,
      })
    })
  };
  logOut = () => {
    message.warning('退出');
    localStorage.username = '',
    localStorage.userId = '',
    localStorage.roleId = 5;
    localStorage.removeItem('token')
    this.setState({
      hasLogined: false,
    })
    this.context.router.push(`/`);
  };
  handlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields(['userName', 'passWord', 'codePiclg'], (error, value) => {
      if (error) {
        message.warning('请确认填写无误！');
        return;
      }
      let config = {
        username: value.userName || '',
        password: encodePS(value.passWord) || '',
        //验证码验证
        code: value.codePiclg || '',
        verify: this.state.code || ''
      }
      // console.log(encodePS(value.passWord))
      this.props.dispatch(getLog(toQuery(config))).then(() => {
        if (!!this.props.home.userLog) {
          let information = this.props.home.userLog.data;
          let all = information.data;
          let user = all.user;
          if (all.status == 3) {//状态3密码错误
            message.error('密码错误', 5);
          } else
            if (all.status == 4) {//状态4验证码错误
              message.error('验证码错误', 5);
            } else if (all.status == 2) {
              message.error('用户不存在', 5);//状态5用户不存在
            } else if (all.status == 1) {
              this.setModalVisible(false);
              message.success('登录成功', 5);//状态1用户登录成功
              localStorage.username = user.username;
              localStorage.userId = user.id;
              localStorage.roleId = user.roleId;
              localStorage.token = information.token;
              this.setState({
                hasLogined: true,
                user: user,
                userroleId: user.roleId
              });
              if (localStorage.roleId == 1) {//角色ID，如果为1，就进入管理页面
                this.context.router.push(`/admin/home`);
              }
            }
        }
      })
    });
  };
  handleJwtExpire = () => {
    if (!!jwtExpire) {
      clearTimeout(jwtExpire);
    }
    if (!!localStorage.token) {
      let token = jwtDecode(localStorage.token);
      let time = token.exp * 1000 - Date.parse(new Date());
      jwtExpire = setTimeout(() => {
        this.logOut();
      }, time);
    }
  }
  componentDidMount() {
  }
  componentWillMount() {
    this.mounted = true;
    if (!!localStorage.userId) {
      let token = jwtDecode(localStorage.token);
      if (token.exp * 1000 > Date.parse(new Date())) {
        this.setState({
          ...this.state,
          hasLogined: true,
        });
        this.handleJwtExpire();
      } else {
        this.logOut();
      }
    }
  }
  componentWillUnmount() {
    // 如果存在jwtExpire，则使用clearTimeout清空,避免内存泄漏
    jwtExpire && clearTimeout(jwtExpire);
    this.mounted = false;
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    let { getFieldDecorator } = this.props.form;
    const displayLogin = () => {
      let url = '';
      if (localStorage.roleId == 1) {
        url = `/admin/home`
      }
      // else {
      //   url = `/GeneralAdmin/home`
      // }
      const menu = (
        <Menu>
          <Menu.Item>
            <Link to={url}>数据服务</Link>
          </Menu.Item>
          <Menu.Item>
            <a onClick={this.logOut}>退出登录</a>
          </Menu.Item>
        </Menu>
      );
      if (this.state.hasLogined === true) {
        return (<Dropdown overlay={menu}>
          <a style={{fontSize: '20px'}}>
            <Avatar style={{ backgroundColor: '#0F63A8',marginRight: '10px'}} icon="user" />
            {localStorage.username}<Icon type="down" />
          </a>
        </Dropdown>)
      }
      else {
        return (<a onClick={this.login.bind(this)}>数据服务</a>)
      }
    }
    return (
      <div>
        <Header style={{ zIndex: 1, width: '100%' }}>
          <div className="headbar">
            <div className="headflefttbar">
              <Link to="/">
                <img className="evaluatelogo" src={Logo} />
                <span className="homelogo" > 企业创新能力评估系统</span>
              </Link>
            </div>
            <div className="corpration" >
              <span>{displayLogin()}</span>
            </div>
            <Divider />
          </div>
        </Header>
        <Modal title="数据服务登录"  visible={this.state.modalVisible} footer={null} wrapClassName='vertical-center-modal'
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}>
          <Form className="login-form"   >
            <FormItem className="logform" label="用户名" hasFeedback>
              {getFieldDecorator('userName', {
                rules: [{ required: true, message: '用户名不能为空' }],
                message: '用户名不能为空'
              })
                (<Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="请输入用户名" />)}
            </FormItem>
            <FormItem className="logform" label="密码" hasFeedback>
              {getFieldDecorator('passWord', {
                rules: [{ required: true, message: '密码不能为空' }],
                message: '密码不能为空'
              })
                (<Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} placeholder="请输入密码" type='password' />)
              }
            </FormItem>
            <FormItem className="logform" label="验证码" hasFeedback>
              <Col span={18}>
                {getFieldDecorator('codePiclg', {
                  rules: [{ required: true, message: '验证码不能为空' }],
                  message: '验证码不能为空'
                })
                  (<Input prefix={<Icon type="star" />} placeholder="请输入验证码" />)}
              </Col>
              <Col span={4} offset={2}><img src={this.state.codeUrl} onClick={this.resetPic} /></Col>
            </FormItem>
            <FormItem >
              <Button type="primary" htmlType='submit' onClick={this.handlSubmit} style={{ width: '100%'}}>登录</Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}
SearchHomeHead = Form.create()(SearchHomeHead);