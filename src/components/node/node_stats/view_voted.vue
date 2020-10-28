<template lang="pug">
.row.full-width.items-start.content-start.q-pa-sm
  .row.full-width.items-center.content-center.q-pa-sm
    span.text-white.text-bold Проголосовали
    .col
    q-btn(round flat dense color="grey-6" icon="clear" @click="$emit('close')")
  div(
    v-for="(v,vi) in stats.votes" :key="v.oid+vi"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm.b-50
      q-btn(
        :to="'/user/'+v.oid"
        flat color="white" dense no-caps
        )
        user-avatar(:url="v.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ v.name }}
      small.text-grey-8.q-mt-xs.q-mx-xs {{ $date(v.createdAt, 'DD.MM.YYYY') }}
      .col
      small(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ v.rate * 10 }}
      //- q-icon(name="adjust" color="grey-8").q-mx-sm
</template>

<script>
export default {
  name: 'viewVoted',
  props: ['node', 'stats'],
  data () {
    return {
    }
  }
}
</script>
