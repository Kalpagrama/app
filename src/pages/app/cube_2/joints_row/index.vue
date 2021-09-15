<template lang="pug">
div(
  ).row.full-width
  .row.full-width.justify-center.bg
    div(
      :style=`{
        maxWidth: itemWidth+'px',
        height: '70px',
      }`
      ).row.full-width
      slot(name="header")
  div(
    ref="scroll-wrapper"
    :style=`{
      overflow: 'hidden',
    }`).row.full-width.scroll
    div(
      v-if="jointsRes"
      ).row.full-width.no-wrap
      //- left
      div(:style=`{minWidth: paddingLeftRight+'px',maxWidth: paddingLeftRight+'px'}`)
      //- middle
      div(
        v-for="(j,ji) in jointsRes.items" :key="j.oid"
        v-observe-visibility=`{
          throttle: 150,
          callback: jointsBecameActive,
          intersection: {
            //- root: scrollWrapperRef,
            rootMargin: '0px -50%',
          }
        }`
        :ref="`joint-${j.oid}`"
        :accessKey="`${j.oid}-${ji}`"
        :style=`{
          position: 'relative',
          minWidth: itemWidth+'px',
          maxWidth: itemWidth+'px',
          opacity: (isActive && (jointActiveOid === j.oid || jointActiveOidIn === j.oid)) ? 1 : 0.5
        }`
        ).q-mr-sm
        //- tint
        div(
          v-if="jointActiveOid !== j.oid && jointActiveOidIn !== j.oid"
          @click="jointMakeActive(j)"
          :style=`{
            position: 'absolute', zIndex: 3000,
            opacity: 0.5,
          }`
          ).row.fit.cursor-pointer.bg-red
        //- item
        .row.full-width
          joint-item(
            :item="j.populatedObject.items.find(i => i.oid !== oid)"
            :isActive="isActive && (jointActiveOid === j.oid || jointActiveOidIn === j.oid)")
          slot(v-if="jointActiveOid === j.oid" name="item")
      //- center
      div(:style=`{minWidth: paddingLeftRight+'px',maxWidth: paddingLeftRight+'px'}`)
  .row.full-width.justify-center.bg
    slot(name="footer")
    //- div(
      :style=`{
        maxWidth: itemWidth+'px',
        height: '70px',
      }`
      ).row.full-width.br
    //- slot(v-if="jointActiveOid === j.oid" name="footer" :itemRootOid="itemRootOid")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import jointItem from '../joint_item/index.vue'

export default {
  name: 'jointsRow',
  props: ['oid', 'itemWidth', 'isActive'],
  components: {
    jointItem
  },
  data () {
    return {
      jointsRes: null,
      jointActiveOidIn: null,
      jointActiveOidOut: null,
      jointActiveOid: null,
      itemRootOid: null,
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
    paddingLeftRight () {
      return (this.$q.screen.width - this.itemWidth) / 2
    }
  },
  watch: {
    oid: {
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        if (to) {
          this.jointsRes = await this.$rxdb.find(this.query)
          this.$nextTick(() => {
            if (this.jointsRes.items[0]) {
              this.jointMakeActive(this.jointsRes.items[0], true)
            }
          })
        }
      }
    },
    isActive: {
      immediate: true,
      handler (to, from) {
        this.$log('isActive', to)
      }
    },
  },
  methods: {
    jointsBecameActive (isVisible, entry) {
      if (isVisible) {
        this.$log('jointsBecameActive', entry.target.accessKey)
        let [oid, idx] = entry.target.accessKey.split('-')
        idx = parseInt(idx)
        this.jointActiveOid = oid
        let joint = this.jointsRes.items[idx]
        this.itemRootOid = joint.populatedObject.items.find(i => i.oid !== this.oid).oid
        // this.$emit('height', entry.target.clientHeight)
      }
    },
    jointMakeActive (joint, useTween = true, useDirection = null) {
      if (useDirection) {
        let idx = this.jointsRes.items.findIndex(j => j.oid === this.jointActiveOid)
        if (useDirection === 'left') idx -= 1
        if (useDirection === 'right') idx += 1
        joint = this.jointsRes.items[idx]
      }
      this.$log('jointMakeActive', joint)
      if (!joint) {
        this.$log('jointMakeActive NO JOINT !')
        return
      }
      let jointRef = this.$refs[`joint-${joint.oid}`][0]
      if (!jointRef) {
        this.$log('jointMakeActive NO JOINT_REF !')
        return
      }
      let scrollLeft = jointRef.offsetLeft - this.paddingLeftRight
      let scrollWrapperRef = this.$refs['scroll-wrapper']
      if (useTween) {
        this.jointActiveOidIn = joint.oid
        this.$gsap.to(
          scrollWrapperRef,
          0.3,
          {
            scrollLeft: scrollLeft,
            onComplete: () => {
              this.$log('jointMakeActive DONE')
              this.jointActiveOidIn = null
              // this.$emit('joint-change-end')
            }
          }
        )
      }
      else {
        this.jointActiveOidIn = joint.oid
        scrollWrapperRef.scrollLeft = scrollLeft
        this.jointActiveOidIn = null
      }
      // emit some event ???
      if (this.isActive) {
        this.$emit('joint-active', this, joint.populatedObject, joint.populatedObject.items.find(i => i.oid !== this.oid))
      }
    }
  },
}
</script>
