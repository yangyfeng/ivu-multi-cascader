<template>
  <ul class="render-list">
    <li class="li-style"
        v-for="(node, nodeIndex) in list"
        :key="getKey(node)"
        @click="handleClick(node, nodeIndex, level)"
        :class="{ 'active-li': activeList[level - 1] === node.id }"
        @mouseover="handleMouseEnter(node, nodeIndex, level)"
        @mouseout="allowEmit = true">
      <p class="li-label-style">
        <Checkbox style="margin-right: 5px"
                  @on-change="handleCheck($event, node)"
                  :indeterminate="node.indeterminate"
                  @click.native.stop
                  v-model="node.checked"
                  :disabled="node.disabled || notUseAble"></Checkbox>
        <span :title="node[labelKey]"
              style="margin-left: 5px">{{
          node[labelKey]
        }}</span>
        <Icon v-if="node.childNodes && node.childNodes.length > 0"
              class="li-label-icon"
              type="ios-arrow-forward" />
      </p>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      allowEmit: true
    }
  },
  props: {
    activeList: {
      type: Array,
      default: () => []
    },
    list: {
      type: Array,
      default: () => []
    },
    level: {
      type: [Number, String]
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    expandTrigger: {
      type: String,
      default: 'click'
    },
    notUseAble: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleMouseEnter(node, levelIndex, level) {
      if (this.expandTrigger === 'hover' && this.allowEmit) {
        this.$emit('handle-click', node, levelIndex, level)
        this.allowEmit = false
      }
    },
    handleClick(node, levelIndex, level) {
      if (this.expandTrigger === 'click') {
        this.$emit('handle-click', node, levelIndex, level)
      }
    },
    handleCheck(v, node) {
      node.checked = v
      this.$emit('handle-check', node)
    },
    getKey() {
      return (+new Date() + Math.random()).toString()
    }
  }
}
</script>
<style lang="less" scoped>
.render-list {
  padding-left: 0;
  .li-style {
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    padding: 0 10px;
    box-sizing: border-box;
    list-style: none;
    width: 160px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover,
    &.selected,
    &.active-li {
      background: #f3f3f3;
      color: #3989fa;
    }
    .li-label-style {
      width: 100%;
      box-sizing: border-box;
      position: relative;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      .li-label-icon {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(0, -50%);
      }
    }
  }
  .li-label-style {
    margin-top: 0;
    margin-bottom: 0;
    .li-label-icon {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(0, -50%);
    }
  }
}
</style>
