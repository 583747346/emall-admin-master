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
      :multiple="true"
      :data="ossPath"
      :file-list="fileList"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
      :limit="maxCount"
      :on-exceed="handleExceed">
      <i class="el-icon-plus uploader-icon"></i>
    </el-upload>
<!--    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>-->
  </div>
</template>
<script>

  export default {
    name: 'multiUpload',
    props: {
      //图片地址数组
      value: Array,
      //最大上传图片数量
      maxCount: {
        type: Number,
        default: 5
      },
      ossPath: '',
    },
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        dialogVisible: false,
        dialogImageUrl: null,
        ossUploadUrl: 'http://localhost:40005/emall-ums-service/oss/uploadPics',
      }
    },
    computed: {
      fileList () {
        let pictureList = []
        for (let i = 0; i < this.value.length; i++) {
          //这里必需要用url接收，不然会报错
          pictureList.push({ url: this.value[i] })
        }
        return pictureList
      }
    },
    methods: {
      handleImageList (fileList) {
        let pictures = [];
        for (let i = 0; i < fileList.length; i++) {
          pictures.push(fileList[i].url)
        }
        //同步父组件绑定数据
        this.$emit('input', pictures)
      },
      //图片上传处理成功返回图片地址
      handleUploadSuccess (res, file) {
        let { data, code, mesg } = res
        if (code === '200') {
          this.dialogImageUrl = data
          this.fileList.push({
            name: file.name,
            url: data
          })
          this.handleImageList(this.fileList)
          this.$message.success(mesg)
        } else {
          this.$message.error(mesg)
        }
      },
      handlePreview (file) {
        this.dialogVisible = true
        this.dialogImageUrl = file.url
      },
      //移除OSS图片钩子函数
      handleRemove (file, fileList) {
        let dataParam = {
          pictureName: file.name,
          ossPicturePath: this.ossPath.ossPath
        }
        this.ajaxFn.post({
          url: 'emall-ums-service/oss/deletePics',
          data: dataParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              //删除fileList中的对应地址
              this.handleImageList(fileList)
              this.$message.success('删除成功')
            }
          }
        })
      },
      handleExceed (files, fileList) {
        this.$message.warning(`当前限制选择【5】个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
      },
    }
  }
</script>
<style lang="less" scoped>

  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    line-height: 150px;
    text-align: center;
  }

</style>


