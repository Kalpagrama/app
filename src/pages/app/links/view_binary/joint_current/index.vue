<template lang="pug">
div(
  :style=`{
    position: 'relative',
    maxWidth: '500px',
  }`).row.full-width.q-px-md
  div(
    :style=`{
      marginTop: jointOpened ? '-80px' : '-30px',
      borderRadius: '10px',
    }`
    ).row.full-width.b-40
    node-feed(
      :node="joint"
      :showHeader="jointOpened"
      :showSpheres="jointOpened"
      :showActions="jointOpened"
      :showName="false"
      :showItems="false")
      template(v-slot:items)
        //- name
        div(
          @click="jointOpened = !jointOpened"
          :style=`{
            //- pointerEvents: 'none',
            height: '60px',
          }`
          ).row.full-width.items-center.content-center
          div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
            span.text-white Причина
          div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
            span.text-white Следствие
    //- header
    //- div(
      v-if="jointOpened"
      :style=`{height: '50px',}`).row.full-width.items-center.content-center.justify-start.q-px-sm
      span author
    //- voting...
    //- div(
      v-if="jointOpened"
      :style=`{height: '50px',}`).row.full-width.items-center.content-center.justify-center
      span voting
</template>

<script>
export default {
  name: 'jointCurrent',
  props: ['joint', 'item'],
  data () {
    return {
      jointOpened: false,
    }
  }
}
</script>
