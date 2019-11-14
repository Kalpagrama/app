<template lang="pug">
q-layout(:container="true" :style=`{width: width+'px', height: height+'px'}`).bg-grey-2
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.items-center
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        k-logo(:width="40" :height="40")
      .col.full-height
        .row.fit.items-center.q-px-sm
          span.text-bold.text-white Kalpagramma
      div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="settings" @click="pageClick('/app/settings')" color="white")
  q-page-container
    //- k-menu-mobile
  q-footer(reveal).lt-sm
    k-menu-mobile(page="menu" :colors="['white', 'grey-7']")
</template>

<script>
export default {
  name: 'pageApp__menu',
  props: ['width', 'height'],
  data () {
    return {
    }
  },
  methods: {
   async pageClick (path) {
      this.$log('pageClick', path)
      await this.$wait(200)
      this.$router.push(path)
    }
  },
  mounted () {
   this.$log('mounted')
  },
  beforeDestroy () {
   this.$log('beforeDestroy')
  }
 }
</script>

<style lang="stylus">
.q-footer {
  background: none !important
}
</style>
