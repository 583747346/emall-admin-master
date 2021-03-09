<template>
  <div>
    <el-card shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float:right"
          type="primary"
          @click="searchList"
          size="small">
          查询
        </el-button>
        <el-button
          style="float:right;margin-right: 15px;margin-left: 15px;"
          type="success"
          @click="addUser"
          size="small">
          添加
        </el-button>
        <el-button
          style="float:right"
          @click="resetSearch"
          size="small" type="danger">
          重置
        </el-button>
        <div style="margin-top: 20px">
          <el-form :inline="true" :model="userParam" size="small" label-width="140px">
            <el-form-item label="用户姓名：">
              <el-input v-model="userParam.name" class="input-width" placeholder="" clearable></el-input>
            </el-form-item>
            <el-form-item label="用户状态：">
              <el-select v-model="userParam.status" class="input-width" placeholder="全部" clearable>
                <el-option v-for="item in userStatus"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间：">
              <el-date-picker
                v-model="daterange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
                @change='selectData(daterange)'
                clearable>
              </el-date-picker>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--数据展示区域-->
      <el-table :data="userList" border stripe v-loading="loading" is-scrolling-none :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="avatar" label="头像" align="center">
          <el-avatar :size="60" slot-scope="scope" shape="square">
            <el-image
              class="carouselImg"
              v-if="scope.row.avatar" :src="scope.row.avatar"
              fit="cover">
            </el-image>
          </el-avatar>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="deleted" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.deleted" active-value='N' @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateuser(scope.row)"></el-button>
            </el-tooltip>
            <!--enterable是否鼠标可以进入tooltip-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="success" size="mini" icon="el-icon-setting"
                         @click="showUserRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="userParam.current"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="userParam.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!--右侧滑出抽屉-->
    <el-drawer v-model="userForm" title="更新" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">用户信息更新</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="姓名">
            <el-input v-model="userForm.name"></el-input>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="userForm.mobile"></el-input>
          </el-form-item>
          <el-form-item label="头像">
            <el-upload class="avatar-upload"
                       action="http://localhost:40005/emall-ums-service/oss/uploadPics"
                       :data="ossPath"
                       :show-file-list="false"
                       :on-success="handleAvatarSuccess">
              <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="userForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="userForm.description"></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="userForm.deleted" active-value='N' inactive-value='Y'></el-switch>
          </el-form-item>
          <el-form-item class="button_area">
            <el-button type="primary" @click="update">修 改</el-button>
            <el-button type="info" @click="back">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <!--添加用户区域-->
    <el-dialog title="添加用户" :visible.sync="insertUserVisible" width="30%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="userForm" label-width="80px">
        <el-form-item label="用户名" :rules="[{ required: true, message: '账号不能为空'}]">
          <el-input v-model="userForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" :rules="[{ required: true, message: '密码不能为空'}]">
          <el-input v-model="userForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="手机号" :rules="[{ required: true, message: '手机号不能为空'}]">
          <el-input v-model="userForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userForm.name"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-upload"
            action="http://localhost:40005/emall-ums-service/oss/uploadPics"
            :data="ossPath"
            :show-file-list="false"
            :on-success="handleAvatarSuccess">
            <img v-if="avatarUrl" :src="this.avatarUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="userForm.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="dialogCancel">取 消</el-button>
          <el-button type="primary" @click="submit(userForm)">确 定</el-button>
      </span>
    </el-dialog>

    <!--穿梭框 分配角色-->
    <!--<el-dialog title="分配角色" :visible.sync="transferVisble" width="40%" :close-on-press-escape="false"-->
    <!--           :close-on-click-modal="false" class="transferHeight">-->
    <!--  <div style="text-align: center">-->
    <!--    <el-transfer style="text-align: left; display: inline-block" v-model="value4" filterable-->
    <!--                 :titles="['角色列表', '已选角色列表']" :format="{noChecked: '${total}',hasChecked: '${checked}/${total}'}"-->
    <!--                 :data="data">-->
    <!--      <span slot-scope="{ option }">{{ option.label }}</span>-->
    <!--    </el-transfer>-->
    <!--  </div>-->
    <!--  <span slot="footer" class="transfer-button">-->
    <!--      <el-button type="warning" @click="transferCancel">取 消</el-button>-->
    <!--      <el-button type="success" @click="transferSubmit(userForm)">确 定</el-button>-->
    <!--  </span>-->
    <!--</el-dialog>-->

    <!-- 用户分配角色 -->
    <el-dialog title="分配角色" :visible.sync="userRoleVisible" width="30%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="userRoleForm" label-width="80px">
        <el-form-item label="用户">
          <span>{{userRoleForm.name}}</span>
        </el-form-item>
        <el-form-item label="角色">
          <c_select
            style="width: 100%"
            @changeSelectedValue="setUserRoleMenuSelected"
            :multiple="true"
            :initValue="{
              'value': userRoleForm.role
            }"
            placeholder="请选择角色"
            target="role"
            ref="editMenu"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="userRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="userRoleMenu">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import c_select from '@/components/commonSelect'

  export default {
    name: 'user',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        //开关按钮
        userStatus: [
          {
            label: '正常',
            value: 'N'
          },
          {
            label: '已删除',
            value: 'Y'
          }
        ],
        daterange: [],
        userParam: {
          startTime: '',
          endTime: '',
          status: '',
          name: '',
          //当前每页显示多少条数据
          size: 10,
          //当前的页数
          current: 1
        },
        userList: [],
        total: 0,
        drawer: false,
        //用户表单对象
        userForm: {
          username: '',
          name: '',
          mobile: '',
          password: '',
          description: '',
          deleted: '',
          avatar: '',
        },
        //加载控制
        loading: true,
        //添加用户弹出对话框
        insertUserVisible: false,
        //修改某个用户的id
        updateUserId: '',
        //是否显示穿梭框【分配角色】
        transferVisble: false,
        //穿梭框--左边框的数据
        leftData: {
          key: '',
          label: ''
        },
        rightData: {
          key: '',
          label: '',
          disabled: ''
        },
        data: [],
        value: [1],
        value4: [1],
        renderFunc (h, option) {
          return '<span>{ option.key } - { option.label }</span>'
        },
        all_role: [],
        userRoleVisible: false,
        userRoleForm: {},
        //用户头像上传oss，返回地址
        avatarUrl: '',
        ossPath: { path: 'AVATAR' }
      }
    },
    components: {
      c_select
    },
    mounted () {
      this.getUserList()
      this.getAllRole()
    },
    methods: {
      //获取全部角色列表
      getAllRole () {
        this.ajaxFn.get({
          url: 'emall-ums-service/role/distinct'
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.all_role = res.data.data
            }
          }
        })
      },
      //获取用户信息
      getUserList () {
        this.ajaxFn.post({
          url: 'emall-ums-service/user/userlist',
          data: this.userParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.userList = res.data.data.records
              // this.userParam.current = parseInt(res.data.data.current)
              // this.userParam.size = parseInt(res.data.data.size)
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.userParam.size = newSize
        this.getUserList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        console.log(newPage)
        this.userParam.current = newPage
        this.getUserList()
      },
      //监听用户状态的改变
      statusChange (userdata) {
        //当deleted未false表示关掉，即对应是删除用户为Y
        const status = userdata.deleted === false ? 'Y' : 'N'
        this.ajaxFn.put({
          url: 'emall-ums-service/user'
        }, [userdata.id, status]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success("修改成功")
              this.getUserList()
            }
          }
        })
      },
      //查询搜索
      searchList () {
        this.getUserList()
      },
      //重置参数
      resetSearch () {
        this.daterange = null
        this.userParam.status = ''
        this.userParam.name = ''
        this.userParam.current = 0
        this.userParam.size = 10
      },
      //添加用户
      addUser () {
        //打开对话框
        this.insertUserVisible = true
      },
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          this.userParam.startTime = e[0]
          this.userParam.endTime = e[1]
        }
      },
      //操作---更新用户信息
      updateuser (row) {
        this.userForm.name = row.name
        this.userForm.username = row.username
        this.userForm.password = row.password
        this.userForm.mobile = row.mobile
        this.userForm.avatar = row.avatar
        this.userForm.description = row.description
        this.userForm.deleted = row.deleted
        this.updateUserId = row.id
        this.drawer = true
      },
      //操作---根据用户id删除用户信息
      deleteUser (id) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-ums-service/user'
          }, [id]).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.getUserList()
              }
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })

      },
      //抽屉按钮---取消
      back () {
        this.drawer = false
        this.updateUserId = ''
        this.clearForm()
      },
      //抽屉按钮---更新
      update () {
        //调用接口更新操作
        this.ajaxFn.put({
          url: 'emall-ums-service/user',
          data: this.userForm
        }, [this.updateUserId]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('修改成功')
              //关闭抽屉
              this.drawer = false
              this.clearForm()
              this.getUserList()
            }
          }
        })

        //清空更新时保存的用户id
        this.updateUserId = ''
      },
      //dialog添加用户，取消按钮
      dialogCancel () {
        this.insertUserVisible = false
        this.clearForm()
        this.avatarUrl = ''
      },
      //dialog添加用户，提交按钮
      submit (userForm) {
        userForm.avatar = this.avatarUrl
        this.ajaxFn.post({
          url: 'emall-ums-service/user',
          data: userForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.insertUserVisible = false
              this.$message.success('添加成功')
              this.getUserList()
              this.clearForm()
              this.avatarUrl = ''
            }
          }
        })
      },
      //清空表单
      clearForm () {
        this.userForm.name = ''
        this.userForm.password = ''
        this.userForm.mobile = ''
        this.userForm.description = ''
        this.userForm.deleted = ''
        this.userForm.username = ''
        this.userParam.current = 1
        this.userForm.avatar = ''
      },
      //取消角色分配
      transferCancel () {
        this.transferVisble = false
      },
      showUserRole (row) {
        this.userRoleForm = JSON.parse(JSON.stringify(row))
        this.getRoleByUserId()
      },
      getRoleByUserId () {
        this.userRoleForm.role = []
        this.ajaxFn.get({
          url: 'emall-ums-service/user/' + this.userRoleForm.id
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              let roles = res.data.data
              let ar = []
              if (roles && roles.length > 0) {
                for (let obj of res.data.data) {
                  ar.push(obj.id)
                }
                this.userRoleForm.role = ar
                this.userRoleVisible = true
              }
            }
          }
        }).catch(({ res, msg }) => {
          this.userRoleVisible = true
        })
      },
      setUserRoleMenuSelected (val, obj) {
        this.userRoleForm.role = val
      },
      //给用户分配角色
      userRoleMenu () {
        this.ajaxFn.post({
          url: 'emall-ums-service/user/role/' + this.userRoleForm.id,
          data: this.userRoleForm.role
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('角色分配成功！')
              this.userRoleVisible = false
            }
          }
        })
      },
      //头像上传
      handleAvatarSuccess (res, file) {
        this.userForm.avatar = res.data
        this.avatarUrl = res.data
      },
    }
  }
</script>

<style lang="less" scoped>
  @import "./user.less";
</style>
