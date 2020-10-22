<template lang="pug">
.row.full-width.justify-start
  q-resize-observer(@resize="e => width = e.width")
  div(
    :style=`{
      position: 'relative',
      maxWidth: maxWidth+'px',
    }`
    ).row.full-width
    div(
      :style=`{
        position: 'absolute', zIndex: 1000, top: '-60px', right: 0,
        width: '60px', height: '60px',
      }`
      ).row.justify-center
      div(:style=`{width: '2px',}`).row.full-height.bg-green
  kalpa-loader(
    :immediate="true"
    :query="queryBySphere" :limit="15" v-slot=`{items, next}`
    @reset="$refs.qis.reset(), $refs.qis.resume(), $refs.qis.poll()")
    list-middle(:items="items" :itemStyles=`{marginBottom: '0px',}`)
      q-infinite-scroll(@load="next" :offset="250")
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        .row.full-width
          item(
            :joint="item" :oid="oid"
            :isActive="isActive" :isVisible="isVisible"
            :style=`{
              maxWidth: maxWidth+'px',
              paddingBottom: '60px',
            }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import item from './sphere_joints_item.vue'

export default {
  name: 'sphereJoints',
  components: {item},
  props: ['oid'],
  data () {
    return {
      width: 0,
    }
  },
  computed: {
    maxWidth () {
      if (this.$q.screen.width > 700) return 700 + ((this.width - 700) / 2)
      else return this.$q.screen.width
    },
    queryBySphere () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_JOINTS,
          oidSphere: this.oid,
          jointItemType: {$in: ['NODE', 'WORD']}
        },
        populateObjects: true,
      }
    }
  }
}
</script>
