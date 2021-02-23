<template>
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
            width="120px"
            label="SKU编号"
            align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.skuCode"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            width="120px"
            label="销售价格"
            align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.price"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            width="120px"
            label="商品库存"
            align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.stock"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            width="120px"
            label="库存预警值"
            align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.lowStock"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            width="100px"
            label="sku图片"
            align="center">
            <template slot-scope="scope">
              <el-upload
                class="sku-upload"
                action="http://localhost:40005/emall-manageplat/oss/uploadPics"
                :data="ossPath"
                :show-file-list="false"
                :on-success="uploadSkuPictureSuccess">
                <img v-if="scope.row.picture" :src="scope.row.picture" class="sku-picture">
                <i v-else class="el-icon-plus logo-uploader-icon"></i>
              </el-upload>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            width="120px"
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
        <el-card shadow="never" class="cardBg">
          <div v-for="(item,index) in checkedProductSpecs">
            <span>{{item.name}}:</span>
            <single-upload v-model="item.pic"
                           style="width: 300px;display: inline-block;margin-left: 10px"></single-upload>
          </div>
        </el-card>
      </el-form-item>

      <el-form-item label="商品参数：">
        <el-card shadow="never">
          <div v-for="(item,index) in productParam">
            <div class="paramLabel"><span style="margin-right: 10px;width:60px;">{{item.name}}:</span>
              <el-select v-model="productParam[index].value" clearable style="width: 200px;margin-right: 80px">
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
            <quill-editor v-model="productForm.pcDetailPage" :options="editorOption" :value="productForm"></quill-editor>
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
        ossSkuPath: { ossPath: 'SKU' },
        //sku上传图片的回调返回地址
        skupicture: '',
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
    created () {
      console.log(this.categoryId)
    },
    //监听品类的变化
    watch: {
      'categoryId': {
        handler: function (oldValue, newValue) {
          //第一次刚进入页面，品类为空，也会执行，这里return掉
          if (newValue === '') {
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
          url: 'emall-manageplat/product-attribute/getAttributeByCategoryId/' + this.productForm.productCategoryId + '/' + 0
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
                    skuCode: '',
                    picture: ''
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
          url: 'emall-manageplat/product-attribute/getAttributeByCategoryId/' + this.productForm.productCategoryId + '/' + 1
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            this.productParam = data.data
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
      //上传sku图片
      uploadSkuPictureSuccess (row, res, file) {
        console.log(file.name)
        this.brandForm.brandfile = file.name
        let { data, code, mesg } = res
        if (code === '200') {
          row.picture = data
          this.$message.success(mesg)
        } else {
          this.$message.error(mesg)
        }
      },
      //上一步
      handlePre () {
        this.$emit('preStep')
      },
      handleNext () {
        this.$emit('nextStep')
      }
    }
  }
</script>

<style scoped>
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

  .sku-picture {
    width: 40px;
    height: 40px;
    display: block;
    margin: 0 auto;
  }

  .sku-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 40px;
    height: 40px;
    margin: 0 auto;
  }

  .logo-uploader-icon {
    font-size: 16px;
    color: #8c939d;
    width: 40px;
    height: 40px;
    text-align: center;
    transform: translateY(15%);
  }
</style>
