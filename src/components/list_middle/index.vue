<template lang="pug">
div(
  ref="listMiddleRoot"
  :style=`{position: 'relative'}`
  ).column.fit.items-start.content-start.justify-center
  //- div(:style=`{position: 'fixed', zIndex: 9999, top: '50%', pointerEvents: 'none',left: 0, right: 0}`).row.full-width.bg
  div(@scroll="onScroll").col.full-width.scroll
    .row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.maxWidthPage+'px',
          //- paddingTop: options.paddingTop+'px',
          //- paddingBottom: options.paddingBottom+'px'
        }`
        ).row.full-width.items-start.content-start.justify-center
        slot(name="itemFirst")
        div(
          v-for="(i,ii) in items" :key="i.oid" :accessKey="ii"
          v-if="!itemsBan.includes(i.oid)"
          :ref="`item-${i.oid}`"
          :style=`{
            position: 'relative',
          }`
          v-observe-visibility=`{
            callback: indexMiddleHandler,
            intersection: {
              root: $refs.listMiddleRoot,
              rootMargin: '-50% 0px'
            }
          }`
          ).row.full-width.q-mb-xl
          slot(
            name="item"
            :item="i"
            :index="ii"
            :indexMiddle="indexMiddle")
        slot(name="itemLast")
</template>

<script>
import debounce from 'lodash/debounce'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'listMiddle',
  props: {
    root: {type: Object},
    active: {type: Boolean},
    visible: {type: Boolean},
    items: {type: Array, default () { return [] }},
    itemsBan: {type: Array, default () { return [] }},
    scrollWrapper: {type: Object},
    height: {type: Number},
    more: {
      type: Function,
      default () {
        return () => {}
      }
    },
    options: {
      type: Object,
      default () {
        return {
          paddingTop: 0,
          paddingBottom: 0
        }
      }
    }
  },
  data () {
    return {
      indexMiddle: -1, // меняется по дебаунсу
      indexMiddleInstant: -1, // меняется мгновенно
      paddingTop: 0,
      paddingBottom: 0,
      scrollTop: 0,
      scrollHeight: 0,
    }
  },
  computed: {
  },
  watch: {
    scrollTop: {
      handler (to, from) {
        if (this.scrollHeight === 0) return
        if (this.scrollHeight - to < this.$el.clientHeight * 2) {
          this.more()
        }
      }
    },
    indexMiddle: {
      handler (to, from) {
        this.$log('indexMiddle CHANGED', to)
        this.$emit('indexMiddle', to)
        // прогружаем вверх и вниз от indexMiddle на упреждение
        if (to >= 0) {
          let firstIndx = Math.max(0, to - 2)
          let lastIndx = Math.min(this.items.length, to + 2)
          for (let i = firstIndx; i <= lastIndx; i++){
            let item = this.items[i]
            if (item){
              this.$rxdb.get(RxCollectionEnum.OBJ, this.items[i].oid, {priority: 1}).catch(err => this.$log('ошибка упреждающей прогрузки списка', err))
            }
          }
        }
      }
    },
  },
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e)
      this.scrollTop = e.target.scrollTop
      this.scrollHeight = e.target.scrollHeight
    },
    indexMiddleHandler (isVisible, entry, i) {
      let f = this.indexMiddleHandler
      let index
      if (i >= 0) index = i
      else index = parseInt(entry.target.accessKey)
      // this.$log(f, 'start. index=', index)
      if (isVisible) {
        // this.$log(f, 'indexMiddle (VISIBLE) ', index)
        this.indexMiddleInstant = index
        this.debouncedSetIndexMiddle(index)
      }
      else {
        if (index === this.indexMiddleInstant) {
          // this.$log(f, 'indexMiddle == -1', index)
          this.indexMiddleInstant = -1
          this.debouncedSetIndexMiddle(-1)
        } else {
          // this.$log(f, 'indexMiddle = skip', index)
        }
      }
    },
  },
  async mounted () {
    this.$log('mounted')
    this.debouncedSetIndexMiddle = debounce((index) => {
      this.indexMiddle = index
    }, 500)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
