<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.fit.bg-grey-10
  //- tint
  div(
    v-if="true"
    :style=`{
      position: 'fixed', zIndex: 200, background: 'rgba(0,0,0,'+tintOpacity+')',
      pointerEvents: 'none'
    }`
    ).row.fit
  //- body items
  div(
    ref="scrollWrapper"
    @scroll="onScroll"
    :class=`{}`
    :style=`{
      overflow: scrollOverflow
    }`
    ).col.full-width.scroll
    .row.full-width.justify-center
      masonry(
        :cols="{default: 7, 1800: 6, 1500: 5, 1200: 4, 900: 3, 600: 2}"
        :gutter="{default: 10, 1200: 10, 900: 10, 600: 10}"
        :style=`{position: 'relative', marginTop: '70px', marginBottom: '500px'}`).q-px-sm
        div(
          v-for="(i, ii) in items" :key="i.oid"
          @mouseenter="itemEnter(i, ii)"
          @mouseleave="itemLeave(i, ii)"
          :class=`{
          }`
          :style=`{
            position: 'relative'
          }`
          ).row.full-width.items-start.content-start.q-mb-sm
          //- div(:style=`{position: 'absolute', top: '8px', left: '8px', zIndex: 100}`).row.bg-red
          //-   small Lorem ipsum !!!
          //- copy
          img(
            @click="itemClick(null, null)"
            :ref="`item-img-${i.oid}`"
            draggable="false"
            :src="i.thumbUrl"
            :style=`{opacity: 0.1, width: '100%', borderRadius: '10px', overflow: 'hidden'}`)
          //- slot
          div(
            :ref="`item-${i.oid}`"
            :class=`{
              'shadow-20': i.oid === itemOid
            }`
            :style="itemStyles(i.oid)"
            ).row.fit
            slot(name="item" :item="i" :index="ii" :isHovered="i.oid === itemOidHovered")
</template>

