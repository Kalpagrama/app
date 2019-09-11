<template lang="pug">
.column.fit
  div(:to="`/app/home`" :style=`{height: '80px'}` @click="pageClick('/app/home')").row.full-width.items-center.q-px-sm
    //- q-btn(round flat color="grey-6" :style=`{overflow: 'hidden'}`)
    //-   template(v-slot:default)
    //-     img(:src="`statics/logo.png`" style=`width: 40px; height: 40px`)
    q-btn(round flat color="primary")
      q-icon(name="blur_on" color="white" style=`fontSize: 42px`)
    .col.q-px-sm
      span(style=`fontWeight: 700`).text-white Кальпаграмма
  .col
    div(:to="`/app/user`" :style=`{height: '60px'}` @click="pageClick('/app/user')").row.full-width.items-center.q-px-sm
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
      //- borderRadius: '30px 0px 0px 30px' bg-grey-4
      //- div(:style=`{position: 'absolute', width: '60px', height: '60px', right: '0px', top: '-60px'}`).row.bg-grey-4
      //- div(:style=`{position: 'absolute', width: '60px', height: '60px', right: '0px', top: '-60px', borderRadius: '0 0 30px 0'}`).row.bg-primary
      //- div(:style=`{position: 'absolute', width: '60px', height: '60px', right: '0px', bottom: '-60px'}`).row.bg-grey-4
      //- div(:style=`{position: 'absolute', width: '60px', height: '60px', right: '0px', bottom: '-60px', borderRadius: '0 30px 0 0'}`).row.bg-primary
  div(:style=`{height: '40px'}`).row.full-width.justify-center.items-center
    small.text-grey-3 0.3.0
//- div(:style=`{
//-   position: 'fixed', top: '16px', zIndex: 2000, width: '66px',
//-   height: $q.screen.gt.sm ? 'calc(100vh - 32px)' : 'calc(100vh - 32px - 60px)',
//-   borderRadius: '0 20px 20px 0'}`).column.bg-white
//-   //- header
//-   div(:style=`{height: '60px'}`).row.full-width.items-center.justify-center
//-     router-link(:to="`/app/home`")
//-       q-btn(round flat color="grey-6" :style=`{overflow: 'hidden', borderRadius: '50%', width: '40px', height: '40px'}`)
//-         template(v-slot:default)
//-           img(:src="`statics/logo.png`" width="40px" height="40px")
//-   .col
//-     //- wrapper
//-     .row.full-width.items-start.q-pt-lg
//-       //- pages
//-       div(
//-         v-for="(p, pkey) in pages" :key="pkey"
//-         :style=`{height: '60px'}`
//-         ).row.full-width.items-center.justify-center
//-         div(:style=`{position: 'relative', height: '50px', borderRadius: '25px 0 0 25px'}`
//-           :class=`{'bg-grey-3': $route.name === pkey}`).col.q-ml-sm
//-           div(v-show="$route.name === pkey" :style=`{position: 'absolute', right: '0px', top: '-25px', width: '25px', height: '25px', borderRadius: '25px 0 0 0'}`).row.bg-grey-3
//-             div(:style=`{borderRadius: '25px 0px 25px 0px'}`).row.fit.bg-white
//-           div(v-show="$route.name === pkey" :style=`{position: 'absolute', right: '0px', bottom: '-25px', width: '25px', height: '25px', borderRadius: '0 0 0 25px'}`).row.bg-grey-3
//-             div(:style=`{borderRadius: '0px 25px 0px 25px'}`).row.fit.bg-white
//-           div(:style=`{}`).row.fit.items-center.content-center.q-pl-xs
//-             router-link(:to="p.path")
//-               img(v-if="!loading && p.path === '/app/user'" @click="$router.push(`/app/user/${$store.state.auth.user.oid}`)"
//-                 :src="$store.state.auth.user.thumbUrl[0]" style=`width: 40px; height: 40px; borderRadius: 50%; overflow: hidden`).q-mt-xs
//-               q-btn(v-else round flat :color="$route.name === pkey ? 'primary' : 'grey-6'" size="md")
//-                 q-icon(:name="p.icon" :size="p.iconSize")
//-   //- version
//-   //- footer
//-   div(:style=`{height: '60px'}`).row.full-width.items-center.justify-center
//-     //- logout
//-     router-link(to="/login" :style=`{height: '60px'}`).row.full-width.items-center.justify-center
//-       q-btn(round flat :color="'grey-6'" size="md" icon="power_off" @click="logout()")
//-     div(:style=`{height: '40px', width: '40px', borderRadius: '50%', overflow: 'hidden'}`).row.items-center.justify-center.cursor-pointer
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
    async pageClick (path) {
      this.$log('pageClick', path)
      this.$root.$emit('toggle_menu')
      await this.$wait(200)
      this.$router.push(path)
    },
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
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
