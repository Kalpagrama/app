<template lang="pug">
div(
  :style=`{
    position: 'relative',
    //- maxWidth: '500px',
  }`).row.full-width
  div(
    :style=`{
      position: 'absolute', zIndex: 10000,
      top: jointOpened ? '-80px' : '-30px',
      //- marginTop: jointOpened ? '-80px' : '-30px',
      borderRadius: jointOpened ? '10px' : '30px',
      overflow: 'hidden',
    }`
    ).row.full-width.b-30
    node-feed(
      :node="joint"
      :showHeader="jointOpened"
      :showSpheres="false"
      :showActions="jointOpened"
      :showName="false"
      :showItems="false"
      borderRadius="10px 10px 30px 30px")
      template(v-slot:items)
        //- name
        div(
          @click="jointOpened = !jointOpened"
          :style=`{
            //- pointerEvents: 'none',
            height: '60px',
            //- borderRadius: '10px',
            borderRadius: '30px',
          }`
          ).row.full-width.items-center.content-center.justify-center.cursor-pointer.b-50
          span(v-if="typeof name === 'string'").text-white {{ name }}
          div(v-else).row.full-width.items-center.content-center.justify-center
            div(v-for="n in name" :key="n").row.full-width.justify-center
              span.text-white {{ n }}
</template>

<script>
export default {
  name: 'jointCurrent',
  props: ['joint', 'itemPinned'],
  data () {
    return {
      jointOpened: false,
    }
  },
  computed: {
    needSwap () {
      return this.joint.items[0].oid !== this.itemPinned.oid
    },
    name () {
      if (this.joint.vertices[0] === 'ASSOCIATIVE') {
        return 'Ассоциация'
      }
      else if (this.joint.vertices[0] === 'ESSENCE') {
        return this.joint.name
      }
      else {
        let vertices = this.joint.vertices
        if (this.needSwap) vertices.reverse()
        return [this.$nodeItemType(vertices[0]).name, this.$nodeItemType(vertices[1]).name]
      }
    }
  }
}
</script>
