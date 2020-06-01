<style lang="sass" scroped>
.note-item
  cursor: pointer
  &:hover
    background: #777 !important
</style>

<template lang="pug">
.column.full-width
  div(
    ref="extraNotesScroll"
    @scroll="onScroll").col.full-width.scroll
    div(
      v-if="query"
      :style=`{paddingBottom: '1000px'}`).row.full-width.items-start.content-start.q-pt-sm
      //- div(:style=`{height: 500+'px'}`).row.full-width
      //- kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      //-   template(v-slot=`{items}`)
      //-     .row.full-width.items-start.content-start
      div(
        v-for="(i, ii) in query.nodeList" :key="i.oid" @click="itemClick(i, ii)"
        :class=`{
          'bg-grey-6': ii === nodeIndex,
          'bg-grey-9': ii !== nodeIndex
        }`
        :style=`{height: '40px', borderRadius: '10px'}`
        ).row.full-width.items-center.q-px-md.q-mb-sm.q-py-sm.note-item
        span.text-white {{ i.name }}
        .col
        small.text-white {{ $time(i.meta.items[0].layers[0].figuresAbsolute[0].t) }}
        small.text-white.q-mx-xs -
        small.text-white {{ $time(i.meta.items[0].layers[0].figuresAbsolute[1].t) }}
</template>

<script>
import {throttle} from 'quasar'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'extraNotes',
  props: ['meta', 'player'],
  data () {
    return {
      query: null,
      nodeIndex: null
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oid: this.sphereOid
        }
      }
      // return {
      //   oid: this.sphereOid,
      //   pagination: { pageSize: 10 },
      //   sortStrategy: 'RELATING_TO_TIME',
      //   filter: { types: 'NODE' }
      // }
    }
  },
  watch: {
    'meta.now': {
      handler (to, from) {
        // this.$log('meta.now CHAGNGED', to)
        this.nowChangedThrottle(to)
      }
    }
  },
  methods: {
    itemClick (i, ii) {
      this.$log('itemClick', i, ii)
      let to = i.meta.items[0].layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(to)
      this.$emit('meta', ['videoUpdate', to])
      this.nowChanged(to)
    },
    nowChanged (to) {
      this.$log('nowChanged', to)
      for (let i = 0; i < this.query.nodeList.length; i++) {
        let node = this.query.nodeList[i]
        let layer = node.meta.items.find(item => {
          return item.layers[0].contentOid === this.meta.content.oid &&
            item.layers[0].figuresAbsolute[0].t <= this.meta.now &&
            item.layers[0].figuresAbsolute[1].t >= this.meta.now
        })
        if (layer) {
          this.nodeIndex = i
          break
        }
      }
      this.scrollToIndex(this.nodeIndex)
    },
    scrollToIndex (index) {
      this.$log('scrollToIndex', index)
      this.$tween.to(this.$refs.extraNotesScroll, 0.5, {scrollTop: index * 48})
    },
    onScroll (e) {
      // this.$log('onScroll', e.target.scrollTop)
    }
  },
  created () {
    this.nowChangedThrottle = throttle(this.nowChanged, 2000)
  },
  async mounted () {
    this.$log('mounted')
    let { items, count, totalCount, nextPageToken } = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
        oid: this.sphereOid
      }
    })
    this.query = {nodeList: items}
    // this.query = await this.$store.dispatch('lists/contentNodes', {contentOid: this.sphereOid})
  }
}
</script>
