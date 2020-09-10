<template lang="pug">
.row.full-width
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden'
    }`
    ).row.full-width
    //- event reason and subject
    .row.full-width.q-py-xs.q-px-sm
      //- .col
      small.text-grey-6.q-mr-sm {{ item.type }}
      small.text-grey-6.q-mr-sm subject: {{ item.subject.name }}
      small.text-grey-6.q-mr-sm why: {{ item.matter.reason }}
      //- small.text-grey-6 to: {{ item.object.name }}
    //- event object : node wrapper
    div(:style=`{borderRadius: '10px',overflow: 'hidden'}`).row.full-width.b-40
      node-lite(
        v-if="item.object.type === 'NODE'"
        :node="item.object" :isActive="isActive" :isVisible="isVisible"
        :marginBottom="0")
      div(
        v-if="item.object.type === 'WORD'"
        ).row.full-width.items-center.content-center.q-pa-md
        q-icon(name="blur_on" color="white" size="30px").q-mr-sm
        span.text-bold.text-white {{ item.object.name }}
  //- div(v-for="(p, pkey) in i" :key="pkey").full-width.q-mb-sm
    span.text-white.q-mr-sm {{ pkey }}:
    small.text-white {{ p }}
</template>

<script>
export default {
  name: 'feedItem',
  props: ['item', 'isActive', 'isVisible'],
  data () {
    return {
    }
  }
}
</script>
