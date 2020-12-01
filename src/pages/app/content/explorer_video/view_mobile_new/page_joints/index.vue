<template lang="pug">
q-page(
  v-touch-swipe.mouse.left.right="onSwipe"
  :style=`{
    position: 'relative',
    //- height: $q.screen.height-headerHeight-30+'px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  //- stories bar
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, top: '4px',
      paddingLeft: '22px', paddingRight: '22px',
    }`
    ).row.full-width
    div(
      v-for="(joint,ii) in joints" :key="ii"
      v-if="joint.items.length === 2"
      :style=`{
        //- minWidth: jointActive === ii ? '50px' : 'none',
      }`
      ).col.q-px-xs
      div(
        :class=`{
          'b-30': jointActive !== ii,
          'b-120': jointActive === ii,
        }`
        :style=`{
          height: '4px',
          borderRadius: '2px',
        }`
        ).row.full-width
  q-resize-observer(@resize="onResize")
  kalpa-loader(
    :immediate="true"
    :query="jointsQuery" @items="jointsLoaded" v-slot=`{items,next,nexting}`)
    div(
      ref="jointsScroll"
      :style=`{
        overflow: jointsScrollOverflow,
      }`
      ).row.full-width.scroll
      div().row.no-wrap
        joint-item(
          v-for="(joint,ii) in items" :key="joint.oid"
          v-if="joint.items.length === 2"
          :joint="joint" :ii="ii" :contentKalpa="contentKalpa" :player="player"
          :isActive="jointActive === ii"
          :style=`{
            height: $q.screen.height-headerHeight-50+'px',
            minWidth: '100%',
          }`
          )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import jointItem from './joint_item.vue'

export default {
  name: 'pageJoints',
  props: ['contentKalpa', 'node', 'headerHeight', 'player'],
  components: {
    jointItem,
  },
  data () {
    return {
      width: 0,
      jointActive: 0,
      jointMoving: false,
      jointsScrollOverflow: 'hidden',
      nodeOpened: false,
      joints: []
    }
  },
  computed: {
    jointsQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
    jointMove (forward) {
      if (this.jointMoving) return
      this.jointMoving = true
      this.$log('jointMove', forward)
      // get index
      let index = this.jointActive + 1
      if (forward === 0) index -= 2
      // check -1, last joint index...
      if (!this.joints[index]) {
        this.$q.notify({type: 'negative', position: 'top', message: '-1,last!'})
        this.jointMoving = false
        return
      }
      // start scrolling
      this.jointsScrollOverflow = 'auto'
      this.$tween.to(
        this.$refs.jointsScroll,
        0.3,
        {
          scrollLeft: index * this.width,
          onComplete: () => {
            this.$log('jointMove_onComplete')
            this.jointsScrollOverflow = 'hidden'
            this.jointActive = index
            this.jointMoving = false
          }
        }
      )
    },
    jointsLoaded (joints) {
      this.$log('jointsLoaded', joints)
      this.joints = joints
    },
    onSwipe (e) {
      this.$log('onSwipe', e)
      if (e.direction === 'left') this.jointMove(1)
      else this.jointMove(0)
    },
    onResize (e) {
      this.$log('onResize', e.width)
      this.width = e.width
    }
  }
}
</script>
