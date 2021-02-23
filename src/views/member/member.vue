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
          style="float:right;margin-right: 15px;"
          @click="resetSearch"
          size="small" type="danger">
          重置
        </el-button>
        <div style="margin-top: 20px">
          <el-form :inline="true" :model="memberParam" size="small" label-width="140px">
            <el-form-item label="会员等级：">
              <el-select v-model="memberParam.levelName" class="input-width" placeholder="全部" clearable>
                <el-option v-for="item in memberRank"
                           :key="item"
                           :label="item"
                           :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="会员状态：">
              <el-select v-model="memberParam.status" class="input-width" placeholder="全部" clearable>
                <el-option v-for="item in memberStatus"
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
      <el-card shadow="never">
        <el-table :data="memberList" border stripe v-loading="loading" is-scrolling-none
                  :header-cell-style="{background:'#f0f9eb',color:'black'}">
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="photo" label="头像" align="center">
            <el-avatar :size="60" slot-scope="scope" shape="square">
              <el-image
                class="carouselImg"
                v-if="scope.row.photo" :src="scope.row.photo"
                fit="cover">
              </el-image>
            </el-avatar>
          </el-table-column>
          <el-table-column prop="username" label="用户名"></el-table-column>
          <el-table-column prop="mobile" label="手机号"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="navStatus" label="账户状态" align="center">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" :active-value="switchOn.active"
                         :inactive-value="switchOn.inactive"
                         @change="statusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="login_time" label="最后登录时间"></el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
              <el-tooltip effect="dark" content="会员详情" placement="top-start">
                <el-button type="success" size="mini" icon="el-icon-setting"
                           @click="getUserDetail(scope.row.id)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="修改" placement="top-start">
                <el-button type="primary" size="mini" icon="el-icon-edit"
                           @click="updateMember(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!--分页区域-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                       :current-page="memberParam.current"
                       :page-sizes="[10, 20, 50, 100]"
                       :page-size="memberParam.size"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total">
        </el-pagination>
      </el-card>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'member',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        memberParam: {
          //会员等级
          levelName: '',
          //会员状态
          status: '',
          startTime: '',
          endTime: '',
          //当前每页显示多少条数据
          size: 10,
          //当前的页数
          current: 1
        },
        //分页总数记录
        total: 0,
        // 日期范围
        daterange: [],
        //加载
        loading: true,
        //会员列表
        memberList: [],
        //switch开关
        switchOn: {
          active: 1,
          inactive: 0
        },
        //会员状态
        memberStatus: [{
          value: 0,
          label: '活动'
        }, {
          value: 1,
          label: '非活动'
        }],
        //会员等级
        memberRank: []
      }
    },
    created () {
      //获取会员列表
      this.getMemberList()
      //获取会员等级
      this.getMemberRank()
    },
    methods: {
      searchList () {
        this.getMemberList()
      },
      //会员等级
      getMemberRank () {
        this.ajaxFn.get({
          url: 'emall-manageplat/member-rank'
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.memberRank = res.data.data
            }
          }
        })
      },
      //会员列表
      getMemberList () {
        this.ajaxFn.post({
          url: 'emall-manageplat/member/memberList',
          data: this.memberParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.memberList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },
      //修改会员状态
      statusChange (row) {
        const status = row.status == false ? 0 : 1
        this.ajaxFn.post({
          url: 'emall-manageplat/member'
        }, [row.id, status]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('修改成功')
              this.getMemberList()
            }
          }
        })
      },
      //查看会员详情
      getUserDetail (id) {

      },
      updateMember (row) {

      },
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          this.memberParam.startTime = e[0]
          this.memberParam.endTime = e[1]
        }
      },
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.memberParam.size = newSize
        this.getMemberList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        console.log(newPage)
        this.memberParam.current = newPage
        this.getMemberList()
      },
      resetSearch () {
        this.daterange = null
        this.memberParam.levelName = ''
        this.memberParam.status = ''
        this.memberParam.current = 0
        this.memberParam.size = 10
      }
    }
  }
</script>

<style scoped>

</style>
