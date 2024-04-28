---
layout: post
title: react study
tags: react javascript html5
categories: frontend
---

* TOC
{:toc}

# react 学习

## 先决条件

1. 对HTML和CSS的基本熟悉程度。
1. JavaScript和编程的基础知识。
1. 对DOM的基本了解。
1. 熟悉ES6的语法和功能。
1. 全局安装的 Node.js 和 npm。

## 组件

1. 组件允许你将 UI 拆分为独立可复用的代码片段，并对每个片段进行独立构思
1. 组件类型
    * 类组件
    * 函数组件（简单组件）
1. props
1. state

## 一、官方例子

### 描述

1. Square 组件渲染了一个单独的 <button>
1. Board 组件渲染了 9 个方块
1. Game 组件渲染了含有默认值的一个棋盘
1. 胜出逻辑分离

> 当你遇到需要同时获取多个子组件数据，或者两个组件之间需要相互通讯的情况时，需要把子组件的 state 数据提升至其共同的父组件当中保存。之后父组件可以通过 props 将状态数据传递到子组件当中。这样应用当中所有组件的状态数据就能够更方便地同步共享了。
>
### 官方提出可改进

1. 在游戏历史记录列表显示每一步棋的坐标，格式为 (列号, 行号)。
1. 在历史记录列表中加粗显示当前选择的项目。
1. 使用两个循环来渲染出棋盘的格子，而不是在代码里写死（hardcode）。
1. 添加一个可以升序或降序显示历史记录的按钮。
1. 每当有人获胜时，高亮显示连成一线的 3 颗棋子。
1. 当无人获胜时，显示一个平局的消息。

### 个人想法

1. 如果组件逻辑不复杂的话，可以改为函数组件，比如Board
1. 能不用hardcode就不用hardcode，使用循环优化Board
1. Game 组件优化
    * 状态组件
    * 步数组件
1. ![avatar][base64_game_render_code]

## 二、统一认证jumpserver例子

### 一、目录概要

### 二、AdminUsersDetail细节解说

#### 1. AdminUsersDetail

