<template lang="pug">
div(
  v-touch-swipe.mouse.left.right="isPinned ? null : jointsNext"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  kalpa-loader(
    v-if="row.oid"
    :immediate="true"
    :query="jointsQuery" :limit="12"
    @items="jointsUpdated"
    v-slot=`{items, next, nexting}`)
  //- row joints  helpers
  div(
    v-if="!isPinned"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '0px',
      pointerEvents: 'none',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.q-pt-sm.q-pl-lg.q-pr-md
      div(
        v-for="(j,ji) in joints" :key="j.oid"
        :style=`{
          height: '2px',
        }`
        ).col.q-pr-xs
        div(
          :class=`{
            'bg-white': jointIndex === ji,
            'b-40': jointIndex !== ji,
          }`
          :style=`{
            borderRadius: '1px',
          }`
          ).row.fit
  //- item
  div(
    v-if="row.item"
    ).row.fit.justify-center
    div(
      :style=`{
        maxWidth: width+'px',
        minWidth: width+'px',
        paddingBottom: '34px',
        paddingTop: '34px',
      }`
      ).row.full-width.items-start.content-start
      item(
        :item="row.item")
  //- row joints wrapper
  div(
    v-if="row.oid"
    ref="jointsScrollArea"
    :style=`{
      overflow: 'hidden',
    }`
    ).row.fit
    div(
      :style=`{
        position: 'relative',
      }`
      ).row.full-height.no-wrap
      div(
        v-for="(j,ji) in joints" :key="j.oid"
        :class=`{
        }`
        :style=`{
          position: 'relative',
          maxWidth: width+'px',
          minWidth: width+'px',
          paddingBottom: '34px',
          paddingTop: '34px',
          marginLeft: jointMargin(ji),
          marginRight: jointMargin(ji),
        }`
        ).row.fit
        //- tint inActive
        div(
          v-if="!isPinned && !(isVisible && jointIndex === ji)"
          @click="jointsNext(ji > jointIndex ? {direction: 'left'} : {direction: 'right'})"
          :style=`{
            position: 'absolute', zIndex: 100,
            //- background: 'rgba(0,0,0,0.1)',
          }`
          ).row.fit.cursor-pointer
        item(
          v-show="isPinned ? ji === jointIndex : true"
          :item="j.items.find(i => i.oid !== row.oid)"
          :style=`{
            minWidth: width+'px',
            maxWidth: width+'px',
          }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import item from './item.vue'

export default {
  name: 'jointsRow',
  props: ['row', 'rowIndex', 'isActive', 'isPinned', 'isVisible'],
  components: {
    item,
  },
  data () {
    return {
      jointIndex: 0,
      jointsNexting: false,
      joints: [],
    }
  },
  computed: {
    jointsQuery () {
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
    width () {
      return Math.min(this.$store.state.ui.pageWidth, this.$q.screen.width)
    }
  },
  watch: {
    jointsNexting: {
      handler (to, from) {
        this.$log('jointsNexting TO', to)
        this.$emit('nexting', to)
      }
    },
    isVisible: {
      immediate: true,
      handler (to, from) {
        this.$log('isVisible TO', to)
        if (to) {
          window.addEventListener('keydown', this.onKeydown)
        }
        else {
          window.removeEventListener('keydown', this.onKeydown)
        }
      }
    }
  },
  methods: {
    jointMargin (ji) {
      if (this.$q.screen.width < this.$store.state.ui.pageWidth) return '0px'
      else {
        // if first/last item
        if (ji === 0 || ji === this.joints.length - 1) {
          return (this.$q.screen.width - this.$store.state.ui.pageWidth) / 2 + 'px'
        }
      }
    },
    onKeydown (e) {
      if (e.key === 'ArrowLeft') {
        this.jointsNext({direction: 'right'})
      }
      else if (e.key === 'ArrowRight') {
        this.jointsNext({direction: 'left'})
      }
    },
    jointsNext (e) {
      this.$log('jointsNext', this.jointIndex)
      if (this.jointsNexting) return
      if (this.isPinned) return
      let index
      if (e.direction === 'left') {
        index = this.jointIndex + 1
        if (!this.joints[index]) {
          this.$log('jointsNext left RETURN !this.joints[index]', this.jointIndex)
          return
        }
      }
      else if (e.direction === 'right') {
        if (this.jointIndex === 0) {
          this.$log('jointsNext right RETURN', this.jointIndex)
          return
        }
        index = this.jointIndex - 1
        if (!this.joints[index]) {
          this.$log('jointsNext left RETURN !this.joints[index]', this.jointIndex)
          return
        }
      }
      let scrollTo = index * this.width
      this.jointsNexting = true
      this.$tween.to(
        this.$refs.jointsScrollArea,
        0.5,
        {
          scrollLeft: scrollTo,
          onComplete: () => {
            this.$log('jointsNext done', index)
            this.jointIndex = index
            this.jointsNexting = false
            let joint = this.joints[this.jointIndex]
            this.$emit('joint', joint)
            let item = joint.items.find(i => i.oid !== this.row.oid)
            this.$emit('item', item)
          }
        }
      )
    },
    jointsUpdated (joints) {
      this.$log('jointsUpdated', joints ? joints.length : joints)
      this.$log('jointUpdated this.row', this.row)
      this.joints = joints
      if (this.joints.length > 0) {
        let joint = this.joints[0]
        this.$emit('joint', joint)
        let item = joint.items.find(i => i.oid !== this.row.oid)
        this.$emit('item', item)
      }
    }
  }
}
</script>
