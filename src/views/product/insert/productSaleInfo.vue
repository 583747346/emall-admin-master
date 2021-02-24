<template>
  <div class="product-sale-info">
    <el-form :model="productForm" ref="productSaleForm" label-width="120px" style="width: 600px" size="small">
      <el-form-item label="赠送积分：">
        <el-input-number v-model="productForm.purchasePoint" controls-position="right"
                         :min="0"></el-input-number>
      </el-form-item>
      <el-form-item label="赠送成长值：">
        <el-input-number v-model="productForm.purchaseGrowth" controls-position="right"
                         :min="0"></el-input-number>
      </el-form-item>
      <el-form-item label="积分购买限制：">
        <el-input-number v-model="productForm.usePointLimit" controls-position="right"
                         :min="0"></el-input-number>
      </el-form-item>
      <el-form-item label="商品限购数量：">
        <el-input-number v-model="productForm.promotionLimit" controls-position="right"
                         :min="0"></el-input-number>
      </el-form-item>
      <el-form-item label="商品上架：">
        <el-switch
          v-model="productForm.publishStatus"
          :active-value="1"
          :inactive-value="0">
        </el-switch>
      </el-form-item>
      <el-form-item label="新老品：">
        <el-switch
          v-model="productForm.newStatus"
          :active-value="1"
          :inactive-value="0">
        </el-switch>
      </el-form-item>
      <el-form-item label="商品推荐：">
        <el-switch
          v-model="productForm.recommandStatus"
          :active-value="1"
          :inactive-value="0">
        </el-switch>
      </el-form-item>
      <el-form-item label="服务保证：">
        <el-checkbox-group :indeterminate="isIndeterminate" v-model="selectServiceList"
                           @change="handleCheckedCitiesChange">
          <el-checkbox v-for="service in serviceArray" :label="service" :key="service">{{service}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="详细页标题：">
        <el-input v-model="productForm.detailTitle"></el-input>
      </el-form-item>
      <el-form-item label="详细页描述：">
        <el-input
          :autoSize="true"
          v-model="productForm.detailDesc"
          type="textarea"
          placeholder="请输入内容...">
        </el-input>
      </el-form-item>
      <el-form-item label="详情内容：">
        <el-input
          :autoSize="true"
          v-model="productForm.detailContent"
          type="textarea"
          placeholder="请输入内容...">
        </el-input>
      </el-form-item>
      <el-form-item label="选择优惠方式：">
        <el-radio-group v-model="productForm.promotionType" size="small">
          <el-radio-button :label="0">没有优惠</el-radio-button>
          <el-radio-button :label="1">特惠促销</el-radio-button>
          <el-radio-button :label="2">会员价格</el-radio-button>
          <el-radio-button :label="3">满减价格</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="productForm.promotionType===1">
        <el-form-item label="促销时间：" style="margin-left: -38px;">
          <el-date-picker
            v-model="daterange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="left"
            @change='selectData(daterange)'
            clearable>
          </el-date-picker>
        </el-form-item>
        <div>
          <span style="margin-right: 12px">促销价格：</span>
          <el-input style="width: 220px" v-model="productForm.promotionPrice" placeholder="输入促销价格">
            <i slot="suffix" style="font-style:normal;margin-right: 10px;color: #42b983;">元</i>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item v-show="productForm.promotionType===2">
        <el-card shadow="never">
          <el-form size="small" label-width="140px" v-for="(item, index) in productForm.productMemberPriceVos">
            <el-form-item :label="item.memberLevelName+'：'">
              <el-input v-model="item.memberPrice" placeholder="请输入会员价">
                <i slot="suffix" style="font-style:normal;margin-right: 10px;color: #42b983;">元</i>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-form-item>
      <el-form-item v-show="productForm.promotionType===3">
        <el-table :data="productForm.productFullPromotionVos" style="width: 100%" border
                  :header-cell-style="{background:'#f0f9eb',color:'black'}">
          <el-table-column
            label="满"
            align="center"
            width="120">
            <template slot-scope="scope">
              <el-input v-model="scope.row.fullPrice">
                <i slot="suffix" style="font-style:normal;margin-right: 10px;color: #42b983;">元</i>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="立减"
            align="center"
            width="120">
            <template slot-scope="scope">
              <el-input v-model="scope.row.reducePrice">
                <i slot="suffix" style="font-style:normal;margin-right: 10px;color: #42b983;">元</i>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="操作">
            <template slot-scope="scope">
              <el-button type="success" size="medium" plain @click="deleteFullReduction(scope.$index, scope.row)">删除
              </el-button>
              <el-button type="danger" size="medium" plain @click="addFullReduction(scope.$index, scope.row)">添加
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="danger" size="medium" style="width: 80px" @click="handlePre" icon="el-icon-back"></el-button>
        <el-button type="success" size="medium" style="width: 80px" @click="handleNext" icon="el-icon-right"></el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'productSaleInfo',
    props: {
      productForm: Object,
    },
    data () {
      return {
        ajaxFn: new this._AjaxFn(this),
        selectServiceList: [],
        serviceArray: ['无忧退货', '快速退款', '免费包邮'],
        isIndeterminate: true,
        //时间范围
        daterange: null
      }
    },
    created () {
      //获取会员等级信息
      this.getMemberRankList()
    },
    methods: {
      //日期选择，分离级联日期到不同字段
      selectData (e) {
        if (e != null) {
          console.log(e[0])
          this.productForm.promotionStartTime = e[0]
          this.productForm.promotionEndTime = e[1]
        }
      },
      //商品服务列表---复选框选择
      handleCheckedCitiesChange (value) {
        let checkedCount = value.length
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.serviceArray.length
        this.productForm.serviceList = value.join(',')
      },
      //获取会员等级列表
      getMemberRankList () {
        let param = {
          current: 0,
          size: 9999
        }
        this.ajaxFn.post({
          url: 'emall-manageplat/member-rank/memberRankList',
          data: param
        }).then(res => {
          let { data, status } = res
          if (status === 200) {
            let memberPriceList = []
            if (this.ajaxFn.respIsTrue(data)) {
              this.brandList = data.data.records
              for (let i = 0; i < data.data.records.length; i++) {
                memberPriceList.push({
                  memberLevelId: data.data.records[i].id,
                  memberLevelName: data.data.records[i].rank
                })
              }
              this.productForm.productMemberPriceVos = memberPriceList
            }
          }
        })
      },
      //满减优惠删除
      deleteFullReduction (item, index) {
        if (this.productForm.productFullPromotionVos.length == 1) {
          this.$message.error('至少要保留一个满减价格')
          return
        }
        this.productForm.productFullPromotionVos.splice(index, 1)
      },
      //满减又会添加
      addFullReduction () {
        this.productForm.productFullPromotionVos.push({
          count: 0,
          discount: 0,
          price: 0
        })
      },
      //返回上一步---基本信息
      //$emit触发父组件中自定义的事件
      handlePre () {
        this.$emit('preStep')
      },
      //下一步---规格属性维护
      handleNext () {
        this.$emit('nextStep')
      }
    }
  }
</script>

<style scoped>
  .product-sale-info {
    left: 0;
    right: 0;
    width: 720px;
    padding: 35px 0px 0px 35px;
    margin: 0 auto;
  }

</style>