1. [AdminUsersDetail
](http://devserver.shashi.iartemis.cn/certification/certification/-/blob/dev/04-Frontend/frontend/src/views/Assets/AdminUsersDetail/Index.js)
1. 特点
    1. 定义了tabs
    1. 定义了tab props

1. 代码

    ```javascript
      import React, { Component } from "react";
      import {getJp_assets_admin_users} from 'api/certification/assetsList'
      import CSSTransitions from 'components/CSSTransitions'
      import {Button} from 'antd'
      import BaseInfo from './BaseInfo'
      import AssetUsers from "./AssetUsers";
      import TabComponents, {renderComponent} from "components/jp/TabComponents";

      const tabs = [
        {
          label: '资产详情',
          key: 'base',
          Component: BaseInfo,
        },
        {
          label: '资产用户列表',
          key: 'asset-users',
          Component: AssetUsers,
        },
      ]

      class AssetsDetail extends Component {
        constructor(props) {
          super(props)
          this.id = props.match.params.id;
          this.name = props.match.params.name || '_'
          this.state = {
            asset: null,
          }
        }

        componentDidMount() {
          this.fetchUserInfo()
        }

        fetchUserInfo() {
          getJp_assets_admin_users(this.id).then(rep => {
            this.setState({
              asset: rep.data
            })
          })
        }

        render() {
          const asset = this.state.asset 
          const tabProps = {
            id: this.id,
            asset,
            renewAsset: () => this.fetchAssetInfo(),
          }
          return (
            <CSSTransitions>
              <div
                style={{
                  width: "100%",
                  height: 900,
                  borderRadius: 8,
                  paddingTop: 10,
                }}
              >
                <div style={{ backgroundColor: '#fff', height: 100, paddingTop: 10, marginTop: -15, borderRadius: 8, }}>
                  <span
                    style={{ fontSize: 22, marginLeft: 20, color: "rgb(103,106,108)" }}
                  >
                    管理用户: {asset ? asset.name : '加载中...'}
                  </span>
                  <Button
                    type="primary"
                    style={{ float: "right", marginRight: 20 }}
                    onClick={() => {
                      this.props.history.push('/assets/admin-user/detail/' + this.id +'/upstate');
                    }}
                  >
                    更新
                  </Button>
                  <TabComponents loading={!asset}>
                    {renderComponent(tabs, tabProps)}
                  </TabComponents>
                </div>
              </div>
            </CSSTransitions>
          )
        }

      }
      export default AssetsDetail
    ```

#### 2. TabComponents 二次封装tab组件

1. 特点
    1. 固定一些项目自有的属性
1. 改进
    1. 将renderChildren提升
1. 代码

    ```javascript
      import React from 'react'
      import PropTypes from 'prop-types'
      import Loading from 'components/Loading'
      import {Tabs} from 'antd'
      import CSSTransitions from 'components/CSSTransitions'
      import tabReplaceHoc from './TabReplaceHoc'
      const {TabPane} = Tabs

      const TabComponents = props => {
        if(props.loading) {
          return <Loading loading={props.loading}></Loading>
        }
        const renderChildren = children => {
          return children.map(child => (
            <TabPane tab={child.props.label} key={child.key} >
              <CSSTransitions>
                {child}
              </CSSTransitions>
            </TabPane>
          ))
        }

        return (
          <Tabs
            activeKey={props.activeKey}
            type="card"
            onChange={props.tabChange}
            style={{ marginTop: 17 }}
            destroyInactiveTabPane={true}
          >
            {
              props.children ? renderChildren(props.children) : ''
            }
          </Tabs>
        )
      }
      TabComponents.propTypes = {
        loading: PropTypes.bool,
      }

      TabComponents.defaultProps = {
        loading: false
      }

      export const renderComponent = (tabs, props) => {
        return tabs.map(tab => {
          return <tab.Component 
            {...props}
            key={tab.key}
            label={tab.label}
          ></tab.Component>
        })
      }

      export default tabReplaceHoc(React.memo(TabComponents))

    ```

#### 3. TabReplaceHoc

1. 特点
    1. 使用高阶组件，管理tabkey字段
    1. 使TabComponents职责更单一
    1. 如果有其他组件需要，可以复用
1. 改进
    1. 支持多个key
    1. 指定key
1. 代码

    ```javascript
      import React, { useState } from "react"
      import { useHistory } from "react-router"
      import { encodeQuery, parseQuery, query } from "utils/common"

      /**
      * 处理tab 转换时的key 以及url query中的tab
      */
      const tabReplaceHoc = (WrappedComponent, defaultActiveKey) => {
        return props => {
          const history = useHistory()
          const [activeKey, setActiveKey] = useState(query(history.location, 'tab') || defaultActiveKey)
          const tabChange = activeKey => {
            setActiveKey(activeKey)
            const query = parseQuery(history.location)
            query['tab'] = activeKey
            history.replace(
              `${history.location.pathname}?`+ encodeQuery(query)
            )
          }
          return <WrappedComponent 
            {...props} 
            activeKey={activeKey} 
            tabChange={tabChange}>
            </WrappedComponent>
        }
      }

      export default tabReplaceHoc

    ```

#### 4. BaseInfo

1. 特点
    1. 状态控制
    1. 调用公共封装组件
    1. render内容结构比较分明
1. 改进
    1. 可以将结构封装成更具名的组件
1. 代码

    ```javascript
        import React, { Component } from "react";
        import Loading from 'components/Loading'
        import {Row, Col, message} from 'antd'
        import SelectCard from 'components/jp/SelectCard'
        import BaseInfoCard from 'components/jp/BaseInfoCard'
        import {patchJp_assets_admin_users_nodes,} from 'api/certification/assetsList'
        import {asset_notes_fetch} from 'utils/jp-assets'

        const cardData = [
          { title: "ID", key: "id" },
          { title: "名称", key: "name" },
          { title: "用户名", key: "username" },
          { title: "创建日期", key: "date_created", render: record => record.date_created.split(' +')[0] },
          { title: "创建者", key: "created_by" },
        ]

        class BaseInfo extends Component {
          constructor(props) {
            super(props)
            this.id = props.id
            this.state = {
              asset: props.asset,
            }
          }
          componentDidMount() {
          }

          onBindNodes(nodes) {
            if(!nodes || nodes.length <= 0) {
              message.warning("请选择节点")
              return
            }
            return patchJp_assets_admin_users_nodes(this.id, {nodes}).then(rep => {
              message.success("替换节点成功")
            })
          }

          render() {
            if(!this.id ||!this.state.asset) {
              return <Loading loading={true}></Loading>
            }
            const asset = this.state.asset
            return (
              <>
                <Row>
                  <Col span={14}>
                    <BaseInfoCard
                      cardData={cardData}
                      data={asset}
                    ></BaseInfoCard>
                  </Col>
                  <Col span={10} style={{background: '#fff'}}>
                      <SelectCard
                        headerStyle={{background: '#23c6c8'}}
                        title=" 替换资产的管理员"
                        onLoadData={asset_notes_fetch}
                        relates={[]}
                        render={record => `${record.full_value}`}
                        onCreate={keys => this.onBindNodes(keys)}
                      >
                      </SelectCard>
                  </Col>
                </Row>
              </>
            )
          }
        }
        export default BaseInfo
    ```

### 三、SystemUserCreate细节解说

#### 1. SystemUserCreate

1. 特点
    1. 针对表单数据、提交做处理
    1. 默认表单数据
    1. 分离表单具体实例
    1. 初始数据判断，fixed ant form 初始化数据
    1. onSubmit 返回promise状态，方便调用方进行后续处理
1. 改进
    1. 表单提交后处理方式
    1. Loading 可以加入虚拟骨架
1. 代码

    ```javascript
        import React, { Component } from 'react';
        import {
          Divider
        } from 'antd';

        import {
          getJp_assets_system_users,
          patchJp_assets_system_users,
          postJp_assets_system_users,
        } from 'api/certification/assetsList';
        import RebLoading from 'components/RebLoading';
        import SystemUserForm from './SystemUserForm'
        import Loading from 'components/Loading';


        const defaultInitialValues = {
          login_mode: "auto",
          username_same_with_user: false,
          priority: 20,
          protocol: "ssh",
          auto_push: false,
          sudo: "/bin/whoami",
          shell: "/bin/bash",
          auto_generate_key: false,
          sftp_root: "tmp",
          name: "",
          username: "",
          home: "",
          password: "",
          cmd_filters: [],
          private_key_file: [],
        }


        class SystemUserCreate extends Component {
          constructor(props) {
            super(props)
            this.id = props.match.params.id;
            this.state = {
              initialValues: null
            }

          }

          componentDidMount() {
            if (!this.id) {
              this.setState({
                initialValues: {...defaultInitialValues}
              })
            } else {
              getJp_assets_system_users(this.id).then(rep => {
                this.setState({initialValues: {...rep.data}})
              })
            }
          }

          onSubmit(data) {
            this.props.setLoading(true)
            const promise = !this.id ? postJp_assets_system_users(data) : patchJp_assets_system_users(this.id, data)
            return promise.finally(() => {
              this.props.setLoading(false)
            })
          }

          render() {
            return (
              <>
                <div style={{ padding: 20, backgroundColor: '#fff' }}>
                  <Divider orientation="left">基本</Divider>
                  {
                    !this.state.initialValues 
                      ? <Loading loading={true}></Loading>
                      : <SystemUserForm 
                          initialValues={this.state.initialValues} 
                          onFinish={data => this.onSubmit(data)}
                        >
                        </SystemUserForm>
                  }
                </div>
              </>
            )
          }
        }
        export default RebLoading(SystemUserCreate);

    ```

#### 2. SystemUserForm

1. 特点
    1. 添加了几个中间状态控制表单展示
    1. 用合理的状态控制表单展示
    1. 使用了统一封装的一些组件
1. 改进
    1. 如果有其他地方也用protocolOptions，可以再提升到公共的静态变量中
    1. 保存并继续添加
    1. 能否有一个有效的方式，将重点展示出来
1. 代码

    ```javascript
        import React, { useEffect, useState } from 'react';
        import PropTypes from 'prop-types'
        import {
          Form,
          Divider,
          Select,
          Button,
          Input,
          Switch,
          Radio,
          Upload,
          Checkbox,
          message,
          Space,
        } from 'antd'
        import { UploadOutlined } from '@ant-design/icons'
        import {filter_commands_init, filter_commands_fetch, jp_lazy_search} from 'utils/jp-assets'
        import ScrollSelect from 'components/ScrollSelect';
        import {commonFormLayout, commonTailLayout} from 'utils/common'
        import { useHistory } from 'react-router';
        const { Option } = Select
        const { TextArea } = Input


        const protocolOptions = [
          {label: 'ssh', value: 'ssh'},
          {label: 'rdp', value: 'rdp'},
          {label: 'telnet', value: 'telnet'},
          {label: 'vnc', value: 'vnc'},
          {label: 'mysql', value: 'mysql'},
          {label: 'oracle', value: 'oracle'},
          {label: 'mariadb', value: 'mariadb'},
          {label: 'postgresql', value: 'postgresql'},
          {label: 'k8s', value: 'k8s'},
        ]


        const SystemUserForm = props => {
          const [form] = Form.useForm()
          const history = useHistory()

          // 是否同名 控制用户名是否可以编辑
          const [usernameSameWithUser, setUsernameSameWithUser] = useState(props.initialValues.username_same_with_user)
          
          // 自动推送 控制自动推送下Sudo、Shell、家目录、用户附属组等展示
          const [autoPush, setAutoPush] = useState(props.initialValues.auto_push)

          // 自动生成密钥 控制密码、密钥展示
          const [autoGenerateKey, setAutoGenerateKey] = useState(props.initialValues.auto_generate_key)

          // 更新密码 控制密码展示
          const [renewPassword, setRenewPassword] = useState(!props.initialValues.id)

          const [saveAndNext, setSaveAndNext] = useState(false)
          
          const onFieldsChange = (changedFields, allFields) => {
              changedFields.forEach(field => {
                const name = field.name[0]
                if (name === "username_same_with_user") {
                  setUsernameSameWithUser(field.value)
                } else if (name === "auto_push") {
                  setAutoPush(field.value)
                } else if (name === "auto_generate_key") {
                  setAutoGenerateKey(field.value)
                } else if (name === "renew_password") {
                  setRenewPassword(field.value)
                }
              })
          }

          // 上传私钥
          const onUploadPrivateKey = (e) => { 
            if (!e.file) {
              return
            }
            if (!!e.file.type && e.file.type.indexOf('text') === -1) {
              const msg = '请上传纯文本格式或者txt格式'
              message.error(msg)
              e.onError(new Error(msg))
              return
            }
            // console.log(e)
            e.file.text().then(text => {
              form.setFieldsValue({private_key: text})
              e.onSuccess()
            })
          }

          const onFinish = data => {
            // 根据选择过滤一些数据
            // console.log(data)
            if (!data['renew_password']) {
              delete data['password']
            }

            if (!data['private_key']) {
              delete data['private_key']
            }
            if (props.initialValues.id) {
              delete data['auto_generate_key']
            }
            delete data['private_key_file']
            delete data['renew_password']
            return props.onFinish(data).then(rep => {
              const system_user = rep.data
              saveAndNext && form.resetFields()
              message.success(!props.initialValues.id ? '添加成功': '更新成功')
              history.push(`/jumpserver/assets/system-user/details/${system_user.id}`)
              return rep
            }).finally(() => {
              saveAndNext && setSaveAndNext(false)
            })
          }

          useEffect(() => {
            if (saveAndNext) {
              form.submit()
            }
          // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [saveAndNext])

          return (
              <Form
                {...commonFormLayout}
                form={form}
                onFinish={onFinish}
                initialValues={props.initialValues}
                onFieldsChange={onFieldsChange}
              >
                <Form.Item 
                  label='名称'
                  name="name"
                  required={true}
                >
                  <Input placeholder="请输入名称" />
                </Form.Item>
                <Form.Item 
                  label='登录模式'
                  extra="如果选择手动登录模式，用户名和密码可以不填写"
                  name="login_mode"
                  required={true}
                >
                  <Radio.Group>
                    <Radio value="auto">自动登录</Radio>
                    <Radio value="manual">手动登录</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item 
                  label='用户名'
                  name="username"
                  required={true}
                >
                  <Input placeholder="请输入用户名" disabled={usernameSameWithUser}/>
                </Form.Item>
                <Form.Item 
                  label='用户名与用户相同'
                  extra="用户名是动态的，登录资产时使用当前用户的用户名登录"
                  name="username_same_with_user"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item 
                  label='优先级'
                  extra="1-100, 1最低优先级，100最高优先级。授权多个用户时，高优先级的系统用户将会作为默认登录用户"
                  name="priority"
                >
                  <Input placeholder="请输入优先级" />
                </Form.Item>
                <Form.Item 
                  label='协议'
                  name="protocol"
                >
                  <Select placeholder="请选择协议">
                    {
                      protocolOptions.map(
                        option => <Option key={option.value} value={option.value}>{option.label}</Option>
                      )
                    }
                  </Select>
                </Form.Item>
                
                <Divider orientation="left">自动推送</Divider>
                <Form.Item 
                  label='自动推送'
                  name="auto_push"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item 
                  label='Sudo'
                  extra="使用逗号分隔多个命令，如: /bin/whoami,/sbin/ifconfig"
                  name="sudo"
                  hidden={!autoPush}
                  required={autoPush}
                >
                  <Input placeholder="请输入Sudo" disabled={!autoPush}/>
                </Form.Item>
                <Form.Item 
                  label='Shell'
                  name="shell"
                  hidden={!autoPush}
                  required={autoPush}
                >
                  <Input placeholder="请输入Shell" disabled={!autoPush}/>
                </Form.Item>
                <Form.Item 
                  label='家目录'
                  extra="默认家目录 /home/系统用户名: /home/username"
                  name="home"
                  hidden={!autoPush}
                >
                  <Input placeholder="请输入家目录" disabled={!autoPush} />
                </Form.Item>
                <Form.Item 
                  label='用户附属组'
                  extra="请输入用户组，多个用户组使用逗号分隔（需填写已存在的用户组）"
                  name="system_groups"
                  hidden={!autoPush}
                >
                  <Input placeholder="请输入用户附属组" disabled={!autoPush} />
                </Form.Item>   
                <Divider orientation="left">认证</Divider>
                <Form.Item 
                  label='自动生成密钥'
                  name="auto_generate_key"
                  valuePropName="checked"
                  hidden={!!props.initialValues.id}
                >
                  <Switch disabled={!!props.initialValues.id}/>
                </Form.Item>
                <Form.Item 
                  label='更新密码'
                  name="renew_password" 
                  valuePropName="checked"
                  hidden={renewPassword}
                >
                  <Checkbox></Checkbox>
                </Form.Item>
                <Form.Item 
                  label='密码'
                  extra="密码或密钥密码"
                  name="password"
                  hidden={autoGenerateKey || !renewPassword}
                >
                  <Input.Password placeholder="请输入密码" disabled={autoGenerateKey || !renewPassword} />
                </Form.Item>
                <Form.Item 
                  label='ssh私钥'
                  name="private_key"
                  hidden
                >
                  <Input disabled={autoGenerateKey} />
                </Form.Item>
                <Form.Item 
                  label='ssh私钥'
                  name="private_key_file"
                  valuePropName="fileList"
                  hidden={autoGenerateKey}
                  getValueFromEvent={e => Array.isArray(e) ? e : e ? e.fileList : false}
                >
                  <Upload 
                    customRequest={onUploadPrivateKey} 
                    name="private_key_upload" 
                    disabled={autoGenerateKey}
                    listType="text"
                    maxCount={1}
                    // showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>点击上传</Button>
                  </Upload>
                </Form.Item>
                <Divider orientation="left">命令过滤器</Divider>
                <Form.Item 
                  label='命令过滤器'
                  name="cmd_filters"
                >
                  <ScrollSelect
                    defaultProps={{placeholder: "请选择命令过滤器", mode: 'multiple'}}
                    renderOption={command => <Option key={command.id} value={command.id}>{command.name}</Option>}
                    onInitData={filter_commands_init(props.initialValues.nodes)}
                    onLoadData={filter_commands_fetch}
                    onSearch= {jp_lazy_search(filter_commands_fetch)}
                  />
                </Form.Item>
                <Divider orientation="left">其它</Divider>
                <Form.Item 
                  label='SFTP根路径'
                  name="sftp_root"
                  required
                >
                  <Input placeholder="请输入公网SFTP根路径" />
                </Form.Item>
                <Form.Item 
                  label='备注'
                  name="comment"
                >
                  <TextArea />
                </Form.Item>
                
                <Form.Item {...commonTailLayout}>
                  <Space>
                    {
                      props.initialValues.id 
                        ? (
                          <Button htmlType="button" onClick={() => form.resetFields()} style={{ marginLeft: 20 }}>
                            重置
                          </Button>
                        )
                        : <Button htmlType="button" onClick={() => setSaveAndNext(true)}>保存并继续添加</Button>
                    }
                    
                    <Button type="primary" htmlType="submit">
                      提交
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
          )
        }

        SystemUserForm.propTypes = {
          onFinish: PropTypes.func.isRequired,
          initialValues: PropTypes.object
        }
        export default SystemUserForm

    ```

[base64_game_render_code]:data:image/png;base64,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9r7m6BrZZKQJAMaxOqEpJ5QInypbfqdL6Ay16mi6s9nunLWMEZqqjontrNgRG9MhiXbEukNTV8dM7vgEHa7Y9lvbMPst7c+cxTvq3VLrxsvk66xlBqFJura79y9W7m7fD0b2/aKPZXhoCteJhab0OcvZf+f7yOvrqW7OT3dQW8FHkvnetKEprOczPwM6thkNOMF7W9z/aYcmO8qTCE5yMBk3NLXXNaEpGXRibbf3TYeyrvYCGdccAGByqxOackYJEsFFd7rs+pkdM2+57gyWpE7gKKHJBI6qY1J2ZLZ2i86Q6cxUHRupczKb0KTrFOtFNNtY1NAUdpQTzGvpvuaVSKc6GgByr4msAODqOhZ9fbf2v29oip0HywlN+t9lexvqRvl+ccqk459JaMra/3K9MUNT4v3omkNoqto279e2OYemigkota1gGluxbNTQFG7PctfNCE114IsI1tX715R3BTlCEwDMxpEcaZLq+J2ufqGpYTpXwrpZ+9epCSplZ6TsoJQdGPu93Cma80hTy4ihaeTpefGOusN2tINAklq3bwBoiVw78XZToUlvM1xPvra79i9v/6v9LPel/GCj/H91POW29PrSe6LvORsUmjL3f9zQFAkdoTmEptyAM7/Q5KgfurBVB5hxQ5MJQ0F74440dTH73rUuoQkAZmKF7mnSHSC5o2jFOpPh8syOmSi2jdwOWoru/FzcfKf4vzPCVHRgTpWdEzGIzCg0RdpqW9SRJvv6pkcrY3XinfyMcNPVGRcDgLneU+1K7wXx4QWxazvRTla5Zo//RvF/vV293u1tfQzzC015+1/X63qdShn3NOn3U8cHDOL7ybx3phSacj/46BOasj9MMeet1+Ozg3uYxDBkw1VXaDL16nBivg+fgDcsNLWDW77udbvuadLlRaziQRAAMJEVCk224xR2qIpOltspEjqN7Y5wZsesrBd2pExnrR2OTMerM3SlVR0Wr+NkOlKFOsB4ZhSaCnrfujpIixua6iASvEbe0/PM9dO8vvZ1jXeqU4HKtud33Is23afn2f2q69j9jLWbCAPm+nTLqv2r2mtfm7osESRb56NNH/+FYrtN+9V7qVomtx0/Z5nvzazQVMjY/16hKevpefY967+nvKfntd4nzft8aqHJ1usYGeoVmszyrve77diXX1LgLMNKGGD0/T9bTYAJn1BXfX9FXQ1DRxiIbLBqreuvV99v1Ds0FcJQJiraCkfKwmNq6Xp6nimvvvh7TgAwiZUKTRXbCa0JIaWzTmbHrGQ7oQ7pk3PN6ex21pXpACOFFb/DUocrQV1v5NDU1A226XWwFjk0lZwQZMjXgf8ahp3xsI6r1UFvXUNCkAjqlNvUwaPZpg44Mu86C67/cn/Ea7vSfT6k94B7DPW5cENHvY5QT9Bsc+TQVOrY/36hKffvNNmA0mh96GEDh1G+T6v319RCkyb+7HDer71CU8nsY0MIZRkjTU1oMVpT8QpOANLhRh6p0SNG7XpeOPHa0mXDRpoM8d6m4MEWQp0wLHpyntZYTd8rv5jCBwCTWL3QBABzZf42TnK0CbMxydS4xVc9Tjw6ymSZ67GzHgAghdAEACOz082SIwCYgRUOTWYEqesa41oEgHEQmgBgCvijootgRUOTmZaXfLhDPS2Pe5kAYAyEJgCYCn0TPk8tm6fVDE1VIGf6JwDMFKEJAAAAABIITQAAAACQQGgCAAAAgARCEwAAAAAkEJoAAAAAIIHQBAAAAAAJhCYAAAAASCA0AQAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQQGgCAAAAgARCEwAAAAAkEJoAAAAAIIHQBAAAAAAJhCYAAAAASCA0AQAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITVt7xzc/VR5/uqVNCmei1vaL+HfXRx7vquFSOGdlVdw+VOjzYFcoc+/eVUvfVTakM83P5QB0W/929LJQtm+oa01/394XySVXnSn8lr3eudQCYG0LTrJxbV/e+2Fa3t4UyTNX8QtM7arNo5+Lmy0IZutx8UHYhOzqIprPZGaxSnt9VF4vXafM1oQwTyXoNF525xmJh6eGHf77y9Ye/Wf+71LdO5XLX9aw/SCgqqB2xHAAwLYSmWSE0zU3v0DQaQtNQOwdVz7BjlGK/6I4XXw/2hbIeCE1TtPyd/OpaFPa/CkFff0w98sjj6tFHn1SPPPqEevSRY9X35XIbiqp633isKvv5ol6p/He57OGvf9Nrs1QFzeQ1PdJ1DwDohdA0K4SmuSE0LRvdKewaPdLBaoRRDELTdHWOnozn0mdfqi9/+ql6UygbqgoxQWgqg9A3vvEt9c2f/wX11LE19e2n/qQ6/gvfUb/41IvqyW/9UhWMykBkA9O3vvmL6heefEEdf+o7Vd3SsW89UwSsJ1rBSdpei5kuOJWpggAA0QqGppPqdhFOvqptqN3OOhfUjXPt8jLgnL9+wakntfWo2r3ltrWt7l0/ES0L9QpRVefuc/X687oz/lH170fVqa3y38J0MtMZrMoqbnB4Wb3+sbBOyaznd/ZN/botvW1vvYIOKE69rXdadWatCU32vGmtMGOn5VmJfa/PueG21ToHgXC73efMCV/BPtqOvm2j3fFPvM4xz2yqq5evqM1nXlUfXP5E7VX/flStv13+u/DupnrOrX96Sy+vbal1t7xuz2lDasfIC0N5wSr1OoVloda57Lg+qtegOs8d19lYev48SF9nfX8e+MfY9aHEzKbpnftU/ezLIjh9+Zm6JJUPEIaYMgiVo0nHinC0duLX1K9993fUK7/6Q/WnX/qz6jde+l31nedeUU8/9YJ67JtPF6HqKfXEt06oXzr+kvrV75xVf/pXfqDO/MrvVXW/+/yrRcj6k+rnizruyFRWaMoZwTNhlREpABjHaoWm7Q0dRm6ddJYXAcj93tRxg40NRk2AcUJVve4JdeNO8f2ddXXerFfSocgPU7u3whBWGGOkyXSSLn5cdo50J6f8d9X5qTp0TZCROtG6MxXWab639HK3E2Q6SE4nS1o3tmzen+Dr/dKdu3pfgvPlMx3IVnjR9Hn0O4mntqS2nLDjLbdsEBXOtdd5dTuoTV3/fLdfo4rY4e1gQs7Vd8ug84LafPeT6t97b79qApIOQHXdcnm9vq7vBaeqPROU6romkHnrlkxnsKujV33Snp6+l/06mXOUuk7b13bsPaFfJ/86S7c9WPbPg7zrrH2M7nJnXeGaks61Z6YjIx+qW1Vw+pn6cfhzeAA3xNgRpmOP/5L6k8+dUf/+b1xQf/53/pa68NZP1J955lD9+vrH6rf/1O+rk7/822rtmV9Vzx4/pX75ud9Qv3Hyd9Xv/ta2+sF3D9V3fuO/Vb9/7j8pvv9Qnf73vq+O/8J3q+BkR5zyQlP3FFZdXn4t+T1lALAgHnr68cfEguVjQo0XmEKxOmEgMqEpCEg6XLkBKWebxmihyXbUgo6Q1znTHaJ2Rzno6Ikd6nZgaHWaIvWqjpP0SXVvttMT8dmHwjpxtjPrd1xj56jUPra8slBqG4VYcGt1tNsd3ErQ2Zc6rvJr18GGnCrQBCHIjCp9cDpYxxXW8dpr6j33RhHEwlEp8+l4V+e6u2PZ43UKzmNb5HUMXj/5OutzvfSU+/Mg9zrL/Hkgv887rvXMkUHZkJ8Hb6kf/1SX3/owLOvHvdbKEaFyBOmFZ35d/Qdn3lN/9e1/qP7jd/9n9eEr/1r98Rf+hdq9+E/Uez/4L9Tvvb6rvv/qlnrz1T9Qv/ubH6p3vv931OW/+Ln6O3/l/1W/8u/8a/XWn/unavcv/XfqR2f/tjr9ve+rp598Xj1aTtUrQlnsHqqWrvcKI00AMKqHnl37nio9+U25wtLICSWmjjvKZPmBSIemsF47NDnT77qC04ihSXdyTGfGdl5anaSw86aFHZ5WB6jVgYx3+sJ1baex3aGaLzk4DA1NNpzEyxvpjqRuRwo04Xr6+87ttV739HFEmZCjQ48JTXYqXU5o8tYXvrfCUatSxghS7mhU9uvUFZpioSNYLxZQW++xsWT+PMi/zoR9bZ2b2DXdda1ljiCOrLrHqQhOP/vkLbG8mx/2ylGmJ594Vp3+7pvqL731n6q/9/7/ri6+9Efq3374X6n/aOefq3/w1/6Z+rt/8D+ov3bhJ+rDH32mtn+0rz76C/9I/c0iTP34w3+q/uGV/1P9V3/hX6nH/tgfqT/9/f9H7bzzj9XZM++r547/qh5tKqfoZY/KTRJEAQB91aHp2bU19a1H5EpLoZp2J0yLcyWCiw5Edv380NQsN+FJWK8y89AkdPIKrQ5UULfq+HkdPNNhjwk7g2Y/an077FMwdmgq1QHRkNtJbSPVmTbnvN5++H1MsN/V9SJfB0k9Q5N3n5Jj3qGplPU6tYKBL2wjZNeTr7MFCU1Z11mh6+eB2WZ4DmrRa3S+oan/PU46kIRT277xjcfVU8eeU7/+vbfUxY3/RX3/MaUeeqjwx/9I/cJjf6SOffOP1GPf+EP16MP/Rn3j39UeKfz81/9QPf7oH6qnijqlP1GuU3j81x6oc6/+VfX8M6er+5/KR5LrbZnzVe5BNDwRmgBgllZnel6PkaZ4aOo/0uQz0/Wk4LRIocnrQLkde92m37HsDhAxOqANWXca0/PGDU0NU1dsK7WN7s5ss57QuY1wj7XV4c3VIzTpwBQEnwUZafIlXqeO0JR6P7mWNTT558NdptuMl9tlOSYJTfOcntceaXrqiefUr37nd9Q75/6e+rt/8L+pv/Fb/0b9iT/2h+ovf/DP1T/Y+Wfq75QjTb//36jtHxVB7c/vq4/+4j9Sf/Ov/BP1n23/r+of/o3/Q11/8w/Vv/XH/4363R/9X+ryO/+1+p0z76rnjp8KRpq63gMlQhMAzNIKPQjC3Ic0yT1N9fKhoakU24bcZi+5oSnasZGX153rqv1253CSTt/UOow9TDc0lWL1O9qJdcZby/W+5u2Prrv5mtTh9VX3akidruzQFHmYQ2ZoqgJX+AS9rvs0jNyb5X2x1yN1LRS6QpXR+zoz07D6H4eR+/Mg+zrT0j8POq7pqFl28Kf4IIivf1M99vNPq+dP/Jr6My//ZfX+D/9LdfXi/6j+w9/6l+qxE/+f+vAv//fq3T/7n6vf+zN/XX3/1b+qzq7/gXrrNy+pv/Dm366m6/3td/6F+u7X/6X6vbf/J7Xz+/9Yvf3GVfVrRQD7hWPPq0e+8XgVmrKv7c73ijxaBgAYZqWenmenyfnBpAgrboAxT89zR3z0eu7UvtzQVNQLHhZhR5Ta4ciOQnWFroTs0GQ7cH6Hpwowwifhut3P1eZWsY7UGTLbTXeUyv2RO4z9O1jjGjc0FeuFIdCcH6ktfc6FDmsleA0r0jnrdx71NkvCa12zHariK+ygZYcmU+Y+zMGUd07PC0asGpkjEp2fxvd5nczrkDhf6ddRk66z6Huu0DzdrDskirJ/HuReZ0bXzwPTdjRkSkxAHHScfUz5keNlqClHm8rHiL/w7J9Sr53+UfXQhx+d/fvq+7/yz9X6+l9Xv1ks+94Lv6nWnjmtnv32S+qXn/0Ndfp7b6o3X91S537l/1avvvr31Z/7nb9VTcsrA1P5N5vs33UKtxfui6vr6Xl1KC++GI0CgMmt3t9pso8drwkhpbNOj5EmE5Lc9uJT8HS7eXUF2Z0kTXfiyk6bEXYia7bT6K/vM52sgF+/XadXx2pKckNTEzbavOM0r0O03NOcW8s/J13lpUQHV2Kuha76VedM6lBlh6aS/VtORlkvMtJU16kE0/IcujM4wt9p6vU6ta/dsG7r/VRy3lNd5W1NcJ1uaHLKnX2Lvzczfh4I5zYVKrNHTyY0iz9uWwenx06oX/rFk+rkL/+W+vUiFP3ad8+qUy++oZ7/pdPqyWPP1X+n6fHHjqsTT39PnXzht9Wvfu+srvuds+qXf+nlaoSpDEyD/05T8sOF5r6oWd9LBgCraAX/uC1wxAkBeq6kkaYkEyY6Onqdn7TPmBzO03RwXZxjmIrOaWSLTQoxZcD5+jceqwLPE48/U4Wfp46tVfc7PVGEpPKP35YjR1W9IhCV9ys9+fizVZjSdZ9T3/rmL9b1urbXknnfkx3NXNZzDwCLhNAErJhqxCw5wjFjvUNTbmfPhKsZjGDk6B2azPSp1Z46ZUY7FuQ1GqK6FoX9LwNRGXjK8FTej/TIN56o/l9+bwOTrVcGp7LsG0VIeuQRU88ZXXJ1h6a8DxUW7f0BAMuO0ASsEN1xT997M3MDQlMpaxTm8uL8Ac/80DThtLwlol/DJX8QQcb9WG5AkoKQLbP/j9Wx13M8SOeE0GZaHvcyAcB4CE3ACmjux1qwwFQaGJps56+z41d1auffMR8yPW+lVQFgRaYeOg9VmErQNWGp+kp9ALAg1zoAHEWEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQQGgCAAAAgARCEwAAAAAkEJoAAAAAIIHQBAAAAAAJhCYAAAAASCA0AQAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQsEKh6YS6cWdbffWFdUHdOCfVAwAAAIB8qznStL0xSmg6f/1C0c6G2hXKpuX45ufqo0/31CmhrLfnd9XFT++ozdeEMgAAAABZCE0JhCYAAAAAhKYEQhMAAACAIxqaUvc/nVS36+WSgSHKBJiPam4wekdtemWhIES12vpcvf58U35qyy1rq0NUJFRV63+8q447y9r76G/TdfOBKr4O1d3LcjkAAACwTI5gaDKh6NbJepkeUWrXH22kyYSTi5sv+8u23vHrFbpHmorwEgQaHZKEEBMJRV3l7dBkApO3v+390PbV/TIzlbHpYDcoAwAAAJbPkQtNchAyI09OkIrXHeC1veTIjGvQ9DwplDnLJw5NXe0EGGkCAADAKjlioUkOR6XdW8XyO+vqvLNs7JGmnOA07J4mPRI0tdDkTM3LDU4AAADAqjhioanjfqVphaZKEzw0ORjlhCZdx21Lm15oKr2sXv/Y3V7eyBkAAACw7BhpShg3NDmq6Xpl8GiHo67QZAOTH3SmPdIUMOsRnAAAAHAUHLl7mqRpeFGJdiYWu88pef+TGe1pBZpIaIouN8TQZEbEUqGplAhkOweHPAgCAAAAK+PIhaavnVtX98qpeDmjTX3qJpSjQ+JojjSiZEdxhCfrlfR6TqiqR32kcGSn1MVGrkxAqrdlvi+5oakIcmHbesRLCne76q7OTMXXfXXTKwMAAACWz+qEJhtwJK2RJfneptvbbh2jCmBuvWHT9XTYcaRGcurpe5YbesJ7i8qy1IiSE4QML8A5ocuWVYEo2D87LbARn0L4tf36oeM8QQ8AAABLbzVHmjBn5m81HR6oHbEcAAAAWB6EJozO3tN0f18uBwAAAJYJoQnjqaflcS8TAAAAVgehCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQsIKh6YS6cWdbffXFtrq9LZU7zq2re0W9sq52Qd04J9TrYefgUKnDA7UjlOU6tXVHffTpHXVx82WxfGFdPlCHxX93LwtlE9lX95X5erAvlAMAAADTc3RDkw1Mt07K5UPs6679/X2hrIelDU2Fmw+qM6BuCmXD7Kq7RQ4lLAEAAGBejuz0vPPXL4wyslSrRlnKQaZdufzIMCFnwtG22tRGrwAAAIA8Rzw0bahdoWyIaoRlrKCw7MYMkNXoHaEJAAAA87NCoamZlpdzf9KoocmEhPa0vJfV6x/fUR9tvRMsN57fVRc/vaM2X9Pf22l5ll3uOr75ufro4111/OF31KZTN5zKV7VVbtdso7NNp05rWuBre8Xyz9Xrz4f7uKdOufUco03TIzQBAABgzh56du17ynr68cfESktne0MOTdVyN1gFBt7fVD38IRIQqpBRhZx2mQ40Ooy0l3cFHGe9KtT49Ztw0wQbva6/PV3PCT9m215wMu1X6gBoAmHs2Ea6v4vQBAAAgHlrQtO3n1ZfFyospVhocow30pR+UEEzMlR+r0eH6kBShRFhtCYjNPllQbsFHYaCQBa2G9mO3oazXyY0hSNQrXoe/cS7iafoEZoAAAAwZyY0ralvPSJXWEozDU0d4cANRiak2BAVDR2doSlcJxKawlGgoN3o9qt9To9kdRvnqXfcKwYAAIB506HpqSfEwqW1SKGpCio6gJQh5eLmbhFwdFCpQos0vW1GoamZwieZb2jS90SNML0PAAAAmNBDT66dUI8KBUtt4UKTDhyntsogou8F0t8X4UR6SMSMQlN0pCnESBMAAACOsNV85PgC3dNkA83ma+X/nRGmIiyVwSa8T6gyo9DUmoYXMyg0cU8TAAAAVgOhSSjrK/X0vPopc0XoqEeVTHiJBpFZhaZ63zpGm4aEJp6eBwAAgBWxOqHp3Lq6Jz1GvHRnXZ0P6o8ZmuJ/p0mrAowYVtxRHh18qnDV0oSacUOTZvfP404bHBCaRptWR2gCAADAnK3mSNMcjPbHXFdBR4jshdAEAACAOSM0jcUEhUkffLD8zD1eYz28oTqvhCYAAADMD6FpTOY+nokffrDExh9x0w+UIIwCAABgXghNI6seCnFUH5E9tVEhE5zKL8ITAAAAZozQBAAAAAAJhCYAAAAASCA0AQAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJszcs5cuqes/uap2L60V37+s3i/+ff0nl9QPTsv1c5y5VrZh25TrrD57Li+oM8X39jxfv/ayUHeBPb+rLn56R3306Z46JZUDAADMGKFpBKe2ig7ex7vquFDW1/HNz1e+s+iHpjX1gxtNR1+qn4PQVPJD09d+eGE5zwmhCQAALBhC0wgITT2Zzvz7Pyy/D0OT+f7GW+rZcL3S6bfUbr0ufMG5W9bQBAAAsGAITSMgNPXkhSYzSuSEpPB7TxWaJpvKt7qC0ETABAAAGAWhKUEHmHKakLH1TlNeTyGKCEPUa3tBHTcYvaM2vbJQU1cOVXr9i5vBvSutfVyOMNYnNNlpeZYUEKrpgFV7dvqaFo7AVG2V9/+YsNHZplOnNZpTBUO9n/4+ytMQbXuLF3DeUj/+6Zfqy88+FMoyVNf95+r154WygveBQ3i9ih9E6Gt987Xw/Rlc21VbervVNjLajLZVXDevf1wsL9//wT623nOlywfqUBVfD/bbZQAAYCkRmiJ0h8zv7JXLys6aW6/UOdJUdrTcwGU7YUKIkUNRV7kQmkznrrXM24/FpANE5B6n2EhTYlSlCTjOesFoV6kJN8229br+9nQ9Z//Mtr3gZNqv1A9iiE09tFMU3bqLYsLQZK5D6X1Tqt47wjUZf085Aadez7yf3PpOuGneA2Zdd3vC+0SHLPc9Zt+vJedngvkgJDy2nYMqMhVf99VNZzkAAFhehKaIziDk6FO3FulwjRaaOj7hz2c6zV9G/PRT9aa43nB+aNKBog4kVRgRAlVGaPLL9KiTG3R0GAoCWdhuZDutoGdCUzgC1arnLZf3f74mDE3m2rTXuX/96jDiXbdGZ2gKylrvCxuagkAWtitvJ3w/xT7kEN53JUaaAABYOYSmCN0JkzpUbYNCU+QT+NFCU/1J+xjBacbcYGRCSj06Mzg0hetEQlM4ChS0Gws9er/SI1nLadLQ5Aej6r1SX/eR0GHrie8peZ1YaArfX367se2bkJQayQIAAEcKoSklvA9JmEZUyglNtrMYmlpocpY324u3u1CcAFKGlN1LbxUBxwSSsky632lGoamZwidZkdD04WfyqGLtZ+rH54T1Iqprv3rvlNfjnnq9uIb1taqvz/A9UK8z7dBUf7AQQWgCAAAGoSlTHXqE4BTv4Dnl4YjPtEeaQnUA7BucZj89TweVMoCUU/N0ECnDShlwqgA0x9AUHWkKMdJUq98f5TVfvn/Ka9F+HxkJjb+nRgxNOe+bCqEJAICjjtDUQ6wjlw46umPWCluRTl3XvUjitkwg6uz8dbS9MGxQuVT834YYM8J0Zs6hyR0Fq+tIeoYmvY+LGLImD03VNVu8b04V/9fXaPmeKK7D18r3gPy+mU1oCqfhxfQNTfvqPg+CAABgpRCaRGUnKezMRcJPKRlaTIfL7dCZ+qVWaDKdvWhHzqxbr+e05W6/7ESKHcZouFsgJqjs3iin5tlQY0JOsUx8wtysQlP9pLuO0aZeoWmFn55Xqq/RJrDra7EQCSKzCU2F5HvX6hma9nVkKr8OD3blOgAAYKkQmqJMSHKkOla60+bU9zpYQVtlWWykqeQEIc0POv62yjLdqQv3r+6YWrmdvrnTgSYMHfX9RHWwaOq1NaFm3NCk1fvicgMPI00N+0GAEFbcDwda7yFHc22PHJpKdv887ohs35GmXXXXPnWcJ+gBALASCE0AMDL7t5ru78vlAABguRCaAGBU5p6mwwO1I5YDAIBlQ2gCgFE00/K4lwkAgNVCaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJKxUaLr5QJmv++qmUD6+E+rGnW311RfWBXXjnFRv3vaLM2K+HuwL5QAAAABiVnKkSYenWQUnY3tjQUPTrrp7SFgCAAAAhlrN6XmXD9Rh8d/dy0LZtCxqaJrHuQAAAABWyAqHJqXu7wtl07KooWm/nJhHaAIAAACGIjSlVEHIuWfp1km5XqkrNJ1bV/fctr7YULtSvT7bzEFoAgAAACby0LNr31PW048/JlZaOiOEpvPXLxShxQ1BJ9XtVIhJhSYTmO5dP+EvC9rqvc0chCYAAABgIk1o+vbT6utCheWknxY3PDTpsOKFnFIqGA0tqw3YZg5CEwAAADARE5rW1LcekSssJ/PEuMMDtSOWd4gFFTNidHs7WF5KhZt6al4i/AzZZobqSYJDzwMAAAAAE5qeekIsXHrVKEv/0KCnyZl7igS9Q1PFTLWr+fc0Ddpmgv2bVTN9GAYAAACwgh56cu2EelQoWG4T/m2iIVPi+qxT1S3DkBOchmwzAyNNAAAAwGR4ep5kyJS4vqEnrD/hNLwo7mkCAAAAJkJoiti9VY4ETRCCHOXUuzAM6fb9KXq9t5mD0AQAAABMhNCUIN5ndGddnbd16gc8CNx6BR2I4uVW5zb7IjQBAAAAEyE0rTpCEwAAADARQtOqq84FoQkAAAAYaiVDk37c9n11Uyg7evQf+h38JEEAAADgiFup0GT/NhHT0UImOJVfhCcAAACgl9WcngcAAAAAIyE0AQAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCTP37KVL6vpPrqrdS2vF9y+r94t/X//JJfWD03L9VXbmWnnsjfd/KNc7GtbUD24418IPL+jzcuMt9axYf4727yul7qubUlmH3Vvb6qs76+q8UNZ2Qt24U9T/Ylvd3pbKgRn58DP15Zdfap99KNfJNObvgMX9fTLmz7PctnbV3UOlDg92nWUAxkJoGsGprTvqo4931XGhrK/jm5+rjz7dU6eEslXh/5KzvwwuqDNC3Zk7/ZbaLfZt5uFlXttdKEHHwJyT69deFurO0eUDVfRLIh2Tk+p2EXDuXT8hlGkrEZqe2VRXL3+iPhilY/qq+qBo6+obLwhlmMRzb1xRe5e31LpQNtyH6lYVnn6mfnxOKu825u+Axf19MubPsx5tVR/oKHV/P1gOYGKEphEQmnoyn5LpgCD8krO/EOwviHpdU3eaneh5hZd5bXfB6JE3cy1M1MmYln1VdUke7AtlpbFD04Ja+dCk92lP8u6mek5cJ8Kcq73LV9TmM27ZC2rz3WL52686y8Y1ndBUMsHpp5+qN8XyDh2/A/wg5KxXjyQ5vy+6fp/MUe7PM3u8NaFOn5+NOwfVxzrq7uV2GYDhCE0jIDT15P2SM78M3GkG5hfC7o3iF4n3S4HQtOq8joHpILU7TvOjOyOpaXmEpv4WfKTp9JYQeHow5+rqu0WA8QLSMoemR9Wbn/xs+GhT1+8Auyz4maiXBR+mZbQ1L90/z6SQZ4KheD5yfzbqaXrq8EDtiOUAhiA0JegAUwQia+udpvz5XXXRLQuFIeq1vaCOG4zeUZteWaipK4cqvf7FzSBMtPZxScKYDU2X3ip+Mbi/TCKhyfzSrHnl9pPJcNTKX25/Qcf0DTPVJ4fVLz27HS36S64zNNlfrnJb9pPK9vpmvbATkTxntlw6N+7r4TD7P9VAO5Du3H2mLgll/ehRJmla3vnrF6opdDFuiKpD07l1dc+p40+/a6blaRfUjWjnVAe1vLrd1t82IyqGG2bCslAYolr1nYCgO/RBuaMdosLRn60BYcC2EYag2PJCRmhKnbM6NL2xWWzD3edIaKq257Tnlefsf3ieQkPOW9tEoSmL/dlpfuaYn1mz+BBFfzgygyluzs9Zb3n9O3CCY+2cpmeC1cB7M4GjiNAUocPJ5+r15/1lm6/59UqdI01leHEDV/HL4PWP5RDTNdKUHZpMYGot8/ZjQTm/MMoOe/OLox2adFhwf+mYX7Ru513o0OsgEP9l1TckhdzpFnVb5pe+2HbHds9cC/a11YEQjrsk/PLNOmem/Uq9PBLACs3xRkLVHI0WmqpOSNeUl8yRpiDc6NC1oXaDupXtjUQQMoHp1kl/2cCRLN359zvV628LgSFjpKkMRV65nabWGlnRnfzkSFMdPMIANyAACPuh24oEo47Q1HnOnH0v6zbH0A5NOki62zIByD1nPfZ/eiNNb6kf/3SC6Xm57M+haxf0z6iZjCDZMFF8RafhjiH+8zRdlqtjKrG5N7P84v4nIA+hKaLPlLtB0/PMyFMYwkYLTVX7fugbxvxytE9NCk3jl6bb0S//Xf/iCEOT7uy7gaAifXrnBhb33+56pZFDk99OO/TVem+3/UvVn76h6f1wl2WeM3OOwnrt9gyz/+KxzdlYoenmg6J30TndJTc0BSHIjDqJD3tIhabUer31mC5mOu59p+fJQac7NFXrte4lyghbMWY0p9p/99/RurHQlHHO3MBX/rs+jnDdyPFI28/c/7FDk34v2Z//Y4zedmtGuoUPuaZkNiNNkZ/FRnXcE4bE9M8sRpqAvghNETqc5IWhQaHJjARNLTTVU/PGCE4z5oam4vvyl4cOE0HokMKRs34YQJpfvk4boVFDUztcRH8RDthuq61WGBRCWu45a7W1vMYJTaaD0fnJc2ZoCkeChoYms71y5GqM4KRDTUcIKA0MTXInviv8xMp7hDxBfaxdx5sMTRnnzA1NxfdlfX3egv2PbSdyrnP2f/SRpuqx47MJSzXzs2gRR7EnkxGaJjzm7nswAfRBaEoJ70OKTG3LCU1VHbctY2qhyVnebC/e7kIJQlP1S7MKB34IaKaEydodfjMNLfWLaFFDkylvHafXVhCSqnX8gJR9zpY6NNlHIsf97JO3hPVSFjU0lfrc/9RNd7SbDrkYZrJCkw47blta2InvCE1mW+12jIGhqdm/cH8CHaGplDxnQWiq2qtGm/zQFLYRap/r7v1f/tBkf2YbsQ+7ltL0R5oITcC4CE2Z6tAjBKeu0KTXDUZ8pj3SFKoDYN/gNOfpedWyMgyUnf/MkSaRWffGBfV+9f/IL6NFDE02MAUdBqktd7vVv8Nt5Z6zpQ5NvtUeaQqYdiYNTprp1Bcd81ag6QxNpkMfTKmTO/EdoamzfAhzbO9uqQ+q/yceI54RmhrCOQtDU1WnbM8PTYO207H/yx6a9GhL+XPI/PxekZ9JWvD7LLssH6EJGBehqYdYOEoHHTPaE4atSGjquhdJ3JYJRMnQVBrtPqcpa4UmHQB2L73s/yLpEXB0mDBhwQQC+RO+9Kd/ueTQlGg7cSzevjvL5QCmt2E7Ga1t5Z6zvqEpEuwWwWzvaTKjPt6DGXxTDU2lRFvVMVSHIf1hXknQsa91BJkqALRDldyJj20jtzzU3MgfuydF74cJKGZf08eSG2ZKwf62QpPe/tU3XhXrpUfvtOz9773vC8T8DAp/3idnCoxkVk/Pi/1s7/O7LaXrZ5b9ecCDIIA8hCZR+XQ7eTRHnKKXDC3Ck/LqUR8hNNl7kWJPuTPr1us5bbnbL8NV2LYe8eo70jQH5heG3+Evw0ARnIJP3/QnkR0jJ0JIiq9nP9Gc7BezFJr0NiPtpn5Jtva/+dRVGrWyn87GttXnnOX+0tbHG9/mPI0VmvKenhd50ENYPlZoKsrCUS39JD6pvnmaVvkldqSKIBSOWAgdfs0Eg9gohlnPDTrNPTjtdXRZonPfFWxczlPBxJFBoa3k9pPBI+OcieewDJ1FcArCYOd5KPXZf+F1mMSlz/QMg1sfyuXj0R/+hD9P7M8Z8YOn0TShu3tkeVLmOL2f42bZxB9Adf0h7q6fBwBChKao8H6g9EiOHgFy6nsjUkFbZVlspKnkBCHNDzr+tsoyHczC/aunFFod910tDDE0OWEg+GXSdNgd9pdQ9NNJ+0tZCg+2rNH3E7/kPtXa22nInQWr3J/qfAihqfUJraBz/3qGpvo8T/yLfnyjhabE32nyhfcY+dP1skJTPc1OEKzb/htRkUeXFzpHmmwn29E5BS9W13TurbKTH58uZkOYX9+rI+ybHDASI011G+E+2GOx7bWPrRYJSW4d7zyY8vB46hAZBBp9jvz26m1m778jeB2iQTfDbEJT86FQ++dPqmw8sxpp0pwPwYxRQmHGhzz2OIsjZQofkIHQBEyBDiVzGnXpG3iQTXcyukebAGB+Mu/BtKOyUx9RA1YDoQmYgnmGpugIFEZgprQwnQXAgsr9cEePPPMhEJCL0ARMwbxCk95ux/1KmAyfzgJYVNW0vPTUwnpaHh/+AL0QmoApmHVoah7+QGCaiapjwn0AABaJnpaX/3RMAH0QmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACBhpULTzQfKfPGX+gEAAACMYyVHmnR4IjgBAAAAmNxqTs+7fKAOi//uXhbKAAAAAKCHFQ5NSt3fF8oAAAAAoAdCEwAAAAAkEJoAAAAAIGE1Q9PD++o+oQkAAADACFY0NO2qu+VQ0+GB2hHLAQAAACDPioYmY78cbyI8AQAAABhutUeaHuwLZQAAAACQjwdBAAAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITAAAAACSsZGi6+aBITOq+uimUAQAAAEAfKxWadFgqvw7V3ctyHQAAAADoYzWn5wEAAADASAhNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQQGgCAAAAgARCEwAAAAAkEJoAAAAAIIHQBAAAAAAJhCYAAAAASCA0AQAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQtORsa/uK6Xu70tlAAAAAGIITQnnr19QX32xoXaFsuWyq+4eFonp8EDtiOUAAAAAYghNCasSmm4+KAKTuq9uCmUAAAAA0ghNCSsRmi4fqHKQiWl5AAAAwDArFJpOqttfbKt710+or21vFGFnu3Z7O6x7Qt2405R/9cUFdeOcLdPtuOv7nBB1bl3dK5aF7e/eKurdWVfnzfdN+Aq269Sx2y3b0vVtvclCWzXKxLQ8AAAAYLCVC01h0NABRAhFt06a76U67vJEaOkVmvS+VaGuWh7uh7P/9TITsrxw1Yd++MPhwa5QBgAAACDH6oWmMGAEwUYOQiacOEEqXtfRMzSl68n737kPKftVZFJ3LwtlAAAAALKsXmgKgo9PDkelMOiUxg1N7ZEsn97/ZiRKmyQ07RxUdzPxAAgAAABgAkcsNJk6MYQmAAAAAAFGmhIITQAAAACOWGiSp+FFVU/hS4QdMTSZ/ViA0MQ9TQAAAMDkjlxoskEna7Sps264TfN9aRFCE0/PAwAAACZ29EJTxQk3jnCaXSX4m0+tAGODlVG2UQWdhQhN/J0mAAAAYFIrFJogunygyjubGG0CAAAAhiE0HQHVaBP3NgEAAACDEJqOhF11txxu4kl6AAAAQG+EpiNDPxTi/r5UBgAAACCG0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQQGgCAAAAgARCEwAAAAAkEJoAAAAAIIHQBAAAAAAJhCYAAAAASCA0je6Yem/nrLp58Xi77MwpdfNaUbbzonopLJuLE+rGnW311RfWBXXjnFQP/a2pH9y4qq7/5JL6weni+x9eKP5dfH/jLfWsWH/RLPv+AwAAjIfQNLplCk2O7Q1C06iC0HH6LbVbho5rLwt1F9Gy7z8AAMB4CE2jS4SmRbZIoencuronjnyZkbFbJ51li+vMtTJ0XFBnyu+XMHQs+/4DAACMhdCU7bi6cu2sunJGKnMRmiZmQtO9OxeCgLTEoenhl9X7RejYvbTWqreosvZ/7UW1l/W+AAAAWF6EphymY3jz2im1IZRvXCzLAm5ostPypDJDtyG1r8Pa0BB2/noRPOp7loogcv2EWK8zNNWjP5ZcN9xeLODs3nLqFLz9sqHp+rq6/cWG2q3Xk0NT2JZXXrVV7uvJoq2yXO93vc6ddXXeaetrD9t6lrv96dDhROCN6tjpcg0vwFT3HBUBx44IVWHHWSccIbL3KFkTjCDZ639v45hYDgAAsOwITV2S9yGZUSWvLDXS1H2/U+sT+2r5K+q9tWB5J/uQBz/cnL++IQejZGgqgkQQLnToCNsuA1N72e3t5vuSXtcPI7u3nPXq0HSiqtsEqnZoarVvw52tY0JTOWp145xevx7BCo/Z2a5tT9rXMfmjOQUTZsIRnTPXzL1FsXrV95fU7o2yLTMqdKP4vih/9tIlbxv6e7c9XX+S4PTSxiv6fTIw3AMAACwyQlOC7QhGP0EXA83A0BQZUao+xR/y4Ii+0+361o8FjNbITShjip3bdvnvus2MdQte0DFt6XVskDRl1TFv16FL3n898mSPc+fgUMW/DtXdy+66XaQpb2Z0qPMpdUE9L0SZEGTK/JAUmWZnQpcXzPpKfsAAAACwvAhNEXbKUepeDTnQDA1NNqS5U/R0kBoy7SkvwDj6hqYgTJTqqXkd29WhphALP0EgK+vrYJMXmvR++KHJW9/unxea2sej5W1zEDOVTgxNGaM+1SiVF5r8YGTb8EJTLByZfXn/h8HyvjqmsgIAACwjQpOk7vjNNjS1bqqvPrkf0vkc0NHvCE11IAq0QoYJIrXIPoTtee0Eoalqswo60nGF9yBZPUOTHZGKmUZoKsSm57XCS32vUqBnaNL/DtpwjBeauMcJAACsDkJTQtd9GqOHpqC8aj9aN23MkSYbcHTwsGIjM43OEaWKCTJuW2FoquqU+xaGJhOYguMcd6TJN+70vPbDHcTgEnnc96gjTWNgeh4AAFhRhKYuiY5gezpdwdYfFJoK9ehS7iPOZTo49JhuFw1NQdCo5YWMvPAWhKFWaNLHc+/6Sb+eF3oaw0JTGMhmIDPA+PckNQaFprGm4QV4EAQAAFhlhKYcsfs0zPJ6GlL1/Stqb/BIU8mEpYtFeJroE3s7bc2EB2PI0/P0iJFT5kxl80eD/G3V++AFkWJZGKLCkCSEJt1W+RQ8pz27H0779ehW79DUfN8VBEeTG2CqQOTe++SMUPUNTcX3ekpgO4QNZe//YzoeAABYVYSmbJGRHzuyVNGhKpxWZzuVEmkkabxOqAkJVYjQvEDghJ8WL9iE7ZSBRBppskGtIQYQYbveaJEYmiLT/UzQscp1ho00GeI56TFi11P0HiMbhiL1yqA1aKQp0l4l2GaW8D48AACAFURoAubEBpfce5gAAAAwH4QmYE5aT86r+SNFAAAAmC9CEzAnsZEmHabGf1gDAAAAhiE0AXMk3lskjj4BAABgXghNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoWnAbF8+qmzsvqpfCsrUX1d61ouzaKbURls3J7q1t9dUXjdvbcj309+ylS+r6T66q3Utrxfcvq/eLf1//ySX1g9Ny/WWkj/GCOiOULaIz14rX4MZb6tl62Zr6wQ3ndfnhheo18+sAAIBlRGhacMsUmmrn1tU9QtOo/NBkO+fLEzByrFxoOv2W2i1D07WXvfUAAMDyITQtuGhoWmQLFZpOqtuRka9qZOzOujrvLFtYZtTi/R+W3xOaFkE7NJll9hgITQAArAxC05xUYejicbHMRWialAlNdy6oe0FAWt7QJHfYl93KhSYzjVKPDjZ17CjxlTPOMgAAsNAITTN3TL23U06rkztNL228UpV53NBUT8sTyqwzp6oyqf0qhA2d0re94d2z9NWtk3K9ztB0Qt2447RTuHf9RLueaaept6F2wzqF89cvOHUK3n6Z0HRrvdjmBXXjXLOeGJrCY/S2qfe73Fd7/1a13/U6fvvt4wzLp8DeR9PihxHduXe4oyHVCEk5xcy/d6pepxXWbD1rWPBpQpPfXit01HWdbYqjOXZErhG21WwzqCsE0tY2I/Vy6PfhWbW3cUwsBwAAi+WhZ9e+p6ynH39MrISxHFdXqrDzinpvrV0uBZrUSFO8zGynNZKllw/pqNmQ4AWhIiyIwagjNO3eCsKDCR1ecDJttJYFQU0HJr+9clmzbRuaTuq6zvqt0NRq34YeG5xMaCpHrYr9qtor/12V6+00+9ts17Yn7euogtGoOswEHfuy89/UKYTTyExo2r1RhiUdJsp/V+XVNsw9O866bhjxR1vyVaGk2E7ZXr1/rWOSpibKx3nmmrOfJdOWu69uEGqWm/acICYdU7VsYGgq1R+QZIw4AwCA+WpC07efVl8XKmAkdoQoNtUuMmVnWGiSA5gegZIDW1JHCGrpW9+GEzfAVEGqO2B0T7Fzw0v572bkqHvdggl0+lj8EKVDkC3zQ5Iuc0epnPVtkNq/r1Jf9/fddbtJnXgdCoLwIPBCgReigpAShBg5OOjQIY0QpdgA4wU6u327jTC0Wa1wJQnaKsjbDI7LnI9knaHMqHD05wIAAFgIJjStqW89IlfACGzHKPGJsv7UuT1tbmhokkJYsn6CHAASeoemyKhPGUI6gpMNLvHw0w4zdjQoKzR5x+KHHr1tu3/udoJw5Mja5iDtQFDSoaB71Mer54UEKbTYslg4MuuIU+biYvvqBjov3HnygloYdPQ206EyuV+ThqZSPeV2AZ+ECQAAKjo0PfWEWIgxNPcwzTQ02e3W29RT84bcfN67o98VmupAFGhtwwSRWiS41fcUGV5Y8UOT3rZuRzquapnbltEvNIX7HZhKaCq0Rlva08y85S09Q5MdkYpxt2vW82QGPHd5PKgIxxrbv4UNTdzjBADAonroybUT6lGhACPr+DR5/NAUtFmNdg37JHvUkSYbmIJRmM5gVgej9H7UoaduPwhNpk65b+E29brByJZ3LJOPNHlGnp6nO/dBQIgFplRgmXikaZiccNIVmup9sYEpOP5w/bmHJqbnAQCwFHh63kwlHgQh3W9kg9bA0OSOLlV1h95w7t3XkyERmvyg0egMTaVB9zm1Q1PVTvF9Z73SoNCUeTyjygwwrdEobVhoGjYNL0YOJ8EIUrX92D1NzfJYGBoSmsRt2lA2QWjiQRAAACwPQtPMxR45Hj7xzjzpbqfoWA0OTTYsnSraGvAAiJoJC2FgKcKHGKRSI00mgDVPmbNt+yGjDCTh+nokyB1pKtcNR57C8COFoXK98u82udu0++G0Z/a1CYymTkZoio2oTU9mgBFGYKogUS7rHZqa78cYbZJCk943d1mwP5UgWJVa+2XWK+v1DU2t9k1ALZ8oODA0Ve/L8v3NdDwAAJYCoWlOxJEf594GO+pUfRrtBKP602mB2AEbcfqPDi0OLxCY0CDyg40OG015GUikkZnW9sSRm/Z2vceUi6HJ2QevzaCtsmzgSJPYniGGyTHYQNQShAITKKwyWHiBpU9ocuq7bXYHEYHUjhhKnABkSKFNH1NTp9znQSNNJW/fdP1q3SGhybzPh9xfCAAA5oPQBKwC26lvjTTZgBFOewMAAEAuQhOwCqQRIKM9xQ0AAAB9EJqAVRAbabJT8VojUAAAAMhFaAJWhXhvkTz6BAAAgHyEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNGEBHFPv7ZxVNy8eF8oAAACA+SI0YQEQmgAAALC4CE0ryYSQa6FTakOsP2+EJgAAACwuQtMKeGnjFXVz50X1Ur1MCiE2SC1icCI0AQAAYHERmpbcxsUyCJ1VexvHnOWREHLmVFH3FfXemrOsYNuw/LaMtRfVnlOn3Y6zzaCu1F64zQqhCQAAAAuI0LS07MjRWXXlTKSsMzQdV1fKsOKOUtnA461b1PNGsmzocdtq9sdbXm3T3UdTr3NkDAAAAFgMhKalZMJOdKqdFELMOs6yalqf0IZe3h6R8phw1Ywi2dAUtqe3W9cTR7sITQAAAFhchKZlY0eCgpEfnw0wAWl0R2rHbKM9guUKwlCqPUc1QtWqQ2gCAADA4iI0LZn6XqCc0BSEEH9KXSKotEaR7OiT2baD0AQAAIBVR2haSnZ6XmwKXSyEuFP0ukOTHWmygckfeWKkCQAAAEcDoWlpmaDRCjNOWSQ02aCTvqfJLo+FoWGhSdymeVgEoQkAAACLiNC05Ox0PXcqXSw0+dPzSu7Ik1kmTM1rrWfvq/Lq5YWmVvvV96+oPTHkAQAAAPNHaFoB1eiNF1ZMgDHBpiYGGhOcHNGRq7pOOVI0bKSpYkeW6rZMMCM0AQAAYAERmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITcAEdg4Olf46VHcvy3WAIW4+MJeWuq9uCuUAAGB2CE3AUPv3iw4tYelr59bVvS+21e1toQwT0+GJ4AQAwDwRmoCBqs7sg32x7EghNE3X5YMimhPOAQCYJ0ITMMiuulvOzCM0EZqmrQpNSt3fF8oAAMBMEJqgdm9tq6+KTq917/oJod5JddupYzUdZV0ernv++oWi3obadZZ97eET6sYdv534ekHdO+vqvFOvsr3RlJdunfTLK+H+X1A3zoV1+sgMTcl9yz1nTr2gPTeojHnOqraq9fzz5u5reN2EhoWoV9UHlz9Re7UravOZdr3n3rji1DHe3VTP2TrPbKqrxbIPTvvrrb8d1Cud3gra2lLrbvnDL6jNd4vlb79at2vrXn3jBaeeU7euI+9/2E57mw5CEwAAc0doOuJ0x9cPNbu3gkBhRhK8zn1rdCE/NLXaNx14d129nu58N8tNB97p4Ot6bnvtOtFlUpjI1h2abKjwwkNxrP3Pmdn/SrM8PPYxz1nTllPPvE6tMDTaSJMJTGU4cZcFIacKPkHIaIWh3NBU1vO2Z0OP274bhJwQZMJWs432/utwFwQns29e4Grth4PQBADA3BGajjQzIuGFibaq8x8GjAlCU5vZD2cbttMedsT9fZG3qTv3Tmc/q1O/r8rHOkS/WuGoIzRlbTP3nJlQ0/EajHnO5LYi644VmiJBx9MnDOXUk7TCkBSkSjok2fCjA1JYxxmlssuq9iMjUCJ9bRKaAACYH0LTEWdHQ+LBKbejnBsAZGEw0+u5oyGCMBxZkX0TR0mG6vj0P++4c8+Z2f+OcDvmOZP3P/daGKqZmhcLTnIwGTk0tdY1wSe5nhCOjNi+5QcnE9APD9SOWA4AAKaN0ATTQTbhqdUpzu0o5waAglnX3WalZ2gK9zvkd+LD+6g6wkWMCUtdHVhxdK5l9qEp95y196E07dBUcqfCtYPFNEJTtazeXqNfaGoCn6i1bli/fUwt1SPuu689AAAwPkITHE2waDrGI4cmG5iCADDqSFOXOrS56/acnrdqI00Bef9nEZocwojM2KFJByb5nqOxRpo61Q+iaB+XxpMaAQCYN0ITAuF9TvJ9T3ZaXzo02RDWdL5jHftBoWmSzvrEHf2OjmwVTrrazztno4amzOPuFZqiy0PmnBVf2ffnhAFGuh/IhqvO0GRGd+p65vsw6AwKTfIoVrbUfU48CAIAgLkjNB1pRWc3nEJmOtVuBzjsjFff37kQdL5NZ79uz3b+gwBgwkTTvlOvb2gq6PDWUa/YZtihz20/ruvTf3tcwTaKfel9zsYMTYWcc6bbyg1Ndr/D+gE7tbH8ks5bERzCR3i3nz4XBh39/dV3i3peYJHr+VPl7FTArWaEpx716R+a6vDWMdpUHpMf5uyIl7MfLkITAABzR2g66kxI0h11TRqFsCNLlbLzLo5YmM69UXWuq5Dkd6Z1h7ypV7YxaKTJCNurBGGwXaejg98pb8qUd95KreCTc87GDU2lrnOmy3NDU1Pmtte+jrpHmnRI0qFF22oHCRtOKjpQiaM8Xj0dgqr2pXBllWUDR5q0oD1DDkmOVNuEJgAA5o7QhGEmnt627PJCE2Zjoqlxi47QBADA3BGaMMyRD02PqpsPCE2LgtAEAACmidCEYQhNaueg7MoeqruX5XLMziqHpiqcq/vqplAGAABmg9CEYQhNFR2cyi/C0zytYmjSYan84toCAGDeCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQQGgCAAAAgARCE2bshLpxZ1t99YV1Qd04J9Uztjd0vTvr6rxUnqNqo2M7A+0cHCr9dajuXhbqnFtX96rj3FC7YdkK2L3V57VpXvvb21L5iJ7ZVFcvf6I+OC2UzZK0H6e31F6xrPb2q/46U7D+trO9Qvq8vKA2382pl2La6H1su+pu8ZY6PNgVygpdPw/27xfvxfvqplRW2y9qmK8H+0I5AABthCbMT06YWeTQVHXQImHJWurQdFLdLvb93vUTQplGaOqQ3I+hwWICWedlfqHp5oMyySRCT+fPAx26itSldsRylwlPBCcAQAZCE0amO9pVx8aIdrqnFWZCU9pO1cFb6Q7X2KFpho5YaHrujSveSNLe5S21LtSb3Xnpf2x61LbjQ4gs+WGo2mZWwAIAHHWEJozHfgp866S3/Pz1DTmwLHVoMp9oL1JoOvep+tmXX6pbHwplgxCaJjb10GRHha6ozWfc5a+qD6R2FzY06aATnZbXVzUKrNT9faHMoYNa13Q+AAAITShUHd8y7BhhJ/n89QumY+yPIvn1TFkQmJJSYcYGMCvZbsd9UsJ2qmOq6g6dNtcRmuppecaMgsWlz75UXxbB6WefvCWW52jOjcx93evQFByvP/2uz31s4UjlwLDrhAPvfp53N9VzYd3wHqPWKE0RQIrlZVv+iE5Yr6nrtzc8NIUjSFffeEEoDwNTQk6Iq7eXbje9b9KxNecmPI7O8NLr50Epb5oeoQkAkIvQdKSZDqrbobedX6dT0nSinQ6s6cTUnePw+xxCmGkzHe5YJ8nurxdKinVuOd8H27HHkxpB6ZY/0jTr0Zg3P/lZFZy+/OxDsTxf5khTef5b5zcSRpOvuRS8i2VDzp0JB1WHvu64606712Ev63kdexsctpxA5AShuq6p54Yws81W+8WyIaFJhz1nP1rtC/vQJbk/jipIxkKTPUd++XNvbDnfh8dmz6F7Xq0+o7YdPw8cOdP9CE0AgFyEpiMs1rnVy9shww9Efodad557jtqMEJqyAom7nerfUhBwnqglfbU6dLMLTXUIEv1M/Vg6fx9+pst/+ql6MyzLlhuagtfQBFkxQKde89R6fZlwEAaSKoh0hQwz8tQEC9PhD9bTIy1bdQgQ2x4amiLredtshagMY4SmZKCy3GOzIas5V57LB0W06Z5Kp+WHpqx2s562BwAAoekIM50PqTMfdF7lcLUIoam7U1+x27keC0wD9OjoTRqaBjP3OH355WfqklTeKTM0hcc2NDSZ7bUD+gCRcJAVmlrrCiNUBT80yXXSISUemsJAVnMDy5xCU9Y5rI9tMx2YSjlPoaz1CE0590mZ9/Fo91IBAFYWoenISnQ+TKfXdpYXNjTljkxU29Gd8Yk75KaT1eeJW/MPTUPvcZp1aCqZ17t+vbquj4geoalaVtQNzTM0xfZJm2doiu+zz44uGamQNc/QZOhHnROeAABxhKYjKz+M5IQmeQpfh0lDU0anvuJsR4c7aT97Ts+b4UjTwk/PGzU0OUw7g4JTZmjS4SQIB611F2ikyaO32T3q45g4NMnBs805NrPN6DoLMNKUNzUQAHCUEZqOMDkMtZfnhKa6g5vVmTEmDk2mrCuQeNsx6wzpiHuOwoMgujuoUw1NpURbydGBrNBkQkcYWgaFJjkA2RGjvqEp776hSOhLGSE06ePu2mZwbFV7kWPtFVx6hKaMdnkQBAAgF6HpSNPBx+uAmE6qO7qQFZrqeu0OzWR/p6mjk1S1EZYX6ySenlcftxAY8y1maBrjkeOuat8Tr9GooakoC0e19DUl1XdGBqWpklmhyXTs3REd27n31s0JTe0wUX3/7pVESEmEJmnfRCb4tUJMsVxqd4TQ1GzT37f00/Ps+ZGmE/L0PADA4iM0HXk2QDTCzm5uaKrYESeHV0corzmdb91Zl7U64602g0621FGv14kHgrR0R68OkILWORvL6H/ctmQ6qZH9zwpNma95qX3e4sF28pGmkg0ARlk2aKRJsyNLlSow6HXd/fDqBMT9DesJYahdz92v4Bg9Tj1z3GK91tQ6G+oa/vmRA2G9n8HyrvDS6+dBJS+IEZoAALkITcAgfT4dB5BmRg7Hej9l3idFaAIA5CI0AQNVIx2EJmAUOsAUEWbihzLkBzBCEwAgF6EJGEh3uHKf+gWgi55yOcl7yowAZ/1JgJFHtwAAK43QBEzAfjpOeALGoEPP4L+XVE3L6xo56niICAAAAkITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaVsHai2rv2ll15YxQBgAAAGAihKYV8NLGK+rmzovqJaEMAAAAwGQITUvvuLpy7aza2zgmlAEAAACYFKFp2Z05pW5ee0W9txYsZ8oeAAAAMApC01I7pt7bOatuXjwulD2qNi4WZYxCAQAAABMhNC2zjNGk6n6nok4sWAEAAABIIzQtsewHQFRT+IrgxMMiAAAAgN4ITUur5wMgzKjUzWun1IZUDgAAAEBEaFpW1ehRjwBUhybucQIAAAD6IDQtpfQDIFqYngcAAAAMRmhaRj0eJ86DIAAAAIDJEJqWUPUo8YxRIx45DgAAAEyO0LR0Mh8AwR+3BQAAAEZBaFo2fR8AAQAAAGAihKal0vMBEAAAAAAmRmgCAAAAgARCEwAAAAAkEJoAAAAAIIHQBAAAAAAJhCYAAAAASCA0AQAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdC04DYunlU3d15ULwlltbUX1d61s+rKGaHszCl1syjrbAMAAACAiNC00I6rK7Ew5CI0AQAAAFNDaFpgL228UgSeU2pDKPOkQhMAAACAiRCa5qSadnfxuFimHVPv7XTVMaYemvSI197GMaEMAAAAWG2EppkzYagr5FTT6l5R760JZSbEVNPuHF57dlqe1QpfZj+kaXsmhLkhSY96Se0AAAAAq43QNFM27MTCUCP6AAgh0KRHmuIjVjoItfclOi2Q+6MAAABwBBGaZsUEm7zAEX8AhBimBoYmMYB1TQu0x5FzrxUAAACwAghNs2BHaDKntsUfABG5t2hoaCq0QliyLSt/xAwAAABYdoSmqTOhJTs06fryQxfGD03hvVNVYOscDbOhKfeYAAAAgOVFaJqV3GltGQ+AGDU0eW2mApuRexwAAADAiiA0zVT3tLboAyAqcgCq1hkcmpzRpSoQJabc8SAIAAAAHEGEppkzIUYKOckRIy184p0OPK9MMNJUMGHpysWirUg9vd2OdgAAAIAVRGiak2p0KAggOph0T3uzI0tNiNEjWG5o8uoE2uEqEeQqkWmBAAAAwBFAaFoYOrgQTAAAAIDFQmhaFMkHQAAAAACYF0ITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQBAAAAQAKhCQAAAAASCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYSmBbdx8ay6ufOieiksW3tR7V0ryq6dUhth2Zzs3tpWX33RuL0t10N/z166pK7/5KravbRWfP+yer/49/WfXFI/OC3XX2qn31K71fFdUGek8t7W1A9ulO019HmU6kb88IJe99rLxfdNe+//UKgLAABWDqFpwS1TaKqdW1f3CE2j8kOT7bSPFSoWzKihaaRz5YWmR9WZa2WbKxpaAQBAC6FpwUVD0yJbqNB0Ut2OjHxVI2N31tV5Z9nCMp12PbKx4qFpTCaA9R5ZCgXtEJoAADhaCE1zUoWhi8fFMhehaVImNN25oO4FAWl5Q5PptN94Sz0b1oPPhJ2Jp9EFoUmP/IWh9bi6cu2s2ts45iwDAACrgNA0c8fUezvltLqz6sqZdvlLG69UZR43NNXT8oQy68ypqkxqvwphQ6f0bW949yx9deukXK8zNJ1QN+447RTuXT/RrmfaaeptqN2wTuH89QtOnYK3XyY03VovtnlB3TjXrCeGpvAYvW3q/S731d6/Ve13vY7ffvs4w/IpsNPIWvwOvh4pcZhpZ5UqIJSjKP69U/U6rbBm61kDR8BMMKnbEUOh3lYZguyUxeQ2c0JTuN0JRvDq92/GByIAAGB5PPTs2veU9fTjj4mVMBb9SfTNa6+o99ba5VKgSY00xcvMdlodt+GfhNuQ4AWhIiyIwagjNO3eCsKDCR1ecDJttJYFQU0HJr+9clmzbRuaTuq6zvqt0NRq34YeG5xMaCpHrYr9qtor/12V6+00+9ts17Yn7euogtGoOswE4aMMG16IsKHBBicTmnZvlGFJTwUs/12VV9twpqWZdd3pbzpcDQ8epfhImhPQ6qBnpivW9cMQF2r2zQYv93zo/Z9g6p350GLpRogBAEBUE5q+/bT6ulABI7EjRLGOlCkPR4eGhSY5gOnOnBzYkjpCUEvf+jacuAGmClLdAaN7ip0bXsp/NyNH3esWTKDTx+KHKB2CbJkfknSZO0rlrG+D1P59lfq6v++u200KGjoUdAcAL+h4ISq4fyprmqAOLZPcR9QZmsTjFIKaORZ5pCm2n2Yb7uhbX4v8oBYAANCbCU1r6luPyBUwAvvJc2LKjp7W0+5gDQ1NUghL1k+QA0BC79AUGfUpQ0hHcLLBJR5+2mHGjgZlhSbvWPzQo7dt98/dThCOHFnbHCQcbdGiYSLg1fOCRtCuF5piocOsM0Ho6ApN4TYHhabWyFwjvv0+0iPLAABgeejQ9NQTYiHG0NzDNNPQZLdbb1N34KT7nLr07uh3haY6EAVa2zBBpBYJbvU9RYYXVvzQpLet25GOq1rmtmX0C03hfgemEpoKsel5rfBilrf0DE12RCrG3a5Zz5MIJbMLTfIoXLX9jLCZZkNT+r0PAAAW30NPrp1QjwoFGFnHdJ3xQ1PQZjXaJW+7y6gjTTYwBaMwncGsDkbp/ahDT91+EJpMnXLfwm3qdYORLe9YJh9p8ow8PU8HByeUlGKBKQgk4440TW4hQlMi1HVieh4AACuFp+fNVGK6jnS/ke14DQxN7uhSVXfop93efT0ZEqHJDxqNztBUGnSfUzs0Ve0U33fWKw0KTZnHM6rMAOOFnsaw0DT5NLyYmYSm6DmbMAzyIAgAAFYOoWnmYo8cN4EqmE63t/PKBKHJhqVTRVuT3FdhwkIYWIrwIQap1EiTCWDNU+Zs237IKANJuL4eCXJHmsp1w5GnMPxIYahcr/y7Te427X447Zl9bQKjqZMRmmIjatOTGWBMiHDr6alopb6hqfl+cMCImE1osuv5o036fAhtZeCR4wAArCZC05yIIz/1lJ6SDjlVJ8wJRnWnTCA+SnzET711aHF4gcCEBpEfbHTYaMrLQCKNzLS2J47ctLfrPaZcDE3OPnhtBm2VZQNHmsT2DDFMjsEGopZgCpoJOlYZQIaNNBnidruf2BfS+xC2ozUhadzQVGptVwxrOcwHHfxxWwAAVg6hCVgFNri0RppM6Bk4cgIAAABCE7AapBEgY5LpZgAAACA0AashNtJkp+JN4WENAAAARwWhCVgV4r1F6ft5AAAA0I3QBAAAAAAJhCYAAAAASCA0AQAAAEACoQkAAAAAEghNAAAAAJBAaAIAAACABEITAAAAACQQmgAAAAAggdAEAAAAAAmEJgAAAABIIDQdJWdOqZvXXlHvrYVlx9R7O2eLsrPqypmwbLp2Dg6V/jpUdy/LdVbZ1I8/+pr7Ni4Wr//Oi+qlsGztRbVXXBc3r51SG2EZAADAEUFoOkoWLTTt3x8lLJy/fkF99cWG2hXKeju3ru59sa1ubwtlU6TD0/jBqQpDF4+LZS5CEwAAQByh6SjJHHWYlZsPipzwYF8s62MVQtPXHt5XZYS8vy+VDWQCT04QjoYmAAAAEJpWwUsbr+R1eKccmqr9yB6R2FV3y8EVQpOhQ9Phwa5QJqgCUfq17PN6TDs0EcoAAMAyIzQtuaozeu2s2ts41i6vp1a53I52My2vXWaYNqT2dafcXee4uhJrpyUjNJkA81XNDUYn1W2vLBSEqFZbF9SNc0357i23rK0OUZFQVa1/Z12dd5a199Hfpq9HaKrCb3GekyFEvxbidVHQr5372gfthdeOtC2zH9JIlr4uncBWt8c0PwAAsHweenbte8p6+vHHxEpYRB33IUkd2tRIU7TMbKfVaTbLW/fL5N4f1RGaTDi5d/2Ev+zWSb9eoXukqQgvQaDRIUkIMZFQ1FXeDk0mMHn7296PRl5oqsNO131Kide6FWjsskgIi5eZkNzal1hg6xOqAQAAFkcTmr79tPq6UAGLyHY+Y5/aRwLNoNAkjSgVzMhBLBglR8AqHaFpe6NjZKYxaHqeFMqc5ROHpq52WvT5SIUme07TYVSr6krBKvK6DQtNdp+C6zB1nWWHagAAgMVhQtOa+tYjcgUsGDvNKdKJdeu0OqUDQ5M0cpBzv0xyVOTygSozU/TBByZ05ASnYfc06ZGgqYUmZ2pebnCqHoyh7qubrTIbNGKvTyARaGOv29DQJG0rWd/QYSsVqgEAABaHDk1PPSEWYvHYzuZsQ1PYEdad+K4Obx2a3HZNWFKHB2onqN/WBA9NDkY5oUnXcdvSpheaSifUjTvu9jJGzuz5ccNT9doE5zGhOu+R62P00NQa1dQBu2sUqb6OO4I3AADAInjoybUT6lGhAIus496QKYQmr7xqP92Bt53iaLDqGmkKVdP1yuDRDkddockGJj/oTHukKWDWSwWnaqQpESY7z2mlPSroGj80BW1W10kqCDE9DwAALB+enre0Up1PqePcMcWrKzQ5o0upkYz8TvGAR47H7nNK3v9kRntagSYSmqLLDTE0mRGxVGgqJQPZSA+C6BN+7TITsoeGJnd0qaob27eusA8AALCgCE1LLjb6oJc3n/jrju8r8RGiztBkp32dUleKUCQHoj6d4nRoKkeHxNEcaUTJjuIIT9Yr6fWcUFWP+kjhyE6pi41cmYBUb8t8X3JDUxHkwrb1iFcs3I3xyHETWKOhpWReo2A63V5xbQwPTTYsFddG7LW3wYzpeAAAYAkRmlaAPPLTjPjUoSqcVld3ZAVSJ7mj4+tN0+rUPdKkw44jNZJTT9+z3NAT3ltUlqVGlJwgZHgBzgldtqwKRMH+2WmBjfgUwlH+uK15fTqnvXmvu24jvIbqES2BOPUvGuS0nOAFAACwqAhNmJMB0/NWWs/QJJDDMwAAACZFaMLcVA8+IDQZk4YmM81OGgUCAADARAhNmJudg3Ko6VDdvSyXHyWcCwAAgMVFaMJc6bBQfh3NwNAcf4/HrwMAAGCmCE0AAAAAkEBoAgAAAIAEQhMAAAAAJBCaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQQGg60o6p93bOqpvXrFfUe2tSvQH27yv7dX9fKF9iNx+YA1P31U2hfFIbF4vXYudF9ZJQlnTmlPNaFi4el+sBAACgF0ITtKrDPVJounygDstIsWJhKaTD09jB6bi6UgSeK2ekslwmDBOaAAAARkFogjZiaNo5KCLT4YHaEcpWShUOD9Xdy0LZQC9tvFK8DqfUhlCWj9AEAAAwJkLTCqg62kOmc7mSoUmPfuxtHBPK2qoRmCMTmvJH1Lpfp7HCTrqdcYIZAADA0UFoWnLV/S+xQLP2otqz97dUEh3ljpEm3dGOd8Rd8dB0Qt24s63uXT+hdm9tq6++0P/+2vZG9e+vvrigbpxz6p9bV/eq5daG2nXa0234y7ST6nZZ/9ZJZ5nedtNWsC2rY5ueHqEp+TpZHa+BbcOKt9UVvnQIHm06JgAAwIp76Nm17ynr6ccfEythEZmOcdH5le5/sSHHLdOd7khHOWd6XlWnaKNjVKszNN25UIWl89cvqK/Kf1fBRAedKkQVdauy4vvb2836OiQ5YceELbdOs9wNRe0QpduXQ5rdh3qZF74cWaEp/Tq54g+AMCHHLbOBWAxGOSNW+fsFAABw1DWh6dtPq68LFbCI7EhBbOQoNp3OrCd1pnNCU6kevYqPWnWFJjt64wcjN9j4AaoRhp92GCpV4erOujpvvtfbCUeMzL6467bCVpd9VT4jMB6aul4nl64bD8DtNvRy6TXLCU1a1ggYAADAEWdC05r61iNyBSwYG1pSoz1mREjqgEdHM3JDU8WGAam+DhKHB7vB8pIfVPzRHicAxUaQCt2BKAxcQjgywraaqXm5wWlX3S2HmqSAmPM6OeL3GZkAJLVjttF+nfNDU6nP1EsAAICjSIemp54QC7F46vtaOkOTHID0+kLnfFBocjvaOiylH8HdJzTJwaV1H5MJOnXAqtZthyh9f5LADU1i/XCESmD/JpUTnrJep5oOOfJoTyIAmdDUXm9gaMp+/QEAAI6Wh55cO6EeFQqwyFIjPYWu0DTJSFPn9LyxRpoSockLOn6bVbn5t1TeixnxigcnM9L0YF8oK3W8Tlby3HeHpklGmmy4Y3oeAABAHE/PW1qmYyx2mnVnPXZPk9hBzglNVZ1imx2jJ533NHWFJvPv2D1NreX16JIuD6f1tYNWD4kAN9aDIKJB1kjf05SY0pcMTd37BQAAAI3QtORiIwW6Q+2HIF03MkLUEZr63PcyeWgKy7TW1LyaCUu3ioAjhSN7r1LHaFO5TTFwxUaaxnjkeHS0yGVGrNxzH52aV+oKTZkjYAAAAKgQmlZAFWiEkYo66FhhnXqqncCrmxihEowRmpryMrQYidEiHW6k0SnLtB+QQ5IjNUI1wh+31a9RbKqjywadRhi0bDCTuHXztwkAAIASoQmji4emFdMzNLXpEaHcMAoAAID5IDRhdDsHRZQgNHXLffgGAAAA5orQhPGZR3APH4FZDtWIWvIR6wAAAFgFhCZMh/3bRcXXqoUnHZbKr0N197JcBwAAAKuD0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQQGgCAAAAgARCEwAAAAAkEJoAAAAAIIHQBAAAAAAJhKYFt3HxrLq586J6SSirrb2o9q6dVVfOCGVnTqmbRVlnGwAAAABEhKaFdlxdiYUhF6EJAAAAmBpC0wJ7aeOVIvCcUhtCmScVmgAAAABMhNA0J9W0u4vHxTLtmHpvp6uOMfXQpEe89jaOCWUAAADAaiM0zZwJQ10hp5pW94p6b00oMyGmmnbn8Nqz0/KsVvgy+yFN2zMhzA1JetRLagcAAABYbYSmmbJhJxaGGtEHQAiBJj3SFB+x0kGovS/RaYHcHwUAAIAjiNA0KybY5AWO+AMgxDA1MDSJAaxrWqA9jpx7rQAAAIAVQGiaBTtCkzm1Lf4AiMi9RUNDU6EVwpJtWfkjZgAAAMCyIzRNnQkt2aFJ15cfujB+aArvnaoCW+domA1NuccEAAAALC9C06zkTmvLeADEqKHJazMV2Izc4wAAAABWBKFpprqntUUfAFGRA1C1zuDQ5IwuVYEoMeWOB0EAAADgCHro29/+tgIAAAAAyB76uZ/7OQUAAAAAkBGaAAAAACCB0AQAAAAACYQmAAAAAEggNAEAAABAAqEJAAAAABIITQAAAACQQGgCAAAAgARCEwAAAABE/Zz6/wGWbcLUq4xDWQAAAABJRU5ErkJggg==
