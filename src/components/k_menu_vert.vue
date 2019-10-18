<template lang="pug">
div(:style=`{background: '#312c4b !important'}`).column.fit
  div(:to="`/app/home`" :style=`{height: '80px'}` @click="pageClick('/app/home')").row.full-width.items-center.q-px-sm
    //- q-btn(round flat color="grey-6" :style=`{overflow: 'hidden'}`)
    //-   template(v-slot:default)
    //-     img(:src="`statics/logo.png`" style=`width: 40px; height: 40px`)
    q-btn(round flat color="primary")
      q-icon(name="blur_on" color="white" style=`fontSize: 42px`)
    .col.q-px-sm
      span(style=`fontWeight: 700`).text-white Кальпаграмма
  .col
    div(:to="`/app/user`" :style=`{height: '70px'}` @click="pageClick('/app/user')").row.full-width.items-center.q-px-sm
      img(@click="$router.push(`/app/user/${$store.state.auth.user.oid}`)"
        :src="$store.state.auth.user ? $store.state.auth.user.thumbUrl[0] : ''" style=`width: 40px; height: 40px; borderRadius: 50%; overflow: hidden`)
      .col.q-px-sm
        span(style=`fontWeight: 400`).text-white {{ $store.state.auth.user ? $store.state.auth.user.name : ''}}
    div(:to="`/app/workspace`" :style=`{height: '60px'}` @click="pageClick('/app/workspace')").row.full-width.items-center.q-px-sm
      q-btn(round flat color="primary")
        q-icon(name="cloud_queue" color="white" style=`fontSize: 30px`)
      .col.q-px-sm
        span(style=`fontWeight: 400`).text-white Мастерская
    div(:to="`/app/create`" @click="pageClick('/app/create')"
      :style=`{position: 'relative', height: '60px'}`).row.full-width.items-center.q-px-sm
      q-btn(round flat color="primary")
        q-icon(name="add" color="white" style=`fontSize: 34px`)
      .col.q-px-sm
        span(style=`fontWeight: 400`).text-white Создать ядро
  div(:style=`{position: 'relative', height: '70px', color: 'white'}` v-ripple @click="menuToggle()").row.full-width.items-center.justify-end.cursor-pointer
    div(:style=`{height: '70px', width: '70px'}`).row.items-center.justify-center
      q-btn(round flat icon="keyboard_arrow_left" color="white")
    .col.full-height
      .row.fit.items-center.justify-start.q-px-sm
        small.text-grey-3 0.4.0
</template>

<script>
export default {
  name: 'kMenuVert',
  props: ['mini', 'loading'],
  data () {
    return {
      pages: {
        'hot': {name: 'Whatshot', icon: 'whatshot', iconSize: '28px', path: '/app/hot'},
        'sphere': {name: 'Sphere', icon: 'explore', iconSize: '30px', path: '/app/sphere'},
        'workspace': {name: 'Workspace', icon: 'cloud_queue', iconSize: '28px', path: '/app/workspace'},
        'create': {name: 'Create node', icon: 'add', iconSize: '28px', path: '/app/create'},
        'user': {name: 'User', icon: 'user', iconSize: '28px', path: '/app/user'}
      }
    }
  },
  methods: {
    menuToggle () {
      this.$log('menuToggle')
    },
    async pageClick (path) {
      this.$log('pageClick', path)
      this.$root.$emit('toggle_menu')
      await this.$wait(200)
      this.$router.push(path)
    },
    async logout () {
      this.$log('logout')
      // await this.$apollo.query({
      //   query: gql`
      //     query logout {
      //       logout
      //     }
      //   `
      // })
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
