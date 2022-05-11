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
  }`).b-0
  //image
  img(
    :src="item.thumbUrl"
    :style=`{
    height: height + 'px',
    minWidth: height + 'px',
    // opacity: 0.2,
    objectFit: 'cover',
    borderRadius: '10px'}`)
  div(:style=`{pointerEvents: 'none', background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)', zIndex: 10}`).fit.absolute-center
  div(:style=`{zIndex: 10}`).row.full-width.absolute-bottom.full-height
    //- NAME: dynamic link/ dynamic fontSize
    router-link(
      :to="`/${item.type}/${item.oid}`"
      :style=`{
      minHeight: height + 'px',
      textAlign: 'center',
      fontWeight: fontWeight,
    }`
    ).row.full-width.items-center.content-end.justify-center
      span.text-grey-5.q-px-sm.q-pb-xs.ellipsis {{ item.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
import { reactive } from 'vue'

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
export default {
  name: 'contentFeed',
  props: ['item', 'itemState', 'isActive', 'isVisible', 'height'],
  components: {
  },
  computed: {
    actions () {
      return {}
    },
    data () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, reactive({
          itemActive: 0
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
    }
  }
}
</script>
