<template lang="pug">
div(
  v-touch-swipe.mouse.left.right="jointsNext"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  kalpa-loader(
    :immediate="true"
    :query="jointsQuery" :limit="12"
    @items="jointsUpdated"
    v-slot=`{items, next, nexting}`)
  //- row joints  helpers
  div(
    v-if="row.type === 'bottom'"
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
  //- row joints wrapper
  div(
    ref="jointsScrollArea"
    :style=`{
      paddingLeft: ($q.screen.width-$store.state.ui.pageWidth)/2+'px',
      //- overflowX: row.type === 'top' ? 'hidden' : 'scroll',
      overflow: 'hidden',
    }`
    ).row.fit
    div(
      :style=`{
        position: 'relative',
      }`
      ).row.fit.no-wrap
      div(
        v-for="(j,ji) in joints" :key="j.oid"
        :class=`{
          'items-end': row.type === 'top',
          'items-start': row.type === 'bottom',
          //- 'q-px-lg': !(isActive && jointIndex === ji)
        }`
        :style=`{
          position: 'relative',
          maxWidth: width+'px',
          minWidth: width+'px',
          paddingBottom: '34px',
          paddingTop: '34px',
        }`
        ).row.fit
        //- name
        div(
          :style=`{
            position: 'absolute', zIndex: 100, bottom: '34px',
          }`
          ).row.full-width.justify-center
          span.text-white.bg-black.q-pa-xs node name
        //- preview
        img(
          draggable="false"
          :src="j.items[row.type === 'top' ? 0 : 1].thumbUrl"
          :style=`{
            borderRadius: '10px',
            objectFit: 'contain',
            //- border: (isActive && jointIndex === ji) ? '1px solid red' : '1px solid black',
          }`
          ).fit.bg-black
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'jointsRow',
  props: ['row', 'rowIndex', 'isActive'],
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
    }
  },
  methods: {
    jointsNext (e) {
      this.$log('jointsNext', this.jointIndex)
      let index
      if (e.direction === 'left') {
        index = this.jointIndex + 1
      }
      else if (e.direction === 'right') {
        if (this.jointIndex === 0) {
          this.$log('jointsNext right RETURN', this.jointIndex)
          return
        }
        index = this.jointIndex - 1
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
          }
        }
      )
    },
    jointsUpdated (joints) {
      this.$log('jointsUpdated', joints ? joints.length : joints)
      this.joints = joints
    }
  }
}
</script>
