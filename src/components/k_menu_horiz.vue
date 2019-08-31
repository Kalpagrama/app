<template lang="pug">
div(:style=`{height: '60px'}`).row.full-width.items-center.justify-between.bg-white.q-px-md
  q-btn(round flat color="grey-9" icon="home" @click="menuClick('/app/home')")
  q-btn(round flat color="grey-9" icon="whatshot" @click="menuClick('/app/hot')")
  q-btn(round flat color="grey-9" icon="add" @click="menuClick('/app/create/node')")
  q-btn(round flat color="grey-9" icon="bookmark_outline" @click="menuClick('/app/workspace')")
  div(:style=`{height: '36px', width: '36px', borderRadius: '50%', overflow: 'hidden'}`).row.items-center.justify-center.cursor-pointer
    img(v-if="$store.state.auth.user" @click="$router.push(`/app/user/${$store.state.auth.user.oid}`)" :src="$store.state.auth.user.thumbUrl[0]" width="36px" height="36px")
</template>

<script>
export default {
  name: 'kMenuHoriz',
  data () {
    return {
    }
  },
  methods: {
    menuClick (path) {
      this.$log('menuClick')
      this.$router.push(path)
    }
  }
}
</script>
