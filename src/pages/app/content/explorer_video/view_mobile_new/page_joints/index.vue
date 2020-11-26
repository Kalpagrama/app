<template lang="pug">
q-page(
  :style=`{
    //- height: $q.screen.height-headerHeight-30+'px',
  }`
  ).row.full-width.items-start.content-start.justify-center
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
          :joint="joint" :ii="ii" :contentKalpa="contentKalpa" :player="player"
          :isActive="jointActive === ii"
          :style=`{
            height: $q.screen.height-headerHeight-50+'px',
            minWidth: '100%',
          }`
          @prev="jointMove(0)"
          @next="jointMove(1)")
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
      this.jointsScrollOverflow = 'auto'
      let index = this.jointActive + 1
      if (forward === 0) index -= 2
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
    },
    onResize (e) {
      this.$log('onResize', e.width)
      this.width = e.width
    }
  }
}
</script>
