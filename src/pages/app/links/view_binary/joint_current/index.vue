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
          ).row.full-width.items-center.content-center.cursor-pointer.b-50
          div(:style=`{pointerEvents: 'none'}`).row.full-width.justify-center
            span(:style=`{userSelect: 'none'}`).text-white {{ joint.name || joint.vertices }}
          //- div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
            span.text-white Причина
          //- div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
            span.text-white Следствие
</template>

<script>
export default {
  name: 'jointCurrent',
  props: ['joint', 'item'],
  data () {
    return {
      jointOpened: false,
    }
  },
}
</script>
