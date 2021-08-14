<template lang="pug">
div(
  v-if="itemRoot"
  v-touch-swipe.mouse="onSwipe"
  :style=`{
    position: 'relative',
    height: $q.screen.height+'px',
  }`
  ).column.full-width.items-start.content-start
  //- footer
  div(
    :style=`{
      position: 'fixed', zIndex: 5000,
      bottom: '0px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: 500+'px',
        //- height: '70px',
        borderRadius: '10px 10px 0 0',
      }`
      ).row.full-width.justify-between.q-pa-sm.b-50
      q-btn(
        @click="$routerKalpa.back()"
        flat color="white" no-caps icon="west"
        :style=`{
          height: '60px',
          width: '60px',
        }`)
        span {{$t('Back')}}
      q-btn(
        flat color="white" no-caps stack
        :style=`{
          height: '60px',
          //- width: '60px'
        }`)
        q-btn(
          color="green" icon="add" no-caps
          :style=`{
            width: '30px',
            height: '30px',
            minHeight: '30px',
            minWidth: '30px',
            borderRadius: '50%',
          }`)
        span(:style=`{whiteSpace: 'nowrap'}`) {{$t('Add joint')}}
      kalpa-menu-popup-global(
        :style=`{
          height: '60px',
          width: '60px',
        }`)
  div(ref="scroll-wrapper").col.full-width.scroll
    //- itemRoot
    .row.full-width.justify-center.q-px-sm
      div(:style=`{maxWidth: 500+'px'}`).row.full-width.items-start.content-start.br
        .row.full-width
          small.text-white rows: {{ rows }}
        q-resize-observer(@resize="$event => itemWidth = $event.width")
        div(
          :style=`{
            height: '70px',
          }`
          ).row.full-width.items-end.content-end
          node-feed(
            v-if="jointActive"
            :node="jointActive"
            :showItems="false"
            :showActions="false"
            :showName="false"
            :isActive="true")
        joint-item(
          :item="itemRoot"
          :isActive="rowActiveKey === `${itemRoot.oid}-0`")
    //- joints row
    div(
      v-if="scrollWrapperRef && itemWidth > 0"
      :style=`{
        paddingBottom: $q.screen.height+'px',
      }`).row.full-width
      joints-row(
        v-for="(r,ri) in rows"
        v-observe-visibility=`{
          throttle: 150,
          callback: rowBecameActive,
          intersection: {
            root: scrollWrapperRef,
            rootMargin: '-50% 0px',
          }
        }`
        :oid="r.oid"
        :key="`${r.oid}-${ri}`"
        :accessKey="`${r.oid}-${ri}`"
        :ref="`${r.oid}-${ri}`"
        :isActive="`${r.oid}-${ri}` === rowActiveKey"
        :itemWidth="itemWidth"
        @joint-active="jointsRowJointActiveHandle"
        @height="$event => r.height = $event"
        :style=`{
          marginTop: r.top+'px',
          //- background: r.oid+'-'+ri === rowActiveKey ? 'red' : 'none',
        }`)
        template(v-slot:header)
          node-feed(
            v-if="`${r.oid}-${ri}` === rowActiveKey && jointActive"
            :node="jointActive"
            :nodeBackgroundColor="'rgb(30,30,30)'"
            :nodeActionsColor="'rgb(255,255,255)'"
            :isActive="false"
            :showItems="false"
            :showHeader="false"
            :showActions="false")
        template(v-slot:item)
          essence-actions(
            v-if="`${r.oid}-${ri}` === rowActiveKey && jointActive"
            :essence="jointActive"
            :nodeBackgroundColor="'rgb(30,30,30)'"
            :nodeActionsColor="'rgb(255,255,255)'"
            :isActive="false")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import itemFinder from './item_finder/index.vue'
import jointCreator from './joint_creator/index.vue'
import jointItem from './joint_item/index.vue'
import jointsRow from './joints_row/index.vue'
import essenceActions from 'src/components/essence/essence_actions.vue'

