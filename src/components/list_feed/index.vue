<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width
  //- debug top
  div(:style=`{position: 'fixed', zIndex: 999999, right: '0px', top: '30%',maxWidth: '200px',opacity: 0.8}`).row.bg-green.text-white.q-pa-xs
    .row.full-width
      small.full-width itemMiddle.name: {{itemMiddle ? itemMiddle.name : null}}
      small.full-width itemMiddle.top: {{ itemMiddle ? itemMiddle.top : 0 }}
      small.full-width scrollTop: {{scrollTop}}
      small.full-width scrollHeight: {{scrollHeight}}
      small.full-width scrollPaginationOffset: {{scrollPaginationOffset}}
    .row.full-width
      q-btn(outline color="white" dense no-caps @click="positionDrop()") Go to start
      q-btn(outline color="white" dense no-caps @click="prev()") Prev
      q-btn(outline color="white" dense no-caps @click="next()") Next
      q-btn(outline color="white" dense no-caps @click="positionDebug()") Here
      q-btn(outline color="white" dense no-caps @click="positionDebug('142363647983880232')") Cofee
  //- loading spinner state
  div(
    v-if="scrollTarget && !itemsRes"
    :style=`{
      paddingTop: ((scrollTarget.clientHeight || scrollTarget.innerHeight)/2)-25+'px',
    }`
    ).row.full-width.justify-center
    q-spinner(size="50px" color="green")
  //- wrapper
  div(
    v-if="itemsRes"
    :style=`{
      position: 'relative',
    }`
    ).row.full-width.items-start.content-start
    //- prepend slot
    slot(name="prepend")
    //- prev loading
    div(
      v-if="prevInProgress"
      :style=`{
        position: 'absolute', top: '0px', zIndex: 10000,
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner-dots(color="green" size="50px")
    //- wrapper item
    div(
      v-for="(item, itemIndex) in itemsRes.items" :key="item[itemKey]"
      :ref="`item-${item[itemKey]}`"
      :accessKey="item[itemKey]"
      :style=`{
        ...itemStyles,
      }`
      v-observe-visibility=`{
        throttle: 300,
        callback: itemMiddleHandler,
        intersection: {
          root: scrollTarget ? scrollTarget.clientHeight ? scrollTarget : null : null,
          rootMargin: rootMargin
        }
      }`
      ).row.full-width.items-start.content-start
      slot(
        name="item"
        :item="item"
        :itemIndex="itemIndex"
        :isActive="item[itemKey] === (itemMiddle ? itemMiddle.key : undefined)"
        :isVisible="true")
    //- next loading
    div(
      v-if="nextInProgress"
      :style=`{
        position: 'absolute', bottom: '0px', zIndex: 10000,
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner-dots(color="green" size="50px")
    //- append slot
    slot(name="append")
</template>

<script>
import { scroll } from 'quasar'
import { RxCollectionEnum } from 'src/system/rxdb'
const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

export default {
  name: 'listFeed',
  props: {
    rootMargin: {type: String, default () { return '-50% 0px' }},
    query: {
      type: Object,
      required: true,
    },
    itemStyles: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      itemMiddle: null, // положение активного ядра на экране(заполняется после отрисовки)
      // items
      itemsRes: null,
      // prev, next
      prevInProgress: false, // идет загрузка данных вверху списка
      nextInProgress: false, // идет загрузка данных внизу списка
      // scroll data
      scrollTop: 0, // расстояние от начала скролла до верха экрана
      scrollHeight: 0,
      scrollTarget: null,
      scrollPreserveCount: 0,
    }
  },
  computed: {
    itemKey () {
      return this.itemsRes ? this.itemsRes.itemPrimaryKey : null
    },
    scrollTargetHeight () {
      return this.scrollTarget ? (this.scrollTarget.clientHeight || this.scrollTarget.innerHeight) : this.$q.screen.height
    },
    scrollPaginationOffset () {
      // return this.scrollTargetHeight
      return this.scrollTargetHeight * 2
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.$log('query TO')
        if (this.itemsRes) this.setItemMiddleKey(null)
        this.itemsRes = await this.$rxdb.find(to, true)
        this.$emit('ready')
        this.$log('===== itemsRes created')
      }
    },
    'itemsRes.items': {
      async handler (to, from) {
        this.$log('itemsRes.items changed to = ', to ? to.map(item => item.name) : '[]')
        if (!this.itemMiddle && this.itemsRes.getProperty('currentId')){
          // иногда setItemMiddleKey не рабатывает вхолостую тк в момент вызова нет данных(массив еще не обновился). Вызываем после обновления массива
          this.$log('set itemMiddle manually!')
          this.setItemMiddleKey(this.itemsRes.getProperty('currentId'), true)
        }
        await this.scrollToItemMiddle()
      }
    },
    scrollTop: {
      // immediate: true,
      async handler (to, from) {
        if (!this.itemsRes) return
        if (this.scrollHeight - to < this.scrollPaginationOffset) await this.next()
        if (to < this.scrollPaginationOffset) await this.prev()
        if (this.itemMiddle) this.itemMiddle.top = this.itemMiddle.ref.offsetTop - this.scrollTop
      }
    },
    scrollHeight: {
      handler (to, from) {
        this.$log('scrollHeight TO', to)
      }
    },
    '$store.state.ui.listFeedNeedDrop': {
      deep: true,
      handler (to, from) {
        this.$log('$store.state.ui.listFeedNeedDrop TO', to)
        if (to) {
          this.positionDrop()
          this.$store.commit('ui/stateSet', ['listFeedNeedDrop', false])
        }
      }
    },
  },
  methods: {
    itemMiddleHandler (isVisible, entry, i) {
      if (isVisible) {
        this.setItemMiddleKey(entry.target.accessKey)
      }
    },
    setItemMiddleKey(key, ignoreOffset = false) {
      this.itemsRes.setProperty('currentId', key) // сохраняем до отрисовки(иначе не сработает positionDebug (если элемент отсутствует в старых данных))
      const updateItemMiddle = (key) => {
        if (key) {
          let objIndx = this.itemsRes.items.findIndex(item => item[this.itemsRes.itemPrimaryKey] === key)
          let objName = objIndx >= 0 ? this.itemsRes.items[objIndx].name : 'not found'
          let itemMiddleRef
          if (this.$refs[`item-${key}`] && this.$refs[`item-${key}`][0]) {
            itemMiddleRef = this.$refs[`item-${key}`][0]
            let itemMiddleRect = itemMiddleRef.getBoundingClientRect()
            this.itemMiddle = {
              key: key,
              name: objName,
              ref: itemMiddleRef,
              // dimensions
              top: ignoreOffset ? 0 : itemMiddleRect.top, // расстояние от верха экрана до отрисованного middle (может быть отрицательным)
              bottom: itemMiddleRect.bottom,
              left: itemMiddleRect.left,
              right: itemMiddleRect.right,
              width: itemMiddleRect.width,
              height: itemMiddleRect.height,
              // scroll data
              offsetTop: itemMiddleRect.offsetTop,
              scrollTop: getScrollPosition(this.scrollTarget),
              scrollHeight: getScrollHeight(this.scrollTarget),
            }
            this.$log('set ItemMiddle: ', this.itemMiddle.name)
          } else {
            this.$log(`set ItemMiddle. not found! active itemMiddle: ${this.itemMiddle ? this.itemMiddle.name : 'null'}`)
          }
        } else this.itemMiddle = null
      }
      // TODO: positionSaving
      this.$nextTick(() => updateItemMiddle(key)) // вызываем после отрисовки элементов
    },
    // подмотает скролл до itemMiddle
    async scrollToItemMiddle () {
      this.$nextTick(async () => {
        if (this.itemMiddle) {
          this.$log('try scroll to itemMiddle', this.itemMiddle.name)
          let scrollOffset = this.itemMiddle.top // сместит ядро на запомненное место
          let scrollPosition = this.itemMiddle.ref.offsetTop - scrollOffset
          // let scrollPosition = this.itemMiddle.ref.offsetTop
          setScrollPosition(this.scrollTarget, scrollPosition)
          this.$log(`scroll to ItemMiddle ${this.itemMiddle.name} done scrollDelta=${scrollOffset}  scrollPosition=${scrollPosition}`)
        } else {
          setScrollPosition(this.scrollTarget, 0)
          this.$log('scroll to ItemMiddle fail. itemMiddle not found. goto top')
        }
      })
    },
    async prev () {
      if (this.itemsRes && this.itemsRes.hasPrev && !this.prevInProgress) {
        if (this.nextInProgress) return
        this.$log('----- prev prev prev')
        this.prevInProgress = true
        await this.itemsRes.prev()
        this.prevInProgress = false
      }
    },
    async next () {
      if (this.itemsRes && this.itemsRes.hasNext && !this.nextInProgress) {
        if (this.prevInProgress) return
        this.$log('----- next next next')
        this.nextInProgress = true
        await this.itemsRes.next()
        this.nextInProgress = false
      }
    },
    async positionDebug (key) {
      this.setItemMiddleKey(null)
      this.setItemMiddleKey(key, true)
      await this.itemsRes.gotoCurrent()
    },
    async positionDrop () {
      this.setItemMiddleKey(null)
      await this.itemsRes.gotoStart()
    },
    scrollUpdate (e) {
      // this.$log('scrollUpdate')
      this.scrollTop = getScrollPosition(this.scrollTarget)
      this.scrollHeight = getScrollHeight(this.scrollTarget)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.scrollTarget = getScrollTarget(this.$el)
    this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    this.scrollUpdate()
    await this.prev()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
  }
}
</script>
