<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.maxWidthPage+'px',
      paddingTop: options.paddingTop+'px',
      paddingBottom: options.paddingBottom+'px'
    }`
    ).row.full-width.items-start.content-start.justify-start
    div(
      v-for="(i,ii) in items" :key="i.oid" :accessKey="ii"
      v-if="!itemsBan.includes(i.oid)"
      :ref="`item-${i.oid}`"
      :style=`{
        position: 'relative'
      }`
      v-observe-visibility=`{
        callback: indexMiddleHandler,
        // throttle: 200,
        intersection: {
          // rootMargin: -($q.screen.height/2-50)+'px 0px'
          // rootMargin: -($q.screen.height/2-1)+'px 0px'
          rootMargin: '-50% 0px'
        }
      }`
      ).row.full-width
      //-.q-mb-xl
      //- img(:src="i.meta.items[0].thumbUrl" :style=`{}`).full-width
      //- slot for the first element...
      //- inactive tint
      div(
        v-if="indexMiddle !== ii" @click="itemInactiveClick(i,ii)"
        :style=`{position: 'absolute', zIndex: 1500, borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden', opacity: 0.25}`).row.fit.b-30
      slot(
        name="item"
        :item="i"
        :index="ii"
        :indexMiddle="indexMiddle")
</template>

<script>
  import debounce from 'lodash/debounce'
  import { RxCollectionEnum } from 'src/system/rxdb'
export default {
  name: 'listMiddle',
  props: {
    active: {type: Boolean},
    visible: {type: Boolean},
    items: {type: Array, default () { return [] }},
    itemsBan: {type: Array, default () { return [] }},
    scrollWrapper: {type: Object},
    height: {type: Number},
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
      scrollTop: 0,
      paddingTop: 0,
      paddingBottom: 0
    }
  },
  computed: {
    scrollArea () {
      if (this.scrollWrapper) {
        return this.scrollWrapper
      }
      else {
        return document.documentElement
      }
    },
    clientHeight () {
      // return this.$q.screen.height
      return this.$el.clientHeight
    }
  },
  watch: {
    indexMiddle: {
      handler (to, from) {
        this.$log('indexMiddle CHANGED', to)
        this.$emit('indexMiddle', to)
        // прогружаем вверх и вниз от indexMiddle на упреждение
        if (to >= 0){
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
    async itemInactiveClick (i, ii) {
      this.$log('itemInactiveClick', i, ii)
      // let ref = this.$refs[`item-${i.oid}`][0]
      // // this.$log('ref', ref)
      // let offsetTop = ref.offsetTop
      // // this.$log('offsetTop', offsetTop)
      // let clientHeight = ref.clientHeight
      // // this.$log('clientHeight', clientHeight)
      // let scrollTop = offsetTop - ((this.clientHeight - clientHeight) / 2)
      // // this.$log('scrollTop', scrollTop)
      // // this.$log('this.scrollArea.scrollTop', this.scrollArea.scrollTop)
      // // this.indexMiddle = ii
      // this.$tween.to(this.scrollArea, 0.5, {scrollTop: scrollTop})
    }
  },
  async mounted () {
    this.$log('mounted')
    this.paddingTop = this.options.paddingTop
    // this.paddingTop = this.$q.screen.height / 2
    this.paddingBottom = this.$q.screen.height / 3
    this.debouncedSetIndexMiddle = debounce((index) => {
      this.indexMiddle = index
    }, 500)
    // if (this.items && this.items.length > 0) {
    //   await this.$wait(500)
    //   this.itemInactiveClick(this.items[0], 0)
    // }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
