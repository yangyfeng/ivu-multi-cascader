**Select Attributes**

| 参数                | 说明                                                        | 类型    | 可选值        | 默认值   |
| ------------------- | ----------------------------------------------------------- | ------- | ------------- | -------- |
| data                | 用于渲染页面的数据(格式与element的级联选择器的数据格式一致) | array   | -             | 无       |
| value               | 默认已选择数据项                                            | array   | -             | 无       |
| expand-trigger      | 次级菜单的展开方式                                          | string  | click / hover | click    |
| separator           | 选项分隔符                                                  | string  | -             | 横杆’-’  |
| value-key           | 指定选项的值为选项对象的某个属性值                          | string  | -             | value    |
| label-key           | 指定选项标签为选项对象的某个属性值                          | string  | -             | label    |
| children-key        | 指定选项的子选项为选项对象的某个属性值                      | string  | -             | children |
| clearable           | 是否支持清空选项                                            | boolean | -             | false    |
| placeholder         | 占位符                                                      | string  | -             | 请选择   |
| popper-class        | 下拉框的类名                                                | string  | -             | ''       |
| onlyShowChecked     | 是否只显示选中的                                            | boolean | -             | false    |
| isShowIndeterminate | 是否显示半选                                                | boolean | -             | true     |
| selectChildren      | 是否允许父子联动                                            | boolean | -             | true     |
| maxCount            | 最大选择数                                                  | number  | -             | 无       |
| transfer            | 是否放在body下面展示list （在body下面要自己写样式）         | boolean | -             | false    |

**Select Events**

| 事件名称       | 说明                               | 回调参数                      |
| -------------- | ---------------------------------- | ----------------------------- |
| change         | 选中值发生变化时触发               | 目前的选中值                  |
| visible-change | 下拉框出现/隐藏时触发              | 出现则为 true，隐藏则为 false |
| remove-tag     | 移除tag时触发                      | 移除的tag值                   |
| clear          | 可清空模式下用户点击清空按钮时触发 | -                             |

