<template>
  <div class="multi-cascader">
    <Dropdown :trigger="'click'"
              :transfer="transfer"
              :stop-propagation="true"
              :transfer-class-name="`${popperClass} ${unid}`"
              @on-visible-change="visibleChange"
              v-bind="$attrs">
      <div class="labels"
           :class="{'clearable':clearable && value.length > 0}">
        <div v-if="selectedLabels.length > 0"
             class="tags">
          <Tag v-for="(tag, index) in selectedLabels"
               :key="value[index]"
               closable
               @on-close="removeOne(tag)">
            {{ tag }}
          </Tag>
        </div>
        <p v-else
           class="placeholder-text">{{placeholder}}</p>
        <!-- 清空 -->
        <span v-if="clearable && value.length > 0"
              class="r-icon clear"
              @click.stop.prevent="handleClear">
          <Icon type="ios-close-circle-outline"></Icon>
        </span>
        <!-- 下拉icon -->
        <span>
          <Icon class="r-icon exp"
                type="ios-arrow-down"></Icon>
        </span>
      </div>
      <div slot="list"
           class="dropdown-items">
        <div class="ground"
             :style="{width: activeClassByWidth + 'px'}"
             @click.stop>
          <div class="ground-item">
            <render-list :list="root.childNodes"
                         :level="1"
                         :active-list="activeList"
                         :notUseAble="notUseAble"
                         @handle-click="handleClick"
                         @handle-check="handleCheck"
                         :label-key="labelKey"
                         :expand-trigger="expandTrigger"></render-list>
          </div>
          <template v-for="item in maxLevellist">
            <!-- :style="{left: (160 * item.id) + 'px'}" -->
            <div v-if="item.rendered && showData[item.id].length"
                 v-show="activeList.length >= item.id"
                 :key="item.id"
                 class="ground-item ground-pos">
              <render-list :list="showData[item.id]"
                           :level="item.id + 1"
                           :active-list="activeList"
                           :notUseAble="notUseAble"
                           @handle-click="handleClick"
                           @handle-check="handleCheck"
                           :label-key="labelKey"
                           :expand-trigger="expandTrigger"></render-list>
            </div>
          </template>
        </div>
      </div>
    </Dropdown>
  </div>
</template>

