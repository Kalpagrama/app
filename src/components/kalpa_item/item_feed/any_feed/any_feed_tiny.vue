<template lang="pug">
div(
  :style=`{
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '10px',
    minHeight: height + 'px',
    maxHeight: height + 'px',
    minWidth: height + 'px',
    // background: 'linear-gradient(0deg, rgba(40,40,40,1) 0%, rgba(40,40,40,0) 100%)',
  }`)
  //image
  img(v-if="!item.type.in('WORD', 'SENTENCE', 'CHAR')"
    :src="item.thumbUrl"
    :style=`{
      height: height + 'px',
      minWidth: height + 'px',
      objectFit: 'cover',
      borderRadius: '10px'}`)
  div(v-else
    :style=`{
      height: height + 'px',
      width: height + 'px',}`).row.items-center.content-center.justify-center.b-40
    q-icon(name="blur_on" color="white" size="90px")
  div(:style=`{pointerEvents: 'none', background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)', zIndex: 10}`).fit.absolute-center
  div(:style=`{zIndex: 10}`).row.full-width.absolute-bottom.full-height
    //- NAME: dynamic link/ dynamic fontSize
    router-link(
      v-if="showName && item.oid"
      :to="objectUrl(item)"
      :style=`{
        minHeight: height + 'px',
        fontSize: fontSize+'px',
        fontWeight: fontWeight,
        textAlign: 'center',
      }`
    ).row.full-width.items-end.content-end.justify-center.no-wrap.q-px-sm
      q-icon(v-if="!item.type.in('WORD', 'SENTENCE', 'CHAR')" :name="namePrefix" color="grey-5").q-pb-sm
      span.text-grey-5.q-pl-xs.q-pb-xs.ellipsis {{ item.type.in('WORD', 'SENTENCE', 'CHAR') ? '✦' : '' }} {{ item.name }}
</template>

<script>
// import essenceItems from './node_items.vue'
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'
import { reactive } from 'vue'
import { objectUrl } from 'src/system/common/object_info'

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
export default {
  name: 'anyFeedTiny',
  components: {
  },
  methods: {
    objectUrl(item) {
      return objectUrl(item)
    }
  },
  props: {
    item: { type: Object },
    itemState: { type: Object},
    nodeBackgroundColor: { type: String, default: 'rgb(30,30,30)' },
    nodeActionsColor: { type: String, default: 'rgb(200,200,200)' },
    isActive: { type: Boolean },
    isVisible: { type: Boolean },
    showHeader: { type: Boolean, default: true },
    showName: { type: Boolean, default: true },
    showAuthorAlways: { type: Boolean, default: false },
    showActions: { type: Boolean, default: true },
    showSpheres: { type: Boolean, default: true },
    showSpheresAlways: { type: Boolean, default: false },
    showCategory: { type: Boolean, default: true },
    showItems: { type: Boolean, default: true },
    showContext: { type: Boolean },
    showBadge: {type: Boolean, default: true},
    orderHeader: { type: Number, default: -1 },
    orderName: { type: Number, default: 1 },
    orderSpheres: { type: Number, default: 2 },
    orderActions: { type: Number, default: 3 },
    itemsStyles: {
      type: Array,
      default () {
        return [{}, {}]
      }
    },
    styles: { type: Object },
    borderRadius: { type: String, default: '10px' },
    actionsColor: { type: String, default: 'grey-9' },
    height: { type: Number, required: true }
  },
  computed: {
    // pathToItem() {
    //   return `/${item.type}/${item.oid}`
    // },
    data () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, reactive({
          // key: value
        }))
      }
      return this.itemState[key]
    },
    fontSize () {
      let l = this.item.name.length
      let w = 100
      if (l < 20 && w > 300) return 22
      else if (l < 30 && w > 300) return 20
      else if (l < 40 && w > 300) return 16
      else if (l <= 20 && w < 300) return 12
      else if (l > 20 && w < 300) return 12
      else return 14
    },
    fontWeight () {
      return 800
    },
    namePrefix () {
      switch (this.item.type) {
        case 'NODE':
          return 'adjust'
        case 'JOINT':
          return 'fas fa-link'
        case 'USER':
          return 'person'
        case 'BLOCK':
          return 'dashboard_customize'
        case 'VIDEO':
        case 'BOOK':
        case 'IMAGE':
          return 'select_all'
        default:
          return 'adjust'
      }
    }
  }
}
</script>
