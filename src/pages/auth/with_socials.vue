<style lang="sass" scoped>
.s-item
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
div(
  :style=`{height: '56px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)'}`
  ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
  div(v-if="!userIdentified").row.full-width.justify-between.q-py-md
    q-btn(
      v-for="(s,si) in socials" :key="s.id" @click="serviceClick(s,si)"
      flat round color="white" :icon="s.icon"
      :style=`{width: '40px', height: '40px'}`).s-item
</template>

<script>
export default {
  name: 'pageAuth-withSocials',
  data () {
    return {
      socials: [
        {id: 'yandex', name: 'Yandex', icon: 'fab fa-yandex'},
        {id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook-f'},
        {id: 'AUTH_VK', name: 'Vkontakte', icon: 'fab fa-vk'},
        {id: 'google', name: 'Google', icon: 'fab fa-twitter'},
        {id: 'twitter', name: 'Twitter', icon: 'fab fa-google'},
        {id: 'github', name: 'Github', icon: 'fab fa-github'}
      ]
    }
  },
  methods: {
    serviceClick (s, si) {
      this.$log('serviceClick', s, si)
      let {url} = this.$store.state.auth[s.id]
      this.$log('url', url)
      let location = window.location
      this.$log('location', location)
      let to = `${url}&state={"origin":"${location}"}`
      this.$log('to', to)
      window.location = to
    }
  }
}
</script>
