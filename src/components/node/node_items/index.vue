<template lang="pug">
.row.full-width.q-px-sm.q-pt-sm.q-pb-lg
  div(
    v-for="(i,ii) in node.items" :key="i"
    ).col-6
    div(
      :style=`{
        position: 'relative', paddingBottom: 'calc(100% + 0px)',
        //- perspectiveOrigin: ii === 0 ? 'right' : 'left',
        perspective: '1000px',
      }`).row.full-width
      div(
        :class=`{
          //- 'q-px-xs': ii === 0,
          //- 'q-px-xs': ii === 1,
        }`
        :style=`{
          position: 'absolute', zIndex: 1, top: '0px',
          //- perspectiveOrigin: ii === 0 ? 'right' : 'left',
          //- perspective: '240px',
          transform: ii === 0 ? 'rotateY(10deg)' : 'rotateY(-10deg)',
        }`).row.fit
        composition(
          v-if="i.__typename === 'Composition'"
          :composition="i"
          :isActive="isActive"
          :isVisible="isVisible"
          :nodeOid="null"
          :isSquare="true")
        composition(
          v-else-if="i.type === 'NODE'"
          :composition="i.items[0]"
          :isActive="isActive"
          :isVisible="isVisible"
          :nodeOid="i.items[0].oid"
          :isSquare="true")
        img(
          v-else
          :src="iUrl(i)"
          :style=`{
            objectFit: 'cover',
            borderRadius: '10px',
            //- transform: 'rotateY(2deg)',
          }`
          ).fit
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'nodeItems',
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    iUrl (item) {
      return ContentApi.urlSelect(item)
    }
  }
}
</script>
