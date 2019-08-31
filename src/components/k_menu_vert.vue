<template lang="pug">
.column.fit.bg-white
  router-link(:to="`/app/home`" :style=`{height: '60px'}`).row.full-width.items-center.justify-center
    q-btn(round flat color="grey-6" :style=`{overflow: 'hidden', borderRadius: '50%', width: '40px', height: '40px'}`)
      template(v-slot:default)
        img(:src="`statics/logo.png`" width="40px" height="40px")
  .col
    router-link(:to="`/app/hot`" :style=`{height: '60px'}`).row.full-width.items-center.justify-center
      q-btn(round flat :color="$route.path === '/app/hot' ? 'primary' : 'grey-6'" size="md" icon="whatshot")
    router-link(:to="`/app/workspace`" :style=`{height: '60px'}`).row.full-width.items-center.justify-center
      q-btn(round flat :color="$route.path === '/app/workspace' ? 'primary' : 'grey-6'" size="md" icon="bookmark_outline")
    router-link(:to="`/app/create/node`" :style=`{height: '60px'}`).row.full-width.items-center.justify-center
      q-btn(round flat :color="$route.path === '/app/create/node' ? 'primary' : 'grey-6'" size="md" icon="add")
    router-link(to="/login" :style=`{height: '60px'}`).row.full-width.items-center.justify-center
      q-btn(round flat :color="'grey-6'" size="md" icon="power_off" @click="logout()")
  div(:style=`{height: '40px'}`).row.full-width.justify-center.items-center
    small.text-grey-6 0.1.1
  div(:style=`{height: '60px'}`).row.full-width.items-center.justify-center
    div(:style=`{height: '40px', width: '40px', borderRadius: '50%', overflow: 'hidden'}`).row.items-center.justify-center.cursor-pointer
      img(v-if="$store.state.auth.user" @click="$router.push(`/app/user/${$store.state.auth.user.oid}`)" :src="$store.state.auth.user.thumbUrl[0]" width="40px" height="40px")
</template>

<script>
export default {
  name: 'kMenuVert',
  props: ['mini'],
  data () {
    return {
      menus: [
        {id: '/app/home'},
        {id: '/app/workspace'},
        {id: '/app/create/node'},
        {id: '/app/account'}
      ]
    }
  },
  watch: {
    // '$route': {
    // }
  },
  methods: {
    async logout () {
      this.$log('logout')
      await this.$apollo.query({
        query: gql`
          query logout {
            logout
          }
        `
      })
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
