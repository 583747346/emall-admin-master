<template>
  <div>
    <!--
        file-list   上传的文件列表
        on-remove   文件列表移除钩子函数
        on-success  文件列表添加的钩子函数
        on-exceed   超出文件个数限制的钩子函数
    -->
    <el-upload
      list-type="picture-card"
      :action="ossUploadUrl"
      :multiple="false"
      :data="ossPath"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess">
      <i class="el-icon-plus uploader-icon"></i>
    </el-upload>
  </div>
</template>

<script>
  export default {
    name: 'singleUpload',
    props: {
      //图片属性数组
      value: Array,
      ossPath: '',
    },
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        ossUploadUrl: 'http://localhost:40005/emall-manageplat/oss/uploadPics',
      }
    },
    methods: {
      //图片上传处理成功返回图片地址
      handleUploadSuccess (res, file) {
        console.log(file.name)
        let { data, code, mesg } = res
        if (code === '200') {
          this.dialogImageUrl = data
          this.fileList.push(data)
          this.$message.success(mesg)
        } else {
          this.$message.error(mesg)
        }
      },
      //移除OSS图片钩子函数
      handleRemove (file, fileList) {
        let dataParam = {
          pictureName: file.name,
          ossPicturePath: this.ossPath.ossPath
        }
        this.ajaxFn.post({
          url: 'emall-manageplat/oss/deletePics',
          data: dataParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              this.$message.success('删除成功')
            }
          }
        })
      },
    }
  }
</script>

<style scoped>
  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    text-align: center;
  }
</style>
