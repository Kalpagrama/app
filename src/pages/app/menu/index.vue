<template lang="pug">
q-layout(container :style=`{width: width+'px', height: height+'px'}`).bg-grey-2
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width
      q-item(clickble v-ripple :to="`/app/home`" :style=`{height: '60px'}` @click="pageClick('/app/home')").row.q-px-sm
        q-item-section(avatar)
          q-btn(round flat color="primary")
            q-icon(name="img:statics/logo.svg" color="white" style=`fontSize: 42px`)
        q-item-section
            span.text-bold.text-white Кальпаграмма
      .col
      div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="settings" @click="pageClick('/app/settings')" color="white")
  q-page-container
    k-menu-mobile
  q-footer(reveal).lt-sm
    k-menu-horiz(page="menu" :colors="['white', 'grey-7']")
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
    this.$root.$emit('toggle_menu')
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
.q-footer
  background: none !important
</style>
