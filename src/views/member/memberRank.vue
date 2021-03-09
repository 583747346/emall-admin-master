<template>
  <div>
    <el-card shadow="never">
      <div style="margin-bottom: 20px">
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
          style="float:right;margin-right: 15px;"
          type="success"
          @click="addMemberRank"
          size="small">
          添加
        </el-button>
      </div>
      <!--数据展示区域-->
      <el-table :data="memberRankList" border stripe v-loading="loading" is-scrolling-none
                :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="rank" label="等级"></el-table-column>
        <el-table-column prop="growthPoint" label="成长值"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="switchOn.active" :inactive-value="switchOn.inactive"
                       @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createdTime" label="创建时间"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit"
                         @click="updateMemberRank(scope.row)"></el-button>
            </el-tooltip>
            <!--enterable是否鼠标可以进入tooltip-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete"
                         @click="deleteMemberRank(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="memberRankParam.current"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="memberRankParam.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!--右侧滑出抽屉-->
    <el-drawer v-model="memberRankForm" title="更新" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">会员等级信息更新</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="等级">
            <el-input v-model="memberRankForm.rank"></el-input>
          </el-form-item>
          <el-form-item label="成长值">
            <el-input v-model="memberRankForm.growthPoint"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="memberRankForm.remarks" placeholder="请输入内容" type="textarea"
                      :autosize="true"></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="memberRankForm.status" :active-value="switchOn.active"
                       :inactive-value="switchOn.inactive"></el-switch>
          </el-form-item>
          <el-form-item class="button_area">
            <el-button type="primary" @click="drawerupdate">修 改</el-button>
            <el-button type="info" @click="drawerBack">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <!--添加会员等级区域-->
    <el-dialog title="添加会员等级" :visible.sync="insertMemberRankVisible" width="30%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="memberRankForm" label-width="80px">
        <el-form-item label="等级" :rules="[{ required: true, message: '等级描述不能为空'}]">
          <el-input v-model="memberRankForm.rank"></el-input>
        </el-form-item>
        <el-form-item label="成长值" :rules="[{ required: true, message: '成长值不能为空'}]">
          <el-input v-model="memberRankForm.growthPoint"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="memberRankForm.remarks" placeholder="请输入内容" type="textarea"
                    :autosize="true"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="dialogCancel">取 消</el-button>
          <el-button type="primary" @click="dialogSubmit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: 'memberRank',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        memberRankParam: {
          startTime: '',
          endTime: '',
          //当前每页显示多少条数据
          size: 10,
          //当前的页数
          current: 1
        },
        memberRankList: [],
        loading: false,
        //switch开关
        switchOn: {
          active: 1,
          inactive: 0
        },
        //分页总数记录
        total: 0,
        // 日期范围
        daterange: [],
        // 抽屉开关
        drawer: false,
        memberRankForm: {
          rank: '',
          growthPoint: '',
          status: '',
          remarks: ''
        },
        //更新会员等级的id
        updateMemberRankId: '',
        insertMemberRankVisible: false
      }
    },
    created () {
      this.getMemberRankList()
    },
    methods: {
      searchList () {
        this.getMemberRankList()
      },
      //获取会员等级列表
      getMemberRankList () {
        this.ajaxFn.post({
          url: 'emall-member-service/member-rank/memberRankList',
          data: this.memberRankParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.memberRankList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },

      //状态修改
      statusChange (row) {
        const status = row.status == false ? 0 : 1
        this.ajaxFn.put({
          url: 'emall-member-service/member-rank'
        }, [row.id, status]).then(res => {
          let { data, status, mesg } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('修改成功')
              this.getMemberRankList()
            }
          } else {
            this.$message.success(mesg)
          }
        })
      },
      //删除会员等级
      deleteMemberRank (id) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-member-service/member-rank'
          }, [id]).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.getMemberRankList()
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
      updateMemberRank (row) {
        this.memberRankForm = JSON.parse(JSON.stringify(row))
        this.updateMemberRankId = row.id
        this.drawer = true
      },
      //抽屉--更新--返回
      drawerBack () {
        this.drawer = false
        this.clearForm()
      },
      //抽屉--提交保存
      drawerupdate () {
        this.ajaxFn.put({
          url: 'emall-member-service/member-rank',
          data: this.memberRankForm
        }, [this.updateMemberRankId]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('更新成功！')
              this.clearForm()
              this.getMemberRankList()
            }
          }
        })
      },

      //添加会员等级信息
      addMemberRank () {
        this.insertMemberRankVisible = true
      },
      dialogCancel () {
        this.insertMemberRankVisible = false
        this.clearForm()
      },
      dialogSubmit () {
        this.ajaxFn.post({
          url: 'emall-member-service/member-rank',
          data: this.memberRankForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('添加成功！')
              this.clearForm()
              this.getMemberRankList()
            }
          }
        })
      },

      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.memberRankParam.size = newSize
        this.getMenm()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        console.log(newPage)
        this.memberRankParam.current = newPage
        this.getMemberList()
      },
      clearForm () {
        this.memberRankForm.rank = ''
        this.memberRankForm.growthPoint = ''
        this.memberRankForm.remarks = ''
        this.memberRankForm.status = ''
      }
    }
  }
</script>

<style scoped>

</style>
