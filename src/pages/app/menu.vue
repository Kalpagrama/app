<template lang="pug">
q-layout
  //- header
  q-header(reveal)
    div(:style=`{height: '140px'}`).row.full-width.items-center
      .col.full-height
        .row.fit.items-center.q-pl-md
          span(v-if="$store.state.auth.user") {{ $store.state.auth.user.name }}
      div(:style=`{width: '70px', height: '70px'}`).row.items-center.justify-center
        q-btn(round flat icon="power_off" color="white" @click="logout()")
  //- page
  q-page-container
    div(
      v-for="(m, mkey) in 100" :key="mkey"
      :style=`{height: '60px'}`
      ).row.full-width.items-center.q-px-md
      span Menu {{ m }}
  //- footer
  q-footer(reveal).bg-grey-4.lg-md
    k-menu-horiz(page="menu" :colors="['white', 'grey-7']")
</template>

<script>
export default {
  name: 'menu',
  data () {
    return {
      menus: {}
    }
  },
  methods: {
    logout () {
      this.$log('logout')
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
