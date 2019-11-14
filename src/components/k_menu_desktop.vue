<template lang="pug">
div(:style=`{width: width+'px'}`).column.full-height.bg-secondary
  //- kalpagramma
  div(:style=`{height: '60px'}`).row.full-width
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      k-logo(:width="40" :height="40")
    div(v-if="!mini").col.full-height
      .row.fit.items-center.q-px-sm
        span.text-bold.text-white Kalpagramma
  //- user
  div(:style=`{height: '60px'}`).row.full-width
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      img(:src="$store.state.auth.user.thumbUrl" :style=`{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden'}`)
    div(v-if="!mini").col.full-height
      .row.fit.items-center.q-px-sm
        span.text-bold.text-white {{ $store.state.auth.user.name }}
  div(:style=`{height: '60px'}`).row.full-width.items-center
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round icon="add" color="green")
    div(v-if="!mini").col.full-height
      .row.fit.items-center.q-px-sm
        span.text-white Create node
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(v-for="(p, pi) in pages" :key="pi" @click="pageClick(p, pi)"
        :style=`{height: '60px'}`
        ).row.full-width
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round flat :icon="p.icon" color="white")
        div(v-if="!mini").col.full-height
          .row.fit.items-center.q-px-sm
            span.text-white {{ p.name }}
    .row.full-width.q-px-sm.q-my-sm
      q-btn(color="green" no-caps :style=`{height: '50px', borderRadius: '10px'}`).full-width
        span Invite friend
  //- footer mini
  div(:style=`{height: '60px'}`).row.full-width.items-center
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat :icon="mini ? 'keyboard_arrow_right' : 'keyboard_arrow_left'" color="white" @click="mini = !mini")
</template>

<script>
export default {
  name: 'kMenuDesktop',
  data () {
    return {
      width: 230,
      mini: false,
      pages: [
        {name: 'Explore', icon: 'explore', path: '/app/hot'},
        {name: 'Workspace', icon: 'img:statics/icons/anvil.svg', path: '/app/workspace'},
        // {name: 'Create node', icon: 'add', path: '/app/create'},
        // {name: 'Invite friend', icon: 'menu', path: '/app/invite'},
        {name: 'Subscriptions', icon: 'subscriptions', path: '/app/subscriptions'},
        {name: 'Notifications', icon: 'notifications', path: '/app/notifications'},
        {name: 'Settings', icon: 'settings', path: '/app/settings'},
        {name: 'Logout', icon: 'exit_to_app', path: '/app/logout'}
      ]
    }
  },
  watch: {
    mini: {
      handler (to, from) {
        let w = 0
        if (to) w = 60
        else w = 230
        this.$tween.to(this, 0.3, {width: w})
        // this.$emit('width', w)
      }
    },
    width: {
      handler (to, from) {
        this.$emit('width', to)
      }
    }
  },
  methods: {
    async pageClick (p, pi) {
      this.$log('pageClick', p, pi)
      switch (p.path) {
        case '/app/logout': {
          this.$log('LOGOUT')
          break
        }
        default: {
          this.$router.push(p.path)
        }
      }
    }
  }
}
</script>
