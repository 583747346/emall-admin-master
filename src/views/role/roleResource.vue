<template>
  <el-card class="form-container" shadow="never">
    <div v-for="(resource,index) in resourcelist" :class="index===0?'top-line':null" :key="resource.type">
      <el-row class="table-layout" style="background: #F2F6FC;">
        <el-checkbox v-model="resource.checked" :indeterminate="resource.allchecked"
                     @change="checkChange(index,resource)">
          <p class="title">{{resource.type}}</p>
        </el-checkbox>
      </el-row>
      <el-row class="table-layout">
        <el-col :span="4" v-for="(subresource,subindex) in resource.children" :key="subresource.id"
                style="padding: 4px 0">
          <!--:indeterminate="isIndeterminate(resource.id)"-->
          <el-checkbox v-model="subresource.checked" @change="handleCheckChange(index,subindex,resource,subresource)">
            {{subresource.name}}
          </el-checkbox>
        </el-col>
      </el-row>
    </div>
    <div style="margin-top: 20px" align="center">
      <el-button type="primary" @click="save()">保存</el-button>
      <el-button @click="clear()">清空</el-button>
    </div>
  </el-card>

</template>

<script>
  export default {
    name: 'roleResource',
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        roleId: '',
        allReource: '',
        roleResource: '',
        //资源列表
        resourcelist: [],
        //用于存储所选的id集合
        resourceIds: [],
      }
    },
    created () {
      //获取路由请求参数
      this.roleId = this.$route.query.roleId
      //查看当前角色的资源
      this.getResource()
    },
    methods: {
      //根据角色id查看资源
      getResource (roleId) {
        this.ajaxFn.get({
          url: '/emall-ums-service/role/getResourceByRoleId/' + this.roleId
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              var result = res.data.data
              let arr = []
              for (var i = 0; i < result.length; i++) {
                arr.push(result[i].id)
              }
              this.resourceIds = arr
              //获取所有的资源信息列表
              this.getAllResource()
            }
          }
        })
      },
      //获取所有的资源列表
      getAllResource () {
        this.ajaxFn.get({
          url: '/emall-ums-service/resource/getResourceTree'
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              let resourcelist = res.data.data
              for (let i = 0; i < resourcelist.length; i++) {
                for (let j = 0; j < resourcelist[i].children.length; j++) {
                  if (this.resourceIds.indexOf(resourcelist[i].children[j].id) > -1) {
                    //json添加一个checked值
                    resourcelist[i].children[j].checked = true
                  } else {
                    //json添加一个checked值
                    resourcelist[i].children[j].checked = false
                  }
                }
                if (this.compare(resourcelist[i].children) == false) {
                  resourcelist[i].checked = true
                  resourcelist[i].allchecked = false
                } else if (this.compare(resourcelist[i].children) == true) {
                  resourcelist[i].checked = true
                  resourcelist[i].allchecked = true
                } else {
                  resourcelist[i].checked = false
                  resourcelist[i].allchecked = null
                }
              }
              // 将赋有checked值得list赋值给resourcelist绑定
              this.resourcelist = resourcelist
            }
          } else {
            this.$message.error('获取所有资源异常')
          }
        })
      },
      //批量操作
      checkChange (index, resource) {
        //获取所有的id
        for (let i = 0; i < resource.children.length; i++) {
          if (resource.checked) {
            resource.children[i].checked = true
          } else {
            resource.children[i].checked = false
          }
        }
        if (this.isChecked(this.resourcelist[index].children) === 0) {
          this.resourcelist[index].allchecked = null
        } else if (this.isChecked(this.resourcelist[index].children) < this.resourcelist[index].children.length) {
          this.resourcelist[index].allchecked = true
        } else {
          this.resourcelist[index].allchecked = false
        }

      },
      //父资源状态控制
      /*      isIndeterminate (index, resource) {
              if (this.isChecked(resource.children) == 0) {
                return null
              } else if (resource.children.length > 0 && resource.children.length < resource.length) {
                return true
              } else {
                return false
              }
            },*/

      //单个复选框状态改变触发
      handleCheckChange (index, subindex, resource, subresource) {
        resource.children[subindex].checked = subresource.checked
        if (this.isChecked(this.resourcelist[index].children) === 0) {
          resource.allchecked = null
          resource.checked = false
        } else if (this.isChecked(resource.children) > 0 && this.isChecked(resource.children) < resource.children.length) {
          resource.allchecked = true
          resource.checked = true
        } else {
          resource.allchecked = false
          resource.checked = true
        }
      },

      //判断每个子集得选中数量，用于修改父资源的选中状态
      isChecked (children) {
        let checkedNum = 0
        for (let i = 0; i < children.length; i++) {
          if (children[i].checked) {
            checkedNum = checkedNum + 1
          }
        }
        return checkedNum
      },

      compare (children) {
        if (this.isChecked(children) === children.length) {
          return false
        } else if (this.isChecked(children) === 0) {
          return null
        } else {
          return true
        }
      },
      //通过循环遍历所有children，状态为checekd的获取id即可
      save () {
        let checkedIds = []
        if (this.resourcelist != null && this.resourcelist.length > 0) {
          this.resourcelist.forEach(item => {
            item.children.forEach(subresource => {
              if (subresource.checked) {
                checkedIds.push(subresource.id)
              }
            })
          })
        }

        this.ajaxFn.post({
          url: 'emall-ums-service/role/resource/' + this.roleId,
          data: checkedIds
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('分配资源成功')
              this.$router.push("/role")
            }
          }
        })
      },

      //循环遍历所有children，checked置为false
      clear () {
        if (this.resourcelist != null && this.resourcelist.length > 0) {
          this.resourcelist.forEach(item => {
            item.children.forEach(subresource => {
              subresource.checked = false
            })
            item.allchecked = null
          })
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "roleResource.less";
</style>
