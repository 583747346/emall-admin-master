<template>
  <div>
    <el-card shadow="never">
      <div style="margin-bottom: 20px">
        <span v-if="type==='0'">{{categoryName}}——属性规格：</span>
        <span v-else>{{categoryName}}——属性参数：</span>
        <el-button
          style="float:right"
          @click="addAttribute"
          size="small" type="success">
          添加
        </el-button>
      </div>
      <el-table :data="attributeList" border stripe v-loading="loading" is-scrolling-none :header-cell-style="{background:'#f0f9eb',color:'black'}">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="name" label="属性名"></el-table-column>
        <el-table-column prop="attributeList" label="属性值列表"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="switchActive.active"
                       :inactive-value="switchActive.inactive"
                       @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit"
                         @click="updateAttribute(scope.row)"></el-button>
            </el-tooltip>
            <!--enterable是否鼠标可以进入tooltip-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" size="mini" icon="el-icon-delete"
                         @click="deleteAttribute(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加新的商品属性参数-->
    <el-dialog :title="type==0?'添加商品属性规格':'添加商品属性参数'" :visible.sync="insertAttributeVisible" width="35%"
               :close-on-press-escape="false"
               :close-on-click-modal="false">
      <el-form ref="form" :model="attributeForm" label-width="90px">
        <el-form-item label="属性名">
          <el-input v-model="attributeForm.name"></el-input>
        </el-form-item>
        <el-form-item label="属性值">
          <template v-for="(attribute,index) in attributeValue" style="display: inline">
            <el-input v-model=" attribute.value" :key="attribute.key" style="width: 85%;margin-bottom: 5px">
            </el-input>
            <el-button class="dialog-button-delete" type="danger" plain size="mini"
                       @click="deleteAttributeValue(attribute,index)">删除
            </el-button>
          </template>
          <el-button class="dialog-button-add" type="success" plain size="mini" @click="addAttributeValue">新增
          </el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="dialogCancel">取 消</el-button>
          <el-button type="primary" @click="attributeSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!--右侧滑出抽屉-->
    <el-drawer v-model="attributeForm" title="type==0?'修改商品属性规格':'修改商品属性参数'"
               :visible.sync="drawer"
               :with-header="false"
               size="40%"
               :wrapperClosable="false">
      <span class="drawer-span" v-if="type==='0'">商品属性——规格更新</span>
      <span class="drawer-span" v-if="type==='1'">商品属性——参数更新</span>
      <!--分割线-->
      <el-divider></el-divider>
      <div class="drawer-form">
        <el-form label-width="100px" size="medium">
          <el-form-item label="属性名">
            <el-input v-model="attributeForm.name"></el-input>
          </el-form-item>
          <el-form-item label="属性值">
            <template v-for="(attribute,index) in attributeValue" style="display: inline">
              <el-input v-model="attribute.value" :key="attribute.key" style="width: 80%;margin-bottom: 15px">
              </el-input>
              <el-button class="dialog-button-delete" type="danger" plain size="mini"
                         @click="deleteAttributeValue(attribute,index)">删除
              </el-button>
            </template>
            <el-button class="dialog-button-add" type="success" plain size="mini" @click="addAttributeValue">新增
            </el-button>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="attributeForm.status" :active-value="switchActive.active"
                       :inactive-value="switchActive.inactive"></el-switch>
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
  export default {
    name: 'productAttributeParam',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        attributeList: [],
        attributeForm: {
          //分类id，主要用于添加品类与属性【规格|参数】的关系
          categoryId: '',
          name: '',
          attributeList: '',
          status: '',
          type: ''
        },
        loading: true,
        //路由传参---分类的id
        categoryId: '',
        //路由传参---分类名
        categoryName: '',
        //路由传参---类型【规格|参数】
        type: '',
        insertAttributeVisible: false,
        //状态设置
        switchActive: {
          active: 1,
          inactive: 0
        },
        //商品属性抽屉开关
        drawer: false,
        //更新商品属性时的属性id
        attributeId: '',
        //属性值数组
        attributeValue: [{
          key: '',
          value: ''
        }]
      }
    },
    created () {
      //获取路由的参数
      this.categoryId = this.$route.query.categoryId
      this.type = this.$route.query.type
      this.categoryName = this.$route.query.categoryName
      this.attributeName = this.$route.query.attributeName
      //获取列表
      this.getAttributeList()
    },
    methods: {
      getAttributeList () {
        this.ajaxFn.get({
          url: 'emall-manageplat/product-attribute/getAttributeByCategoryId/' + this.categoryId + '/' + this.type
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.attributeList = res.data.data
            }
          }
        })
      },
      //添加商品属性参数信息
      addAttribute () {
        this.insertAttributeVisible = true
      },
      //添加对话框---提交
      attributeSubmit () {
        let attributes = []
        this.attributeValue.forEach(obj => {
          attributes.push(obj.value)
        })
        this.attributeForm.attributeList = attributes.join(',')
        this.attributeForm.type = this.type
        this.attributeForm.categoryId = this.categoryId
        this.ajaxFn.post({
          url: 'emall-manageplat/product-attribute',
          data: this.attributeForm
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.getAttributeList()
              this.clearForm()
              this.insertAttributeVisible = false
            }
          }
        })
      },
      //更新属性参数信息
      updateAttribute (row) {
        this.attributeId = row.id
        this.attributeForm = JSON.parse(JSON.stringify(row))
        let attributeArray = row.attributeList.split(',')
        //先将数组置空
        this.attributeValue = []
        attributeArray.forEach(field => {
          this.attributeValue.push({
            key: Date.now() + Math.round(Math.random() * 5),
            value: field
          })
        })
        this.drawer = true
      },
      //删除属性
      deleteAttribute (id) {
        this.ajaxFn.delete({
          url: 'emall-manageplat/product-attribute'
        }, [id]).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.getAttributeList()
              this.$message.success('删除成功！')
            }
          }
        })
      },
      //更新商品属性|商品规格的状态
      statusChange (row) {
        this.ajaxFn.put({
          url: 'emall-manageplat/product-attribute'
        }, [row.id, row.status]).then(res => {
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.getAttributeList()
              this.$message.success('更新成功！')
            }
          }
        })
      },
      addAttributeValue () {
        this.attributeValue.push({
          key: Date.now() + Math.round(Math.random() * 5),
          value: ''
        })
      },
      deleteAttributeValue (item, index) {
        if (this.attributeValue.length == 1) {
          this.$message.error('至少要保留一个属性值')
          return
        }
        this.attributeValue.splice(index, 1)
        console.log(this.attributeValue)
      },

      //修改商品属性---
      drawerUpdate () {
        let attributes = []
        this.attributeValue.forEach(obj => {
          attributes.push(obj.value)
        })
        this.attributeForm.attributeList = attributes.join(',')
        this.ajaxFn.put({
          url: 'emall-manageplat/product-attribute',
          data: this.attributeForm
        }, [this.attributeId]).then(res => {
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.drawer = false
              this.getAttributeList()
              this.clearForm()
              this.$message.success('更新成功！')
            }
          }
        })
      },
      drawerBack () {
        this.clearForm()
        this.drawer = false
      },
      //对话框清空表单
      dialogCancel () {
        this.clearForm()
        this.insertAttributeVisible = false
      },
      clearForm () {
        this.attributeForm.name = ''
        this.attributeForm.attributeList = ''
        this.attributeForm.status = ''
        this.attributeValue = [{
          key: '',
          value: ''
        }]
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "productSpecsOrParam";
</style>
