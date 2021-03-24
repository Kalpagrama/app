<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minHeight: '70px',
    textAlign: 'center',
  }`
  ).row.full-width.items-center.content-center.justify-center
  q-btn(
    @click="verticesSwap()"
    round flat
    icon="multiple_stop"
    color="green"
    :style=`{
      borderRadius: '50%',
      overflow: 'hidden',
      opacity: ['ESSENCE', 'ASSOCIATIVE'].includes(joint.vertices[0]) ? 0 : 1,
    }`).q-ml-sm.rotate-90
  div(:style=`{position: 'relative',}`).col
    //- vertices pairs selector
    div(
      v-if="verticesPairsShow"
      :style=`{
        position: 'absolute', zIndex: 10000,
        transform: 'translate3d(0,0,1000px)',
        left: '8px', maxWidth: 'calc(100% - 16px)',
        borderRadius: '30px',
      }`
      ).row.full-width.items-start.cotent-start.q-pa-sm.b-60
      q-btn(
        v-for="(pair,pairIndex) in verticesPairs" :key="pairIndex"
        @click="verticesPairClick(pair)"
        flat dense color="white" no-caps
        :style=`{
          height: '40px',
          borderRadius: '20px',
        }`
        ).row.full-width {{ pair.name }}
    //- essence input
    q-input(
      v-if="joint.vertices[0] === 'ESSENCE'"
      v-model="joint.name"
      borderless dark
      type="textarea" autorgrow
      :placeholder="'В чем связь ?'"
      :rows="1"
      :input-style=`{
        textAlign: 'center',
        //- fontWeight: 'bold',
        paddingTop: '18px',
        paddingBottom: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        minHeight: '60px',
      }`
      :style=`{
        zIndex: 300,
      }`
      ).fit.items-center.content-center
    //- render value of vertices
    span(v-else-if="joint.vertices[0] === 'ASSOCIATIVE'").text-white.text-bold {{$t('Association')}}
    div(v-else).row.full-width
      .row.full-width.justify-center
        span.text-white.text-bold {{ $nodeItemType(joint.vertices[0]).name }}
      .row.full-width.justify-center
        span.text-white.text-bold {{ $nodeItemType(joint.vertices[1]).name }}
  q-btn(
    @click="verticesPairsShow = !verticesPairsShow"
    round flat color="white"
    :icon="verticesPairsShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
    :style=`{
      borderRadius: '50%',
      //- opacity: joint.vertices[0] === 'ESSENCE' ? 0 : 1,
    }`).q-mr-sm
</template>

<script>
export default {
  name: 'vertexEditor',
  props: ['joint'],
  data () {
    return {
      verticesPairsShow: false,
    }
  },
  computed: {
    verticesPairs () {
      return this.$nodeItemTypesPairs
    }
  },
  methods: {
    verticesPairClick (pair) {
      this.$log('vertexPairClick', pair)
      this.joint.vertices = pair.id
      this.verticesPairsShow = false
    },
    verticesSwap () {
      this.$log('vertexesSwap')
      this.joint.vertices.reverse()
    },
  },
}
</script>
