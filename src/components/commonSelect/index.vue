<template>
  <el-select
    v-model="selectData.value"
    @change="changeValue"
    filterable
    :clearable="clearable"
    :disabled="disabled"
    :multiple="multiple"
    :placeholder="placeholder || select[target].placeholder"
  >
    <el-option  v-for="item in optionList" :value="item.value" :key="item.value" :label="item.label"></el-option>
  </el-select>
</template>

<script>
  /**
   * this.$refs.pageName.refresh(); // 重新获取下拉列表数据
   * this.$refs.pageName.getLabel(value); // 使用value获取对应的label
   * 回调 changeSelectedValue 参数1：选中的value，参数2：对象，包含选中的 value + label
   *
   * menu 菜单
   *
   */

  import AjaxFn from '@/plugin/api'
  import { mapGetters,mapActions } from 'vuex'
  export default {
    name: 'commonSelect',
    props: {
      searchData: {
        type: Object,
        default: () => {
          return {}
        }
      },
      multiple: {
        type: Boolean,
        default: false
      },
      clearable: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: ''
      },
      target: {
        type: String,
        default: ''
      },
      /** 初始值 initValue.value
       * multiple = true 的时候 value 需为数组，否则 为字符串
       */
      initValue: {
        type: Object,
        default: () => {
          return {}
        }
      },
      must: {
        type: Boolean,
        default: false
      },
      /** 增加前置选项
       * beforeOptions.option 需为数组 格式： [{value:value,label:label}]
       */
      beforeOptions: {
        type: Object,
        default: () => {
          return {}
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      size: {
        type: String,
        default: ''
      }
    },
    computed: {
      ...mapGetters(['select']),
      options(){
        let allOption = JSON.parse(JSON.stringify(this.select[this.target].data));
        if(this.beforeOptions.option && this.beforeOptions.option.length > 0){
          for(let before of this.beforeOptions.option){
            let val = before.value;
            let flag = false;
            for(let obj of this.select[this.target].data){
              if(obj.value === val){
                flag = true;
              }
            }
            if(!flag){
              allOption.unshift(before);
            }
          }
        }
        return allOption;
      }
    },
    watch: {
      'initValue': {
        handler: function (val, oldval) {
          this.selectData.value = val.value
        },
        deep: true
      }
    },
    data () {
      return {
        ajaxFn: new AjaxFn(this),
        selectData: {
          value: null
        },
        optionList: [],
        optionToLabel: {},
        sData: this.searchData,
        mustData: {
          value: []
        }
      }
    },
    methods: {
      ...mapActions(['setSelectData']),
      reSet(val){
        this.selectData.value = val;
      },
      refresh (sData) {
        if (sData) {
          this.sData = sData
        }
        this.selectData.value = null;

        this.getData()
      },
      getData () {
        if (!this.sData.current) {
          this.sData.current = 1;
        }
        if (!this.sData.size) {
          this.sData.size = 99999;
        }
        let target = this.select[this.target];
        this.ajaxFn[target.method]({
          url: target.requestUrl,
          data: this.sData
        }).then(res => {
          let {data, status} = res;
          if(status === 200){
            if(this.ajaxFn.respIsTrue(data)){
              let records;
              if(this.target === 'season'||this.target === 'category'){
                records = res.data.data;
              }else{
                records = res.data.data.records;
              }
              if (records.length > 0) {
                for (let obj of records) {
                  let label,value;
                  switch (this.target) {
                    case 'season': label = obj;
                      value = obj;
                      break;
                    case 'category': label = obj;
                      value = obj;
                      break;
                    case 'anchorAccount':
                      label = obj.name;
                      value = obj.username;
                      break;
                    default: label = obj.name
                      value = obj.id;
                  }
                  this.optionList.push({
                    value: value,
                    label: label
                  });
                }
                let optionList = JSON.parse(JSON.stringify(this.optionList));
                this.setSelectData({
                  target: this.target,
                  data: optionList,
                  searchData: JSON.stringify(this.sData)
                });
                /* 前置选项存在 */
                if(this.beforeOptions.option && this.beforeOptions.option.length > 0){
                  for(let before of this.beforeOptions.option){
                    let val = before.value;
                    let flag = false;
                    for(let obj of this.select[this.target].data){
                      if(obj.value === val){
                        flag = true;
                      }
                    }
                    if(!flag){
                      this.optionList.unshift(before);
                    }
                  }
                }

                this.returnOptionToLabel(['optionList']);

                if (this.must) {
                  this.setMustData();
                  this.changeValue();
                }
              }
            }
          }

        })
      },
      setMustData () {
        if (typeof this.selectData.value !== 'object') {
          this.selectData.value = []
        }
        let newValue = this.selectData.value.concat(this.mustData.value)
        this.selectData.value = Array.from(new Set(newValue))
      },
      getLabel (val) {
        return this.optionToLabel['optionList'][val].label
      },
      changeValue () {
        if (this.must) {
          this.setMustData()
        }
        let obj
        if (typeof this.selectData.value === 'object') {
          let ar = []
          for (let i of this.selectData.value) {
            ar.push(this.optionToLabel['optionList'][i])
          }
          obj = ar
        } else {
          obj = this.optionToLabel['optionList'][this.selectData.value]
        }

        this.$emit('changeSelectedValue', this.selectData.value, obj)
      },
      returnOptionToLabel (ar) {
        let optionToLabel = {}
        for (let i = 0; i < ar.length; i++) {
          let nr = ar[i]
          let tr = this[nr]
          optionToLabel[nr] = {}
          let no = optionToLabel[nr]
          for (let x = 0; x < tr.length; x++) {
            let trv = tr[x].value
            no[trv] = tr[x]
          }
        }
        this.optionToLabel = optionToLabel
      }
    },
    mounted () {
      if (!this.searchData.current) {
        this.searchData.current = 1
      }
      if (!this.searchData.size) {
        this.searchData.size = 99999
      }
      if (!this.must && this.select[this.target].data && this.select[this.target].searchData === JSON.stringify(this.searchData)) {
        /* 前置选项存在 */
        this.optionList = JSON.parse(JSON.stringify(this.select[this.target].data));
        if(this.beforeOptions.option && this.beforeOptions.option.length > 0){
          for(let before of this.beforeOptions.option){
            let val = before.value;
            let flag = false;
            for(let obj of this.select[this.target].data){
              if(obj.value === val){
                flag = true;
              }
            }
            if(!flag){
              this.optionList.unshift(before);
            }
          }
        }
        this.returnOptionToLabel(['optionList'])
      } else {
        this.getData()
      }

      this.selectData.value = this.initValue.value
    }
  }
</script>

<style lang="less" scoped>

</style>
