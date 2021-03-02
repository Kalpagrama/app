<template lang="pug">
div(
  v-touch-swipe.mouse="onSwipe"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
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
          :itemActive="rowActive && jointVisibleOid === joint.oid"
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
  props: ['row', 'rowActive', 'rowItemWidth'],
  components: {
    jointItem,
  },
  data () {
    return {
      scrollWrapperRef: null,
      jointsRes: null,
      jointVisibleOid: null,
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
    oid: {
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        this.jointsRes = await this.$rxdb.find(this.query, true)
        // TODO optional ?
        this.jointsRes.gotoStart()
        this.$nextTick(() => {
          if (this.jointsRes.items.length > 0) {
            this.jointMakeVisible(this.jointsRes.items[0])
          }
        })
      }
    }
  },
  methods: {
    jointVisibilityCallback (isVisible, entry) {
      if (isVisible) {
        // this.$log('jointVisibilityCallback', isVisible)
        let [key, idx] = entry.target.accessKey.split('-')
        this.$log('key', key)
        this.$log('idx', idx)
        this.jointVisibleOid = key
        if (this.rowActive) {
          let joint = this.jointsRes.items[parseInt(idx)]
          this.$log('joint.oid', joint.oid)
          if (joint) {
            let itemOid = joint.populatedObject.items.find(i => i.oid !== this.row.oid).oid
            this.$emit('joint-visible', joint.populatedObject, itemOid)
          }
        }
      }
    },
    jointMakeVisible (joint) {
      this.$log('jointMakeVisible START', joint)
      let jointRef = this.$refs[`joint-${joint.oid}`]
      if (jointRef && jointRef[0]) {
        jointRef = jointRef[0]
        this.$log('jointMakeVisible', jointRef.offsetLeft)
        // drop visible item
        this.$wait(0).then(() => {
          this.jointVisibleOid = null
        })
        // tween to visible item
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
        this.$log('jointMakeVisible jointRef NOT FOUND!')
      }
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