export default {
  name: 'pageAppGraph2',
  components: {
    itemFinder,
    jointCreator,
    jointItem,
    jointsRow,
    essenceActions
  },
  data () {
    return {
      scrollWrapperRef: null,
      itemRoot: null,
      itemWidth: 0,
      rowActiveKey: null,
      jointActive: null,
      rows: []
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid', to)
        if (to) {
          this.itemRoot = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          this.$nextTick(() => {
            this.scrollWrapperRef = this.$refs['scroll-wrapper']
            this.$set(this, 'rows', [{oid: this.itemRoot.oid, top: 0, height: 0}])
          })
        }
      }
    }
  },
  methods: {
    jointsRowJointActiveHandle (row, joint, item) {
      this.$log('jointsRowJointActiveHandle', row, joint.name, item.name)
      this.jointActive = joint
      let rowInput = {
        oid: item.oid,
        top: -100,
        height: 0,
      }
      if (this.rows.length > 1) this.rows.splice(this.rows.length - 1, 1, rowInput)
      else this.rows.splice(this.rows.length, 0, rowInput)
    },
    getActiveRow () {
      this.$log('getActiveRow')
      let rowRef = this.$refs[`row-${this.rowActiveKey}`][0]
      return rowRef
    },
    rowBecameActive (isVisible, entry) {
      if (isVisible) {
        this.$log('rowBecameActive', entry.target.accessKey)
        let [oid, idx] = entry.target.accessKey.split('-')
        idx = parseInt(idx)
        this.rowActiveKey = entry.target.accessKey
      }
    },
    rowMakeActive (row, useTween = true, useDirection = null) {
      // this.$log('rowMakeActive', row)
      if (useDirection) {
        if (useDirection === 'next') {
          row = this.$refs[this.rowActiveKey][0]
        }
        if (useDirection === 'prev') {
          // need to select prev row...
        }
      }
      if (!row) {
        this.$log('rowMakeActive NO ROW!')
        return
      }
      this.$log('rowBecameActive', row.$el)
      let scrollTop = row.$el.offsetTop
      // let scrollWrapperRef = this.$refs['scroll-wrapper']
      this.$log('scrollTop', scrollTop)
      if (useTween) {
        this.$tween.to(
          this.scrollWrapperRef,
          0.3,
          {
            scrollTop: scrollTop,
            onComplete: () => {
              this.$log('rowBecameActive DONE')
            }
          }
        )
      }
      else {
        this.scrollWrapperRef.scrollTop = scrollTop
      }
    },
    onKeydown (e) {
      this.$log('onKeydown', e)
      // up and down
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        if (e.key === 'ArrowDown') this.rowMakeActive(null, true, 'next')
        if (e.key === 'ArrowUp') this.rowMakeActive(null, true, 'prev')
      }
      // left and right
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        // this.jointMakeActive(null, true, e.key === 'ArrowRight' ? 'right' : 'left')
      }
      if (e.code === 'Space') {
        e.preventDefault()
        // this.rowsNext()
      }
    },
    onSwipe (e) {
      this.$log('onSwipe', e)
      if (e.direction === 'left') {
        // e.preventDefault()
        // this.jointMakeActive(null, true, 'right')
      }
      if (e.direction === 'right') {
        // this.jointMakeActive(null, true, 'left')
      }
      if (e.direction === 'up') {
        this.rowMakeActive(null, true, 'next')
        // go next
        // let rowRef = this.$refs[`row-${this.rowActiveKey}`][0]
        // let scrollWrapperRef = this.$refs['scroll-wrapper']
        // scrollWrapperRef.scrollTop = rowRef.offsetTop
        // window.scrollTo(0, 100)
      }
      if (e.direction === 'down') {
        this.rowMakeActive(null, true, 'prev')
      }
    }
  },
  created () {
    this.$log('created')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  mounted () {
    this.$log('mounted')
    window.addEventListener('keydown', this.onKeydown)
    // this.$nextTick(() => {
    //   this.scrollWrapperRef = this.$refs['scroll-wrapper']
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
    window.removeEventListener('keydown', this.onKeydown)
  }
}
</script>