<script>
export default {
  name: 'listMasonry',
  props: ['items'],
  data () {
    return {
      itemsMeta: [],
      itemOid: null,
      itemOidHovered: null,
      itemIndex: null,
      itemMinWidth: 0,
      itemMaxWidth: 750,
      itemOffsetTop: 0,
      itemsTintOpacity: 0,
      scrollTop: 0,
      scrollItem: 0,
      scrollDelta: 0,
      scrollOverflow: 'auto'
    }
  },
  computed: {
    tintOpacity () {
      let item = this.itemsMeta[this.itemsMeta.length - 1]
      if (item) {
        let to = 1 - (Math.abs(this.scrollDelta) / (this.itemMaxWidth - this.itemMinWidth))
        if (to > 0.7) to = 0.7
        return to
      }
      else {
        return 0.1
      }
    }
  },
  watch: {
    itemsMeta: {
      handler (to, from) {
        // if (to.length > 0) {
        //   this.$tween.to(this, 0.6, {itemsTintOpacity: 0.6})
        // }
        // if (to.length === 0) {
        //   this.$tween.to(this, 0.2, {itemsTintOpacity: 0})
        // }
      }
    }
  },
  methods: {
    itemEnter (i, ii) {
      // this.$log('itemEnter')
      this.itemOidHovered = i.oid
    },
    itemLeave () {
      // this.$log('itemLeave')
      this.itemOidHovered = null
    },
    itemStyles (oid) {
      let m = this.itemsMeta.find(x => x.oid === oid)
      if (m) {
        let maxWidth = 750
        let minWidth = m.widthOriginal
        let width = m.width - Math.abs(this.scrollDelta)
        if (width < minWidth) width = minWidth
        if (width > maxWidth) width = maxWidth
        let maxHeight = 500
        let minHeight = m.heightOriginal
        let height = m.height - Math.abs(this.scrollDelta)
        if (height < minHeight) height = minHeight
        if (height > maxHeight) height = maxHeight
        return {
          zIndex: m.zIndex,
          position: m.position,
          left: m.left + 'px',
          top: m.top + 'px',
          maxWidth: width + 'px',
          maxHeight: height + 'px',
          borderRadius: '10px',
          oveflow: 'hidden'
        }
      }
      else {
        return {
          zIndex: 100,
          position: 'absolute'
        }
      }
    },
    itemClick (i, ii) {
      this.$log('itemClick', i, ii)
      this.scrollDelta = 0
      // close first item
      let itemFrom = this.itemsMeta[0]
      if (itemFrom) {
        let {height, width, left, top} = this.$refs[`item-img-${itemFrom.oid}`][0].getBoundingClientRect()
        this.$log('itemFrom rect', top, itemFrom.top, itemFrom.topOriginal)
        this.$tween.to(
          this.itemsMeta[0],
          0.4,
          {
            height: itemFrom.heightOriginal,
            width: itemFrom.widthOriginal,
            left: left,
            top: top,
            onComplete: () => {
              this.itemsMeta.shift()
              if (!i) {
                this.itemsMeta = []
              }
            }
          }
        )
      }
      if (!i) return
      // open next item
      this.itemOid = i.oid
      this.itemIndex = ii
      let itemRef = this.$refs[`item-${i.oid}`][0]
      let {height, width, left, top} = itemRef.getBoundingClientRect()
      this.itemOffsetTop = itemRef.offsetHeight
      this.$log('itemOffsetTop', this.itemOffsetTop)
      this.itemMaxWidth = 750
      this.itemMinWidth = width
      // this.$log('itemTo rect', height, width, left, top)
      this.itemsMeta.push({
        oid: i.oid,
        index: ii,
        zIndex: 2000,
        position: 'fixed',
        height: height,
        heightOriginal: height,
        width: width,
        widthOriginal: width,
        left: left,
        leftOriginal: left,
        top: top,
        topOriginal: top,
      })
      this.$tween.to(
        this.itemsMeta[this.itemsMeta.length - 1],
        0.6,
        {
          height: this.$q.screen.width > 500 ? 500 : this.$q.screen.width - 16,
          width: this.$q.screen.width > 750 ? 750 : this.$q.screen.width - 16 - 60,
          left: this.$q.screen.width > 750 ? (this.$q.screen.width - 750) / 2 : 8,
          top: 70,
          onComplete: () => {
          }
        }
      )
    },
    itemOpen (i, ii) {
      this.$log('itemOpen', i, ii)
      // if (i) this.itemOid = i.oid
      // else this.itemOid = null
      // this.scrollDelta = 0
      // this.scrollItem = this.scrollTop
      // close last item
      let itemRefFrom = this.itemsRefs[0]
      if (itemRefFrom) {
        let {height, width, left, top} = this.$refs[`item-img-${itemRefFrom.getAttribute('oid')}`][0].getBoundingClientRect()
        this.$log('top/from-top', top, itemRefFrom.getAttribute('from-top'))
        this.$tween.to(
          itemRefFrom,
          0.6,
          {
            zIndex: 10,
            maxHeight: height,
            maxWidth: width,
            left: left,
            top: top,
            onComplete: () => {
              this.itemsRefs.shift()
              itemRefFrom.style.position = 'absolute'
              itemRefFrom.style.left = 0
              itemRefFrom.style.top = 0
              if (i === null) {
                this.itemsMeta = []
              }
            }
        })
      }
      // if no item return
      if (!i) return
      let itemRef = this.$refs[`item-${i.oid}`][0]
      // this.$log('itemRef', itemRef.getAttribute('oid'))
      let {height, width, left, top} = itemRef.getBoundingClientRect()
      itemRef.style.position = 'fixed'
      itemRef.style['z-index'] = 1000 + this.itemsRefs.length
      itemRef.style.maxHeight = height + 'px'
      itemRef.style.maxWidth = width + 'px'
      itemRef.style.left = left + 'px'
      itemRef.style.top = top + 'px'
      itemRef.setAttribute('from-height', height)
      itemRef.setAttribute('from-width', width)
      itemRef.setAttribute('from-left', left)
      itemRef.setAttribute('from-top', top)
      this.itemIndex = ii
      this.itemsRefs.push(itemRef)
      this.$tween.to(
        itemRef,
        0.5,
        {
          top: 70,
          left: this.$q.screen.width > 750 ? (this.$q.screen.width - 750) / 2 : 8,
          maxWidth: 750,
          maxHeight: 500
        }
      )
    },
    async onScroll (e) {
      // this.$log('onScroll')
      this.scrollDelta += e.target.scrollTop - this.scrollTop
      // this.$log('scrollDelta', this.scrollDelta)
      this.scrollTop = e.target.scrollTop
      // this.$log('scrollTop', this.scrollTop)
      this.scrollBottom = e.target.scrollHeight - (e.target.scrollTop + e.target.clientHeight)
      // this.$log('scrollBottom', this.scrollBottom)
      if (this.scrollBottom < e.target.clientHeight / 2) {
        this.$emit('more')
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    window.onkeydown = (e) => {
      if (e.keyCode === 32) {
        e.preventDefault()
        let i = this.itemIndex + 1
        if (!this.items[i]) i = 0
        this.itemClick(this.items[i], i)
        // this.$tween.to(this.$refs.scrollWrapper, 0.5, {scrollTop: this.itemOffsetTop + 300})
      }
      else if (e.key === 'Escape') {
        this.itemClick(null, null)
      }
    }
    this.$wait(0).then(() => {
      this.itemClick(this.items[5], 5)
    })
  }
}
</script>
