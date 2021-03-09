<template xmlns="http://www.w3.org/1999/html">
  <div class="product-attribute-info">
    <el-form :model="productForm" ref="productAttrForm" label-width="120px" style="margin-top:20px;width: 100%"
             size="small">
      <el-form-item label="商品规格：">
        <el-card shadow="never">
          <div v-for="(specs,index) in productSpecs">
            <span style="font-size: medium">{{specs.name}}</span>
            <el-checkbox v-for="(specValue,idx) in specs.attributeList" :label="specValue.value"
                         :key="specs.value"
                         :value="specs.value"
                         :checked="specValue.checked"
                         @change="checkChange(index,idx,specValue)"
                         :style="idx===0 ? 'margin-right: 10px !important; margin-left:20px':'margin-right: 10px !important;'">
            </el-checkbox>
          </div>
        </el-card>
        <el-table style="width: 100%;margin-top: 10px"
                  :data="productForm.productSkus" :header-cell-style="{background:'#f0f9eb',color:'black'}"
                  border>
          <el-table-column
            width="100px"
            v-for="(item,index) in checkedProductSpecs"
            :label="item"
            :key="item"
            align="center">
            <template slot-scope="scope">
              {{getProductSkuSp(scope.row,item)}}
            </template>
          </el-table-column>
          <el-table-column
            label="销售价格"
            align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.price"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="商品库存"
            align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.stock"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="库存预警值"
            align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.lowStock"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center">
            <template slot-scope="scope">
              <el-tooltip effect="dark" content="删除" placement="top-start">
                <el-button
                  type="danger" size="mini" icon="el-icon-delete"
                  @click="removeProductSku(scope.$index, scope.row)">
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="sku图片：">
        <el-card shadow="never">
          <label class="tips">* 只能上传jpg/png文件，且不超过500kb</label>
          <div v-for="(item,index) in productForm.productSkus">
            <span v-for="row in getSpecication(item)"
                  style="margin-right:20px;">{{row.key}}：{{row.value}}</span>
            <!--这里value与file是上传文件后的返回值，item为自己的参数-->
            <el-upload
              class="sku-upload"
              multiple
              action="http://localhost:40005/emall-goods-service/oss/uploadPics"
              :data="ossSkuPath"
              list-type="picture-card"
              :on-success="(value,file)=>handleUploadSuccess(value,file,item)"
              :on-preview="handlePreview"
              :on-remove="(file,fileList)=>handleRemove(file,fileList,item)"
              :limit="5"
              :on-exceed="handleExceed">
              <i class="el-icon-plus uploader-icon"></i>
            </el-upload>
            <el-dialog :visible.sync="dialogVisible">
              <img :src="dialogImageUrl" alt="">
            </el-dialog>
          </div>
        </el-card>
      </el-form-item>

      <el-form-item label="商品参数：">
        <el-card shadow="never">
          <div class="add-param-button">
            <el-button plain type="success" size="small">增添</el-button>
          </div>
          <div v-for="(item,index) in productParam">
            <div class="paramLabel"><span style="margin-right: 10px;width:60px;">{{item.name}}:</span>
              <el-select v-model="productParam[index].value" collapse-tags multiple clearable
                         style="width: 200px;margin-right: 80px"
                         @change="selectParam(item)">
                <el-option
                  v-for="item in getParamsValue(item.attributeList)"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </div>
          </div>
        </el-card>
      </el-form-item>
      <el-form-item label="商品相册：">
        <el-card shadow="never">
          <multi-upload v-model="selectProductPics" :ossPath="ossPath"></multi-upload>
        </el-card>
      </el-form-item>
      <el-form-item label="详情页：">
        <el-tabs v-model="activeHtml" type="border-card">
          <el-tab-pane label="电脑端商品详情" name="computer">
            <quill-editor v-model="productForm.pcDetailPage" :options="editorOption"
                          :value="productForm"></quill-editor>
          </el-tab-pane>
          <el-tab-pane label="移动端商品详情" name="mobile">
            <quill-editor v-model="productForm.mobileDetailPage" :options="editorOption"></quill-editor>
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="danger" size="medium" style="width: 80px" @click="handlePre" icon="el-icon-back"></el-button>
        <el-button type="success" size="medium" style="width: 80px" @click="handleNext"
                   icon="el-icon-right"></el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import multiUpload from '@/components/upload/multiUpload.vue'
  import singleUpload from '../../../components/upload/singleUpload'

  export default {
    name: 'productAttributeInfo',
    components: {
      multiUpload,
      singleUpload
    },
    props: {
      productForm: Object,
      categoryId: [String]
    },
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        //富文本编辑器placeholder
        editorOption: {
          placeholder: '请在这里输入...',
        },
        //该分类的规格列表
        productSpecs: [],
        //选中的商品规格
        checkedProductSpecs: [],
        //该分类的商品参数
        productParam: [],
        //默认打开的详情页界面
        activeHtml: 'computer',
        //oss上传图片的文件夹
        ossPath: { ossPath: 'GOODS' },
        //sku图片
        ossSkuPath: { ossPath: 'GOODS_SKU' },
        dialogVisible: false,
        dialogImageUrl: null,
        skuPictureList: [],
      }
    },
    computed: {
      selectProductPics: {
        get: function () {
          let album = []
          if (this.productForm.albumPics === undefined || this.productForm.albumPics == null || this.productForm.albumPics === '') {
            return album
          }
          let albumPics = this.productForm.albumPics.split(',')
          for (let i = 0; i < albumPics.length; i++) {
            album.push(albumPics[i])
          }
          return album
        },
        set: function (newValue) {
          if (newValue == null || newValue.length === 0) {
            this.productForm.albumPics = null
          } else {
            this.productForm.albumPics = ''
            for (let i = 0; i < newValue.length; i++) {
              this.productForm.albumPics += newValue[i]
              if (i !== newValue.length - 1) {
                this.productForm.albumPics += ','
              }
            }
          }
        }
      }
    },
    //监听品类的变化
    watch: {
      'categoryId': {
        handler: function (oldValue, newValue) {
          //1.第一次刚进入页面，品类为空，也会执行，这里return掉
          //2.当清空分类下拉框数据，也就是categoryId为空，这里直接return掉
          if (newValue === '' || this.categoryId === '') {
            return
          }
          //根据品类获取规格信息
          this.getSpecsByCategoryId()
          //根据品类获取商品参数
          this.getParamsByCategoryId()
        },
        deep: true
      }
    },
    methods: {
      //根据品类id获取规格列表信息
      getSpecsByCategoryId () {
        this.ajaxFn.get({
          url: 'emall-goods-service/product-attribute/getAttributeByCategoryId/' + this.productForm.productCategoryId + '/' + 0
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            let result = data.data
            let specs = []
            for (let i = 0; i < result.length; i++) {
              let specValue = []
              for (let j = 0; j < result[i].attributeList.split(",").length; j++) {
                specValue.push({
                  value: result[i].attributeList.split(',')[j],
                  checked: false
                })
              }
              specs.push({
                attributeList: specValue,
                name: result[i].name,
                id: result[i].id
              })
            }
            this.productSpecs = specs
          }
        })
      },
      //规格选择【选中每个checkbox触发响应】
      checkChange (idx_level1, idx_level2, row) {
        //修改每个选中的规格值得checked
        this.productSpecs[idx_level1].attributeList[idx_level2].checked = !row.checked
        //循环判断当前规格是否有选中的值，有则加入checkedProductSpecs
        for (let i = 0; i < this.productSpecs[idx_level1].attributeList.length; i++) {
          //这里主要是添加选中的规格属性显示在table列头  【去重】
          if (this.productSpecs[idx_level1].attributeList[i].checked) {
            if (this.checkedProductSpecs.indexOf(this.productSpecs[idx_level1].name) === -1) {
              this.checkedProductSpecs.push(this.productSpecs[idx_level1].name)
            }
          }
        }

        /******当某个规格里面的值都没有选中，去掉table中的该规格的表头列*********/
        let checkedCount = 0
        for (let i = 0; i < this.productSpecs[idx_level1].attributeList.length; i++) {
          if (this.productSpecs[idx_level1].attributeList[i].checked) {
            checkedCount++
          }
        }
        if (checkedCount === 0) {
          let position = this.checkedProductSpecs.indexOf(this.productSpecs[idx_level1].name)
          if (position > -1) {
            this.checkedProductSpecs.splice(position, 1)
          }
        }
        /*********************************************************/

        /***********************笛卡尔积，计算sku********************/
        let cartesian = this.createCartesian(this.productSpecs)
        //将规格属性置为一个json字符串，主要是为了传给后端保存数据库sku表
        //checkedProductSpecs选中的规格，productSpecs选中的值
        for (let k = 0; k < cartesian.length; k++) {
          let specification = []
          for (let j = 0; j < this.checkedProductSpecs.length; j++) {
            //通过比较cartesian中的字段列是否存在于已选的规格，进行判断组装成json数组：
            //例如cartesian中的{尺码：M，颜色：红色，price：10，stock：30，……}通过判断已选的checkedProductSpecs的规格进行判断
            //存在，则push进入specification，最后生成key-value形式的字符串
            if (JSON.parse(JSON.stringify(cartesian[k]))[this.checkedProductSpecs[j]] != null) {
              specification.push({
                key: this.checkedProductSpecs[j],
                value: cartesian[k][this.checkedProductSpecs[j]]
              })
            }
          }
          // 数组转为字符串
          cartesian[k].specification = JSON.stringify(specification)
        }
        this.productForm.productSkus = cartesian
      },
      //笛卡尔积动态生成sku条目
      createCartesian (arr) {
        let handleArra = []
        //获取选中的数据,去除没有选择的项，否则下面reduce聚合会出问题
        for (let i = 0; i < arr.length; i++) {
          let res = arr[i].attributeList.filter(s => s.checked == true)
          if (res.length > 0) {
            handleArra.push({
              attributeList: res,
              name: arr[i].name
            })
          }
        }
        return handleArra.reduce((last, spec, index) => {
          let result = []
          last.forEach(o => {
            for (let i = 0; i < spec.attributeList.length; i++) {
              const obj = {}
              if (spec.attributeList[i].checked) {
                const option = spec.attributeList[i].value
                Object.assign(obj, o)
                obj[spec.name] = option
                // 拼接当前这个特有属性的索引
                obj.indexes = (o.indexes || '') + '_' + i
                if (index === handleArra.length - 1) {
                  // 如果发现是最后一组，则添加价格、库存等字段
                  Object.assign(obj, {
                    price: 0,
                    stock: 0,
                    lowStock: 0,
                    picture: 0
                  })
                  // 去掉索引字符串开头的下划线
                  obj.indexes = obj.indexes.substring(1)
                }
                result.push(obj)
              }
            }
          })
          return result
        }, [{}])
      },
      //动态sku表，规格列由于key为中文进行处理
      getProductSkuSp (row, value) {
        let jsonstr = JSON.parse(JSON.stringify(row))
        return jsonstr[value]
      },
      //根据品类id获取商品参数列表信息
      getParamsByCategoryId () {
        this.ajaxFn.get({
          url: 'emall-goods-service/product-attribute/getAttributeByCategoryId/' + this.productForm.productCategoryId + '/' + 1
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            let paramList = []
            for (let i = 0; i < data.data.length; i++) {
              //这里主要是添加一个状态，主要是为了后面多选，以及判断是否选择参数
              this.productParam.push({
                id: data.data[i].id,
                name: data.data[i].name,
                status: false,
                attributeList: data.data[i].attributeList,
                values: ''
              })
            }
          }
        })
      },
      //获取每个参数列表下的值
      getParamsValue (value) {
        let param = value.split(',')
        return param
      },
      removeProductSku (index, row) {
        let list = this.productForm.productSkus
        if (list.length === 1) {
          list.pop()
        } else {
          list.splice(index, 1)
        }
      },
      //商品规格描述
      getSpecication (row) {
        let specAttr = JSON.parse(row.specification)
        return specAttr
      },

      //商品属性参数选中
      selectParam (row) {
        row.status = false
        if (row.value.length > 0) {
          row.status = true
        }
      },
      //获取已选择的商品参数
      handleAttributeParams () {
        for (let i = 0; i < this.productParam.length; i++) {
          // console.log('+++++++' + this.productParam[i].find(item => item.key === value))
          if (this.productParam[i].status) {
            this.productForm.prodcutAttributeParams.push({
              paramId: this.productParam[i].id,
              paramValue: this.productParam[i].value
            })
          }
        }
      },

      /******************************sku图片导入*************************/
      handlePreview (file) {
        this.dialogVisible = true
        this.dialogImageUrl = file.url
      },
      handleUploadSuccess (res, file, item) {
        console.log(file.name)
        let pictures = []
        let { data, code, mesg } = res
        if (code === '200') {
          this.dialogImageUrl = data
          pictures.push(data)
          for (let i = 0; i < item.picture.length; i++) {
            pictures.push(item.picture[i])
          }
          item.picture = pictures
          this.$message.success(mesg)
        } else {
          this.$message.error(mesg)
        }
      },
      handleExceed (files, fileList) {
        this.$message.warning(`当前限制选择【5】个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
      },
      //这里必须要用res，不然会接收不到待删除的文件信息
      handleRemove (file, fileList, item) {
        let dataParam = {
          pictureName: file.name,
          ossPicturePath: this.ossSkuPath.ossPath
        }
        this.ajaxFn.post({
          url: 'emall-goods-service/oss/deletePics',
          data: dataParam
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            if (this.ajaxFn.respIsTrue(data)) {
              //删除fileList中的对应地址
              let pictures = []
              for (let i = 0; i < fileList.length; i++) {
                pictures.push(fileList[i].response.data)
              }
              item.picture = pictures
              this.$message.success('删除成功')
            }
          }
        })
      },
      /*****************************************************************/
      //上一步
      handlePre () {
        this.$emit('preStep')
      },
      handleNext () {
        //这里处理商品属性参数，获取已选的参数列表
        this.handleAttributeParams()
        this.$emit('nextStep')
      }
    }
  }
</script>

<style lang="less" scoped>
  .product-attribute-info {
    left: 0;
    right: 0;
    width: 900px;
    padding: 35px 0px 0px 35px;
    margin: 0 auto;
  }

  .paramLabel {
    display: flex;
    margin: 10px 0;
    float: left;
  }

  .tips {
    font-size: 10px;
    color: #df5000;
    line-height: 20px;
    font-family: "微软雅黑 Light"
  }

  /**************************处理sku图片上传图片边框的大小*******************************/
  .sku-upload /deep/ .el-upload--picture-card {
    width: 100px;
    height: 100px;
  }

  .sku-upload /deep/ .el-upload {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }

  .sku-upload /deep/ .el-upload-list--picture-card .el-upload-list__item {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }

  .sku-upload /deep/ .el-upload-list--picture-card .el-upload-list__item-thumbnail {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }

  .sku-upload /deep/ .avatar {
    width: 100px;
    height: 100px;
  }

  /**************************处理sku图片上传图片边框的大小*******************************/

  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    line-height: 100px;
    text-align: center;
  }

  .add-param-button{
    display: flex;
    justify-content: flex-end;
  }
</style>
