<template lang="pug">
.column.full-width
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pt-sm
      div(
        v-for="(i,ii) in 100" :key="ii" @click="userClick(i,ii)"
        :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-px-md.bg-grey-8.q-mb-sm
        span.text-white user{{ii}}
</template>

<script>
export default {
  name: 'extraUsers',
  data () {
    return {
    }
  },
  methods: {
    userClick (i, ii) {
      this.$log('userClick', i, ii)
    }
  }
}
</script>
