<template lang="pug">
.row.full-width.items-start.content-start.justify-center.q-pt-md
  div(
    @click="onClick(i)"
    v-for="(i,ii) in 100" :key="ii"
    :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.b-50.q-mb-sm
    div(:style=`{height: '100px', width: '130px',borderRadius: '10px', overflow: 'hidden'}`).row.b-60
    .col
      .row.fit.q-pa-md
        span.text-white Related content {{ ii }}
</template>

<script>
export default {
  name: 'wsExplorerVideo__pageRelated',
  data () {
    return {
    }
  },
  methods: {
    onClick (content) {
      this.$log('onClick', content)
    }
  }
}
</script>
