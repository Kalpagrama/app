<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  q-input(
    v-if="!verticesFixed"
    v-model="node.name"
    borderless
    placeholder="В чем суть?" dark
    autogrow
    :input-style=`{
      fontSize: '20px',
      fontWeight: 'bold',
      textAlign: 'center'
    }`
    :style=`{
      zIndex: 10,
      maxWidth: '600px',
    }`).full-width
  //- verticesFixed
  div(
    v-if="node.items[1]"
    :style=`{
    }`
    ).row.full-width.justify-center
    div(
      v-if="verticesFixed"
      :style=`{
        height: '56px',
        order: 1,
      }`
      ).row.items-center.content-center
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-mx-xs -
    div(
      v-if="verticesFixed"
      v-for="(t,ti) in 2" :key="ti"
      :style=`{
        order: ti*2,
        height: '56px',
      }`).col
      div(
        :class=`{
          'justify-end': ti === 0,
        }`
        :style=`{
          position: 'relative',
        }`
        ).row.fit.items-center.content-center
        q-btn(
          flat color="white" no-caps
          :style=`{
            fontSize: '20px',
          }`
          ).text-bold {{ $nodeItemType(node.vertices[ti]).name }}
        q-popup-proxy(
          fit cover
          position="bottom")
          div(
            :style=`{
              maxWidth: '329px',
              borderRadius: '10px',
            }`
            ).row.full-width.b-40
            //- .row.full-width.q-pa-sm
              span.text-white.text-bold
            q-btn(
              v-for="(type,typei) in $nodeItemTypes" :key="type.id"
              v-close-popup
              @click="itemTypeClick(type,typei,ti)"
              flat color="white" no-caps
              :style=`{}`
              ).full-width {{ type.name }}
  .row.full-width.justify-center
    //- toggle name/fixed_name
    q-btn(
      v-if="node.items.length === 2"
      @click="toggle()"
      round flat
      :color="verticesFixed ? 'green' : 'grey-8'"
      icon="multiple_stop"
      :style=`{
        //- order: 1
      }`)
</template>

<script>
export default {
  name: 'nodeEditor_nameEditor',
  props: ['node'],
  data () {
    return {
      verticesFree: ['ASSOCIATIVE', 'ESSENCE']
    }
  },
  computed: {
    verticesFixed () {
      if (this.node.vertices[0]) {
        return !this.verticesFree.includes(this.node.vertices[0])
      }
      else {
        return false
      }
    }
  },
  methods: {
    itemTypeClick (type, typei, index) {
      this.$log('itemTypeClick', type, typei)
      if (index === 0) this.node.vertices = [type.id, type.pair]
      else this.node.vertices = [type.pair, type.id]
    },
    toggle () {
      this.$log('toggle')
      if (!this.verticesFixed) {
        this.node.vertices = ['PROBLEM', 'SOLUTION']
        this.node.name = ''
      }
      else {
        this.node.vertices = ['ASSOCIATIVE', 'ASSOCIATIVE']
      }
    }
  }
}
</script>
