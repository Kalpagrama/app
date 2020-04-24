<template lang="pug">
div(:style=`{height: '500px'}`).column.full-width
  //- header
  div(:style=`{height: '60px'}`).row.full-width.q-px-sm
    .col
      .row.fit.items-center.content-center.q-px-sm
        span.text-white.text-bold Subscriptions
    q-btn(round flat color="grey-3" icon="edit" @click="subscriptionsEdit")
  //- body
  .col.full-width.scroll
    div(
      v-for="(s,si) in 30" :key="si" @click="subscriptionClick(s,si)"
      :style=`{height: '40px'}`
      ).row.full-width.items-center.content-center.q-px-md
      span.text-white subscription {{si}}
</template>

<script>
export default {
  name: 'homeExplorer-menuRight',
  data () {
    return {
    }
  },
  methods: {
    subscriptionClick (s, si) {
      this.$log('subscriptionClick', s, si)
    },
    subscriptionsEdit () {
      this.$log('subscriptionsEdit')
    }
  }
}
</script>
