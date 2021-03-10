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
          @click="addBrand"
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
          <el-form :inline="true" :model="brandParam" size="small" label-width="140px">
            <el-form-item label="品牌：">
              <el-input v-model="brandParam.name" class="input-width" placeholder="" clearable></el-input>
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
      <el-table :data="brandList" border stripe v-loading="loading" is-scrolling-none :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="name" label="品牌"></el-table-column>
        <el-table-column prop="logo" label="品牌logo" align="center">
          <template slot-scope="scope"><img style="height: 60px;width: 60px;" :src="scope.row.logo"></template>
        </el-table-column>
        <el-table-column prop="factoryStatus" label="品牌制造商" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.factoryStatus=== 1" type='success'>
              是
            </el-tag>
            <el-tag v-if="scope.row.factoryStatus===0" type='danger'>
              否
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="showStatus" label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.showStatus" :active-value="switchOn.active"
                       :inactive-value="switchOn.inactive"
                       @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序"></el-table-column>
        <el-table-column prop="brandStory" label="品牌故事" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createdTime" label="创建时间"></el-table-column>
        <el-table-column prop="createdBy" label="创建者"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="updateBrand(scope.row)"></el-button>
            </el-tooltip>
            <!--enterable是否鼠标可以进入tooltip-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteBrand(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="brandParam.current"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="brandParam.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>


    <el-dialog title="添加品牌" :visible.sync="insertBrandVisible" width="35%" :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="brandForm" label-width="90px">
        <el-form-item label="品牌名" :rules="[{ required: true, message: '账号不能为空'}]">
          <el-input v-model="brandForm.name"></el-input>
        </el-form-item>
        <el-form-item label="首字母" :rules="[{ required: true, message: '首字母只能为1位并且不为空'}]">
          <el-input v-model="brandForm.firstLetter" type="text"></el-input>
        </el-form-item>
        <el-form-item label="排序" :rules="[{ required: true, message: '排序不为空'}]">
          <el-input v-model.number="brandForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="品牌制造商">
          <el-radio-group v-model="brandForm.factoryStatus">
            <el-radio-button label="1">是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="品牌logo">
          <el-upload
            class="brand-upload"
            action="http://localhost:40005/emall-ums-service/oss/uploadPics"
            :data="ossPath"
            :show-file-list="false"
            :on-success="handleBrandLogoSuccess">
            <img v-if="brandUrl" :src="this.brandUrl" class="brandLogo">
            <i v-else class="el-icon-plus logo-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="品牌故事">
          <el-input v-model="brandForm.brandStory" placeholder="请输入内容" type="textarea" :autosize="true"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="dialogCancel()">取 消</el-button>
          <el-button type="primary" @click="submit()">确 定</el-button>
      </span>
    </el-dialog>

    <!--右侧滑出抽屉-->
    <el-drawer v-model="brandForm" title="品牌更新" :visible.sync="drawer" :with-header="false" size="40%"
               :wrapperClosable="false">
      <span class="drawer-span">品牌更新</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="品牌">
            <el-input v-model="brandForm.name"></el-input>
          </el-form-item>
          <el-form-item label="首字母">
            <el-input v-model="brandForm.firstLetter"></el-input>
          </el-form-item>
          <el-form-item label="品牌logo">
            <el-upload class="brand-upload"
                       action="http://localhost:40005/emall-ums-service/oss/uploadPics"
                       :data="ossPath"
                       :show-file-list="false"
                       :on-success="handleBrandLogoSuccess">
              <img v-if="brandForm.logo" :src="brandForm.logo" class="brandLogo">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="排序" :rules="[{ required: true, message: '排序不能为空'}]">
            <el-input v-model.number="brandForm.sort"></el-input>
          </el-form-item>
          <el-form-item label="品牌制造商">
            <el-radio-group v-model="brandForm.factoryStatus">
              <el-radio-button label="1" >是</el-radio-button>
              <el-radio-button label="0">否</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="brandForm.showStatus" :active-value="switchOn.active"
                       :inactive-value="switchOn.inactive"></el-switch>
          </el-form-item>
          <el-form-item label="品牌故事">
            <el-input v-model="brandForm.brandStory" placeholder="请输入内容" type="textarea" :autosize="true"></el-input>
          </el-form-item>
          <el-form-item class="button_area">
            <el-button type="primary" @click="drawerUpdate">修 改</el-button>
            <el-button type="info" @click="drawerBack">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import singleUpload from '../../components/upload/singleUpload'
  export default {
    name: 'brand',
    components:{
      singleUpload
    },
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        brandParam: {
          name: '',
          startTime: '',
          endTime: '',
          //当前每页显示多少条数据
          size: 10,
          //当前的页数
          current: 1
        },
        //品牌列表
        brandList: [],
        //日期范围
        daterange: [],
        //数据区加载
        loading: true,
        //显示添加的dialogue
        insertBrandVisible: false,
        ossPath: { ossPath: 'BRAND_LOGO' },
        //品牌logo上传oss，返回地址
        brandUrl: '',
        //品牌表单
        brandForm: {
          name: '',
          firstLetter: '',
          sort: 0,
          factoryStatus: 0,
          showStatus: 0,
          logo: '',
          brandStory: '',
          brandfile: '',
        },
        switchOn: {
          active: 0,
          inactive: 1
        },
        //更新操作，打开抽屉
        drawer: false,
        //更新时的品牌id
        updateBrandId: '',
        //分页--总条数记录
        total: 0
      }
    },
    created () {
      this.getBrandList()
    },
    methods: {
      getBrandList () {
        this.ajaxFn.post({
          url: 'emall-goods-service/brand/brandlist',
          data: this.brandParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.brandList = res.data.data.records
              this.total = parseInt(res.data.data.total)
            }
          }
        })
      },
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          this.brandParam.startTime = e[0]
          this.brandParam.endTime = e[1]
        }
      },
      //查询搜索
      searchList () {
        this.getBrandList()
      },
      //重置参数
      resetSearch () {
        this.daterange = null
        this.brandParam.name = ''
        this.brandParam.current = 0
        this.brandParam.size = 10
      },
      //添加品牌
      addBrand () {
        //打开添加的dialogue
        this.insertBrandVisible = true
      },
      //品牌状态修改
      statusChange (brandData) {
        const status = brandData.showStatus === false ? 1 : 0
        this.ajaxFn.put({
          url: 'emall-goods-service/brand'
        }, [brandData.id, status]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.getBrandList()
            }
          }
        })
      },
      //更新操作
      updateBrand (row) {
        this.updateBrandId = row.id
        //将row记录赋值到brandForm
        this.brandForm = JSON.parse(JSON.stringify(row))
        this.drawer = true
      },
      //删除品牌
      deleteBrand (brandId) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.ajaxFn.delete({
            url: 'emall-goods-service/brand'
          }, [brandId]).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (this.ajaxFn.respIsTrue(data)) {
                this.$message.success('删除成功！')
                this.clearForm()
                this.getBrandList()
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
      //品牌logo上传图片到oss，返回地址
      handleBrandLogoSuccess (res, file) {
        console.log(file.name)
        this.brandForm.brandfile = file.name
        let { data, code, mesg } = res
        if (code === '200') {
          this.brandForm.logo = data
          this.brandUrl = data
          this.$message.success(mesg)
        } else {
          this.$message.error(mesg)
        }
      },

      //dialogue--添加--提交
      submit () {
        this.ajaxFn.post({
          url: 'emall-goods-service/brand',
          data: this.brandForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.insertBrandVisible = false
              this.$message.success('添加成功')
              this.getBrandList()
              this.clearForm()
              this.brandUrl = ''
            }
          }
        })
      },
      //dialogue--添加--取消
      dialogCancel () {
        let dataParam = {
          pictureName: this.brandForm.brandfile,
          ossPicturePath: 'BRAND_LOGO'
        }
        //清除oss中的图片
        this.ajaxFn.post({
          url: 'emall-goods-service/oss/deletePics',
          data: dataParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('添加成功')
            }
          }
        })
        //清除表单其他属性值
        this.clearForm()
        this.insertBrandVisible = false
      },

      //抽屉--更新
      drawerUpdate () {
        this.ajaxFn.put({
          url: 'emall-goods-service/brand',
          data: this.brandForm
        },[this.updateBrandId]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('修改成功')
            }
          }
        })
        //清除表单其他属性值
        this.clearForm()
        this.drawer = false
      },
      //抽屉--返回
      drawerBack () {
        this.clearForm()
        this.drawer = false
      },
      //监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        this.brandParam.size = newSize
        this.getBrandList()
      },
      //监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        console.log(newPage)
        this.brandParam.current = newPage
        this.getBrandList()
      },
      //清空brand表单
      clearForm () {
        this.brandForm.factoryStatus = ''
        this.brandForm.firstLetter = ''
        this.brandForm.name = ''
        this.brandForm.sort = ''
        this.brandForm.brandStory = ''
        this.brandForm.logo = ''
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "src/views/brand/brand";
</style>
