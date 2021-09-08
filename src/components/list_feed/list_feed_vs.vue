<template lang="pug">
  row.full-width.items-start.content-start
    .row.full-width
      q-spinner-dots(v-if="!itemsRes" color="green" size="60px").absolute-center
      //- items
      div(
        v-if="itemsRes"
        :style=`{ position: 'relative'}`
      ).row.full-width.items-start.content-start.br
        q-scroll-area(
          :style=`{maxHeight: scrollAreaHeight+'px', height: scrollAreaHeight+'px'}`
          dark
          :thumb-style=`{
            right: '5px',
            borderRadius: '8px',
            backgroundColor: 'rgb(50,50,50)',
            width: '8px',
            opacity: 0.75}`
          :bar-style=`{
          right: '2px',
          borderRadius: '14px',
          backgroundColor: '#2222',
          width: '14px',
          opacity: 0.2,
          marginTop: '-3px',
          marginBottom: '-3px',
          paddingTop: '3px',
          paddingBottom: '3px'}`
          id="scroll-area-with-virtual-scroll-1"
        ).full-width
          q-virtual-scroll(
            scroll-target="#scroll-area-with-virtual-scroll-1 > .scroll"
            :items-fn="itemsFn"
            :items-size="length"
            :virtual-scroll-item-size="itemHeightApprox"
            virtual-scroll-slice-ratio-before="0.5"
            virtual-scroll-slice-ratio-after="0.5"
            separator)
            template(v-slot:default=`{ item, index }`)
              q-item(
                :key="index"
                dense
              )
                q-item-section
                  q-item-label
                    //#{{ index }} - {{ item.name }}
                    slot(
                      name="item"
                      :item="item"
                      :itemIndex="index"
                      :isActive="false"
                      :isVisible="false")
</template>

<script>
import { scroll } from 'quasar'
import { LstCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

export default {
  name: 'listFeedVirtualScroll',
  props: {
    scrollAreaHeight: { // если не указано - то скролл - весь window (иначе скролл занимает отведенное место)
      type: Number,
      default: this.$q.screen.height
    },
    query: {
      type: Object,
      required: true
    },
    itemHeightApprox: { // средний размер одного элемента
      type: Number,
      default: 60
    }

  },
  data () {
    return {
      itemsRes: null,
      nonReactiveItems: []
    }
  },
  computed: {
    length () {
      return this.itemsRes ? this.itemsRes.items.length : 0
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.itemsRes = await this.$rxdb.find(to, 10500, 100500)
      }
    }
  },
  methods: {
    async gotoPercent (percent) {
    },
    itemsFn (from, size) {
      assert(this.itemsRes && from < this.itemsRes.items.length && from + size <= this.itemsRes.items.length)
      let result = Object.freeze(cloneDeep((this.itemsRes.items.slice(from, from + size))))
      assert(result.length === size)
      this.$log('result=', result)
      return result
    }
  },
  mounted () {
    this.$log('mounted', this.scrollAreaHeight, this.$q.screen.height)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