<script>
import TreeStore from './lib/Tree.js'
import renderList from './render-list.vue'
import _ from 'lodash'
export default {
  name: 'iv-cascader-multi',
  components: {
    renderList
  },
  props: {
    // 是否放在body下面展示list
    transfer: {
      type: Boolean,
      default: false
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择'
    },
    // 最大选择数
    maxCount: {
      type: Number
    },
    // 标签是否可以全部清空
    clearable: {
      type: Boolean,
      default: false
    },
    // 列表数据
    data: {
      type: Array,
      default: () => [],
      required: true
    },
    // 是否只显示选中的
    onlyShowChecked: {
      type: Boolean,
      default: false
    },
    isShowIndeterminate: {
      // 是否显示半选
      type: Boolean,
      default: true
    },
    // v-model值，页面刷新默认值（只需传选中的id，eg：['jiaohu', 'yizhi']）注意不要传重复，传了父节点就不要传子节点（错误案例：['zhinan', 'yizhi']）
    value: {
      type: Array,
      required: true
    },
    // 分隔符（onlyShowChecked为false时有效）
    separator: {
      type: String,
      default: '-'
    },
    // ------暂不支持搜索---------------
    // 是否可搜索
    filterable: {
      type: Boolean,
      default: false
    },
    // 自定义搜索方法
    filterMethod: {
      type: Function
    },
    // Select 下拉框的类名
    popperClass: {
      type: String,
      default: 'ivu-multi-cascader'
    },
    // 作为 value 唯一标识的键名，绑定值为对象类型时必填
    valueKey: {
      type: String,
      default: 'value'
    },
    // 作为 label 唯一标识的键名，绑定值为对象类型时必填
    labelKey: {
      type: String,
      default: 'label'
    },
    // 作为 children 唯一标识的键名，绑定值为对象类型时必填
    childrenKey: {
      type: String,
      default: 'children'
    },
    // 下级展开方式
    expandTrigger: {
      type: String,
      default: 'click'
    },
    // 是否允许父子联动
    selectChildren: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 唯一类 面板
      unid: 'uid-' + this.getKey(),
      activeClass: '',
      // 选择的label
      selectedLabels: [],
      // 选择的id
      selectedIds: [],
      // 选择的节点
      selectedNodes: [],
      // 数据存储容器
      store: {},
      // 根节点组
      root: [],
      // 最高层级的数据 @data id:1 rendered:true
      maxLevellist: [],
      // 节点后面的组
      showData: {},
      activeList: [],
      // 搜索
      searchText: '',
      searchResult: []
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    // 面板宽度
    activeClassByWidth() {
      if (!this.activeClass) return 160
      return 160 * +this.activeClass
    },
    // 是不是在搜素
    isSearching() {
      return !(this.searchText.trim() === '')
    },
    // 不可用
    notUseAble() {
      return this.maxCount && this.selectedIds.length >= this.maxCount
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.init()
      }
    },
    selectedNodes() {
      this.$emit(
        'change',
        this.selectedNodes.map(o => o[this.valueKey])
      )
    },
    value: {
      deep: true,
      handler(n, o) {
        if (!n || !o || JSON.stringify(n) === JSON.stringify(o)) return
        if (!this.notUseAble) return
        this.$emit('input', n.slice(0, this.maxCount))
        this.renderData()
      }
    }
  },
  methods: {
    // 弹出层的展示和取消
    visibleChange(v) {
      if (!v) {
        this.searchText = ''
      }
      this.$emit('visible-change', v)
    },
    // 全部清空
    handleClear() {
      this.$emit('input', [])
      this.store.nodeList.forEach(targetNode => {
        if (targetNode) {
          targetNode.check(false)
        }
      })
      this.selectedNodes = []
      this.selectedLabels = []
      this.selectedIds = []
      this.$emit('clear')
    },
    // 搜索
    innerFilterMethod(v) {
      this.searchText = v
      let tempResult = this.store.nodeList
      if (v.trim() !== '') {
        this.activeClass = ''
        if (typeof this.filterMethod === 'function') {
          this.searchResult = this.filterMethod(tempResult, v)
        } else {
          tempResult = tempResult.filter(o => o.isLeaf)
          tempResult = tempResult.filter(o => o.showLabel.includes(v))
          this.searchResult = tempResult
        }
      } else {
        this.activeClass = '1'
      }
    },
    // 唯一key v-for
    getKey() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = (Math.random() * 16) | 0
        let v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
    // 面板一层点击
    handleClick(node, levelIndex, level) {
      if (this.maxLevellist[level - 1]) {
        this.maxLevellist[level - 1].rendered = true
      }
      this.activeClass = `${node.isLeaf ? level : level + 1}`
      let tempList = _.cloneDeep(this.activeList)
      if (level < tempList.length) {
        tempList.splice(level)
      }
      tempList[level - 1] = node.id
      this.showData[level] = node.childNodes
      this.activeList = tempList
    },
    // 半选状态
    isIndeterminate(level, nodeList) {
      if (level === 0) return
      nodeList.forEach(node => {
        let checkedlList = node.childNodes.filter(child => child.checked)
        if (node.level - level === -1) {
          node.indeterminate = false
          let indeterminatelist = node.childNodes.filter(
            child => child.indeterminate
          )
          let sumLength = checkedlList.length + indeterminatelist.length
          if (sumLength && checkedlList.length < node.childNodes.length) {
            node.indeterminate = true
            this.isIndeterminate(level - 1, this.root.childNodes)
          }
        } else if (node.level !== level) {
          this.isIndeterminate(level, node.childNodes)
        }
        if (checkedlList.length === node.childNodes.length) {
          node.indeterminate = false
        }
      })
    },
    // 获取value
    getValue() {
      let result = this.selectedNodes.map(o => {
        if (!this.onlyShowChecked) {
          let level = o.level
          let valueKey = ''
          let node = _.cloneDeep(o)
          while (level !== 0) {
            valueKey =
              node[this.valueKey] + (valueKey ? this.separator : '') + valueKey
            node = node.parent
            level--
          }
          return valueKey
        }
        return o[this.valueKey]
      })
      return result
    },
    // 面板复选框选中
    handleCheck(node) {
      node.check(node.checked)
      this.selectedIds = this.store.selectedIds
      this.updateSelect(this.store.selectedIds)
      const result = this.getValue()
      this.$emit('input', result)
      this.$nextTick(() => {
        if (this.isShowIndeterminate && this.selectChildren) {
          this.isIndeterminate(node.level, this.root.childNodes)
        }
      })
    },
    // 标签单个删除
    removeOne(v) {
      let targetNode = _.find(this.selectedNodes, { showLabel: v })
      if (!this.onlyShowChecked) {
        let str = v.substring(v.lastIndexOf(this.separator) + 1)
        targetNode = _.find(this.selectedNodes, { showLabel: str })
      }
      targetNode.checked = false
      this.handleCheck(targetNode)
      this.$emit('remove-tag', v)
    },
    // 选中数据更新转态
    updateSelect(data, needCheckNode = false, setValue = false) {
      let tempSelectedNodes = []
      let tempSelectedLabels = []
      let tempSelectedIds = []
      data.forEach(o => {
        let targetNode
        if (setValue) {
          targetNode = _.find(this.store.nodeList, v => `${v.id}` === `${o}`)
          // tempSelectedIds.push(targetNode.id);
          tempSelectedIds.push(o)
        } else {
          targetNode = this.store.nodesMap[o]
          tempSelectedIds.push(o)
        }
        if (targetNode) {
          needCheckNode && targetNode.check(true)
          let label = ''
          if (!this.onlyShowChecked) {
            let level = targetNode.level
            let node = _.cloneDeep(targetNode)
            while (level !== 0) {
              label = node.showLabel + (label ? this.separator : '') + label
              node = node.parent
              level--
            }
          } else {
            label = targetNode.showLabel
          }
          tempSelectedNodes.push(targetNode)
          tempSelectedLabels.push(label)
        }
      })
      this.selectedNodes = tempSelectedNodes
      this.selectedLabels = tempSelectedLabels
      this.selectedIds = tempSelectedIds
    },
    // 初始化
    init() {
      this.store = new TreeStore({
        data: this.data,
        isShowIndeterminate: this.isShowIndeterminate,
        selectChildren: this.selectChildren,
        separator: this.separator,
        valueKey: this.valueKey,
        labelKey: this.labelKey,
        childrenKey: this.childrenKey
      })
      this.root = this.store.root
      this.maxLevellist = Array.from(
        { length: this.store.maxLevel - 1 },
        (v, i) => {
          this.showData[i + 1] = []
          return {
            id: i + 1,
            rendered: false
          }
        }
      )
      // 根据this.value找到id组
      this.renderData()
    },
    // 回显
    renderData() {
      // 根据this.value找到id组
      const tempSelectedIds = this.value.map(value => {
        const { valueKey, nodeList, separator } = this.store
        const vs = value.split(separator)
        const last = vs[vs.length - 1]
        const targetNode = _.find(
          nodeList,
          item => `${item[valueKey]}` === `${last}`
        )
        return targetNode.id
      })

      this.updateSelect(tempSelectedIds, true, true)
      this.store.selectedIds = this.selectedIds
    }
  }
}
</script>
<style lang="less" scoped>
.multi-cascader {
  min-width: 160px;
  position: relative;

  & /deep/ .ivu-select-dropdown {
    max-height: none !important;
    left: 0 !important;
  }
}
// 显示点击
.labels {
  min-height: 32px;
  border-radius: 3px;
  border: 1px solid #dddddd;
  min-width: 400px;
  width: 100%;
  padding-left: 5px;
  padding-right: 20px;
  position: relative;
  &.clearable {
    padding-right: 40px;
  }
  .placeholder-text {
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    color: #b8b9bb;
  }
  .tags {
    width: 100%;
    overflow: auto;
    max-height: 54px;
    min-height: 30px;
  }
  .r-icon {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    margin: 0 5px;
    cursor: pointer;
    &.clear {
      margin-right: 20px;
    }
    /deep/ .ivu-icon {
      font-size: 15px;
    }
  }
}
// 面板
.ground {
  width: 100%;
  // height: 204px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  &:after {
    content: '';
    display: block;
    clear: both;
  }
  .ground-item {
    float: left;
  }
  .ground-pos {
    width: 160px;
    border-left: 1px solid #eee;
    // 定位排列
    // position: absolute;
    // top: 0;
    // left: 0;
    // height: 204px;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
<style lang="less">
.ivu-multi-cascader {
  max-height: none !important;
}
</style>
