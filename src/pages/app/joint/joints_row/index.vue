<template lang="pug">
div(
  v-touch-swipe.mouse.left.right="onSwipe"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  slot
  //- joints map of indicators instagram stories...
  div(
    v-if="jointsRes && jointsRes.items.length > 0 && rowActive"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: rowItemWidth+'px',
        padding: '2px 36px',
      }`).row.full-width.justify-center
      div(
        v-for="(joint,jointIndex) in jointsRes.items" :key="joint.oid"
        v-if="!row.oidsHidden.includes(joint.oid)"
        :style=`{
          height: '2px',
        }`
        ).col.q-px-xs
        div(
          :class=`{
            'bg-green': jointVisibleOid === joint.oid,
            'b-50': jointVisibleOid !== joint.oid,
          }`
          :style=`{
            borderRadius: '1px',
          }`
          ).row.fit
  //- debug row
  div(
    v-if="jointsRes && rowActive"
    :style=`{
      position: 'absolute', zIndex: 3000, top: '0px',
      opacity: 0.1,
    }`
    ).row.bg-green.q-px-sm
    q-btn(
      @click="jointsResMove(false)"
      flat no-caps :color="jointsRes.hasPrev ? 'white' : 'red'") Prev
    q-btn(
      @click="jointsResMove(true)"
      flat no-caps :color="jointsRes.hasNext ? 'white' : 'red'") Next
    q-btn(
      @click="jointsResToStart()"
      flat no-caps) To Start
    q-btn(
      @click="jointsResStartHere()"
      flat no-caps) Start here
    .row.full-width
      small(:class=`{'text-red': jointsWrapperWidthChanging, 'text-white': !jointsWrapperWidthChanging}`) jointsWrapperWidthChanging: {{jointsWrapperWidthChanging}}
  div(
    ref="scroll-wrapper"
    :style=`{
      position: 'relative',
      overflow: 'hidden',
    }`
    ).row.full-width.scroll
    //- debug row
    //- .row.full-width.bg-green.text-white
      small.full-width row.oid {{ row.oid }}
      small.full-width row.oidsHidden: {{ row.oidsHidden }}
    div(
      v-if="scrollWrapperRef && jointsRes"
      :style=`{
      }`
      ).row.no-wrap
      q-resize-observer(@resize="onResize")
      //- margin right div
      div(
        :style=`{
          width: paddingLeftRight+'px',
        }`)
      //- center
      div(
        v-for="(joint, jointIndex) in jointsRes.items" :key="joint.oid"
        v-if="!row.oidsHidden.includes(joint.oid)"
        v-observe-visibility=`{
          throttle: 150,
          callback: jointVisibilityCallback,
          intersection: {
            root: scrollWrapperRef,
            rootMargin: '0px -50%',
          }
        }`
        :ref="`joint-${joint.oid}`"
        :accessKey="`${joint.oid}-${jointIndex}`"
        :class=`{
          //- 'bg-red': jointVisibleOid === joint.oid,
        }`
        :style=`{
          position: 'relative',
          minWidth: rowItemWidth+'px',
          maxWidth: rowItemWidth+'px',
          opacity: jointVisibleOid === joint.oid ? 1 : 0.5
        }`
        ).row.items-start.content-start.q-mx-sm
        //- debug item
        //- .row.full-width.bg-red.text-white
          small.full-width jointIndex: {{ jointIndex }}
          small.full-width joint.oid: {{ joint.oid }}
          small.full-width item.oid: {{ joint.populatedObject.items.find(i => i.oid !== row.oid).oid }}
        div(
          v-if="jointVisibleOid !== joint.oid"
          @click="jointMakeVisible(joint)"
          :style=`{
            position: 'absolute', zIndex: 1000,
            //- background: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          }`
          ).row.fit.cursor-pointer
        joint-item(
          :joint="joint.populatedObject"
          :item="joint.populatedObject.items.find(i => i.oid !== row.oid)"
          :itemIndex="joint.populatedObject.items.findIndex(i => i.oid !== row.oid)"
          :itemActive="rowActive && !rowPaused && jointVisibleOid === joint.oid"
          :style=`{
          }`)
      //- margin right div
      div(
        :style=`{
          width: paddingLeftRight+'px',
        }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import jointItem from './joint_item.vue'

export default {
  name: 'jointsRow',
  props: ['row', 'rowActive', 'rowPaused', 'rowItemWidth'],
  components: {
    jointItem,
  },
  data () {
    return {
      scrollWrapperRef: null,
      jointsRes: null,
      jointsResMoving: false,
      jointVisibleOid: null,
      jointsWrapperWidth: 0,
      jointsWrapperWidthTimeout: null,
      jointsWrapperWidthChanging: false,
      jointsWrapperHeight: 0,
      jointVisibilityCallbackCount: 0,
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.row.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
    paddingLeftRight () {
      return (this.$q.screen.width - this.rowItemWidth) / 2
    }
  },
  watch: {
    'jointsRes.items': {
      async handler (to, from) {
        this.$log('jointsRes.items TO', to.length)
        this.$nextTick(() => {
          this.$log('jointsRes.items $nextTick')
          // if (!this.itemMiddle && this.itemsRes.getProperty('currentId')) {
          //   this.itemMiddleSet(this.itemsRes.getProperty('currentId'), 0, false)
          // }
          this.jointMakeVisible({oid: this.jointVisibleOid}, false)
        })
      }
    },
    row: {
      immediate: true,
      async handler (to, from) {
        this.$log('row TO', to)
        this.jointsRes = await this.$rxdb.find(this.query, true)
        // start from some joint or from start...
        if (to.jointFrom) {
          this.jointsRes.setProperty('currentId', to.jointFrom)
          this.jointsRes.gotoCurrent()
        }
        else {
          this.jointsRes.setProperty('currentId', null)
          this.jointsRes.gotoStart()
        }
        // make visible joint [0] ?
        // this.$nextTick(() => {
        //   if (this.jointsRes.items.length > 0) {
        //     this.jointMakeVisible(this.jointsRes.items[0], false)
        //   }
        // })
      }
    },
    jointsWrapperWidth: {
      handler (to, from) {
        if (this.jointsWrapperWidthTimeout) {
          clearTimeout(this.jointsWrapperWidthTimeout)
          this.jointsWrapperWidthTimeout = null
        }
        if (!this.jointsWrapperWidthChanging) {
          this.$log('jointsWrapperWidth START')
        }
        this.jointsWrapperWidthChanging = true
        this.jointsWrapperWidthTimeout = setTimeout(() => {
          this.jointsWrapperWidthChanging = false

          // END of jointsWrapperWidthChanging
          this.$log('jointsWrapperWidth END')
          this.jointMakeVisible({oid: this.jointVisibleOid}, false)
        }, 600)
      }
    }
  },
  methods: {
    async jointVisibilityCallback (isVisible, entry) {
      // if (this.jointsWrapperWidthChanging) return
      if (isVisible) {
        this.$log('jointVisibilityCallback', isVisible)
        this.jointVisibilityCallbackCount += 1
        let [key, idx] = entry.target.accessKey.split('-')
        // this.$log('key', key)
        // this.$log('idx', idx)
        idx = parseInt(idx)
        this.jointVisibleOid = key
        // emit active joint up
        if (this.rowActive) {
          let joint = this.jointsRes.items[idx]
          // this.$log('joint.oid', joint.oid)
          if (joint) {
            let itemOid = joint.populatedObject.items.find(i => i.oid !== this.row.oid).oid
            this.$emit('joint-visible', joint.populatedObject, itemOid)
          }
        }
        // go prev/next here
        // if (this.jointVisibilityCallbackCount > 0)
        const jointsResMoveMaybe = () => {
          this.$log('*** jointsResMoveMaybe ***')
          if (idx <= 1 && this.jointsRes.hasPrev) {
            // await this.jointsRes.prev()
            this.jointsResMove(true)
          }
          if (idx >= this.jointsRes.items.length - 1 && this.jointsRes.hasNext) {
            this.jointsResMove(false)
          }
        }
        jointsResMoveMaybe()
      }
    },
    jointMakeVisible (joint, useTween = true) {
      this.$log('jointMakeVisible START', joint)
      let jointRef = this.$refs[`joint-${joint.oid}`]
      if (jointRef && jointRef[0]) {
        jointRef = jointRef[0]
        this.$log('jointMakeVisible', jointRef.offsetLeft)
        // drop visible item
        // this.$wait(0).then(() => {
        //   this.jointVisibleOid = null
        // })
        // tween to visible item
        if (useTween) {
          this.$tween.to(
            this.scrollWrapperRef,
            0.3,
            {
              scrollLeft: jointRef.offsetLeft - this.paddingLeftRight,
              onComplete: () => {
                this.$log('jointMakeVisible DONE')
              }
            }
          )
        }
        else {
          this.scrollWrapperRef.scrollLeft = jointRef.offsetLeft - this.paddingLeftRight
          this.$log('jointMakeVisible DONE')
        }
      }
      else {
        this.$log('jointMakeVisible jointRef NOT FOUND!')
      }
    },
    async jointsResMove (isNext) {
      this.$log('jointsResMove START', isNext)
      if (!this.jointsRes) return
      if (this.jointsResMoving) return
      this.jointsResMoving = true
      if (isNext) await this.jointsRes.next()
      else await this.jointsRes.prev()
      await this.$wait(500)
      this.$log('jointsResMove DONE')
      this.jointsResMoving = false
    },
    async jointsResToStart () {
      this.$log('jointsResToStart')
      await this.jointsRes.setProperty('currentId', null)
      await this.jointsRes.gotoStart()
    },
    async jointsResStartHere () {
      this.$log('jointsResStartHere')
      await this.jointsRes.setProperty('currentId', this.jointVisibleOid)
      await this.jointsRes.gotoCurrent()
    },
    onResize (e) {
      this.$log('onResize', e.width, e.height)
      this.jointsWrapperHeight = e.height
      this.jointsWrapperWidth = e.width
    },
    onSwipe (e) {
      this.$log('onSwipe', e)
      // left/right
      if (['left', 'right'].includes(e.direction)) {
        // get index of jointVisibleOid
        let idx = this.jointsRes.items.findIndex(j => j.oid === this.jointVisibleOid)
        // get index of next item
        idx = e.direction === 'right' ? idx - 1 : idx + 1
        // get joint next
        let joint = this.jointsRes.items[idx]
        if (joint) {
          this.jointMakeVisible(joint)
        }
      }
      // up/down
      if (['up', 'down'].includes(e.direction)) {
        // TODO handle
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$nextTick(() => {
      this.scrollWrapperRef = this.$refs['scroll-wrapper']
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
