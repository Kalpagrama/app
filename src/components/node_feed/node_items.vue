<template lang="pug">
div(:style=`{position: 'relative', padding: '11px'}`).row.full-width.items-end.content-end
  //- link btn: to go to /joint mode
  q-btn(
    flat color="green" icon="fas fa-link" size="lg"
    :to="`/graph/${node.items[0].oid}?oid=${node.oid}`"
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: 'calc(50% - 30px)',
      top: 'calc(50% - 30px)',
      width: '60px', height: '60px',
      //- pointerEvents: 'none'
    }`)
  //- tint for opened item
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="itemOpened !== null"
      :style=`{
        position: 'fixed', zIndex: 10000, top: 0, left: 0, right: 0, bottom: 0,
        transform: 'translate3d(0,0,100px)',
        //- background: 'black',
        //- background: 'rgba(0,0,0,0.95)',
        background: 'rgba(30,30,30,'+itemBackgroundOpacity+')',
      }`
      ).row.fit
  //- items left/right
  div(
    v-for="(item, ii) in node.items" :key="ii"
    :class=`{
      'q-pr-xs': ii === 0,
      'q-pl-xs': ii === 1,
    }`
    :style=`{
      position: 'relative',
    }`
    ).col-6
    div(
      :style=`{
        position: 'relative',
        paddingBottom: '100%',
        //- transform: itemOpened === ii ? 'none' : ii === 0 ? 'perspective(1000px) rotateY(8deg) translate3d(0,0,-10px)' : 'perspective(1000px) rotateY(-8deg) translate3d(0,0,-10px)',
        //- zIndex: 10,
      }`
      ).row.full-width
      div(
        ref="refMini"
        @click.self="itemClick(ii)"
        :style=`
          itemOpened === ii ?
          {
            position: 'fixed', zIndex: 300000,
            top: itemTop+'px',
            left: itemLeft+'px',
            maxWidth: itemWidth+'px',
            maxHeight: itemHeight+'px',
            transform: 'translate3d(0,0,300px)',
          }
          :
          {
            position: 'absolute', zIndex: 100,
          }`
        ).row.fit.items-center.content-center.justify-center
        item(
          :oid="node.oid"
          :item="item"
          :itemIndex="ii"
          :itemActive="isActive && itemActive === ii"
          :itemStyles="itemsStyles[ii]"
          :itemOpened="itemOpened === ii"
          :itemOpenedHandle="true"
          :stylesName=`{}`
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
            //- height: '100%',
          }`
          :styles=`{
            objectFit: itemOpened === ii ? 'contain' : 'cover',
            height: itemOpened === ii ? 'auto' : '100%',
          }`
          @open="itemClick(ii)")
        //- itemOpened footer: close? only?
        div(
          v-if="itemOpened === ii"
          @click="itemClick(ii)"
          ).row.full-width.items-center.content-center.justify-center.q-py-lg
          q-btn(
            outline color="grey-8" no-caps
            :style=`{
              height: '50px',
            }`).q-px-md
            span Свернуть
    //- tint to make item active...
    div(
      v-if="itemActive !== ii"
      @click="itemClick(ii)"
      :style=`{
        position: 'absolute', zIndex: 110, top: 0,
      }`
      ).row.fit.cursor-pointer
</template>

<script>
import item from './node_items_item.vue'

export default {
  name: 'nodeFeed__nodeItems',
  props: ['node', 'isActive', 'isVisible', 'itemsStyles'],
  components: {
    item,
  },
  data () {
    return {
      itemActive: 0,
      itemOpened: null,
      itemTop: 0,
      itemTopMini: 0,
      itemLeft: 0,
      itemLeftMini: 0,
      itemWidth: 0,
      itemWidthMini: 0,
      itemHeight: 0,
      itemHeightMini: 0,
      itemBackgroundOpacity: 0,
    }
  },
  watch: {
    itemActive: {
      immediate: true,
      handler (to, from) {
        if (to >= 0) {
          this.$emit('itemActive', to)
        }
      }
    }
  },
  methods: {
    async itemClick (index) {
      this.$log('itemClick', index)
      // open item if it is active
      if (this.itemActive === index) {
        // close item if it is opened
        if (this.itemOpened === index) {
          this.$tween.to(this, 0.4, {
            itemTop: this.itemTopMini,
            itemLeft: this.itemLeftMini,
            itemWidth: this.itemWidthMini,
            itemHeight: this.itemHeightMini,
            itemBackgroundOpacity: 0,
            onComplete: () => {
              this.$log('itemOpen done')
              // this.itemOpened = null
            }
          })
          await this.$wait(200)
          this.itemOpened = null
        }
        // open item if it is closed/only active...
        else {
          this.itemOpened = index
          // set position
          let {top, left, width, height} = this.$refs.refMini[index].getBoundingClientRect()
          this.$log({top, left, width, height})
          this.itemTop = top
          this.itemTopMini = top
          this.itemLeft = left
          this.itemLeftMini = left
          this.itemWidth = width
          this.itemWidthMini = width
          this.itemHeight = height
          this.itemHeightMini = height
          // get item ratio...
          let item = this.node.items[index]
          // shift
          this.$tween.to(this, 0.4, {
            itemTop: 0,
            itemLeft: 0,
            itemWidth: this.$q.screen.width,
            itemHeight: this.$q.screen.height,
            itemBackgroundOpacity: 0.95,
            onComplete: () => {
              this.$log('itemOpen done')
              // this.itemOpened = index
            }
          })
        }
      }
      // make item active
      else {
        this.itemActive = index
        // if item is muted ???
      }
    }
  }
}
</script>
