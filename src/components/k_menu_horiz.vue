<template lang="pug">
.row.full-width.q-px-sm
  div(:style=`{height: '50px', overflow: 'hidden', borderRadius: '20px 20px 0 0'}`
    ).row.full-width.items-end.content-end.justify-between.q-px-md.q-mx-md
    q-btn(
      v-for="(p, pkey) in pages" :key="pkey" @click="pageClick(p, pkey)"
      round flat :color="page === pkey ? colors[0] : colors[1]")
      q-icon(:name="p.icon" :size="page === pkey ? '30px' : '20px'")
</template>

<script>
export default {
  name: 'kMenuHoriz',
  props: ['page', 'colors'],
  data () {
    return {
      pages: {
        'home': {name: 'Home', icon: 'blur_on', path: '/app/home'},
        'hot': {name: 'Hot', icon: 'whatshot', path: '/app/hot'},
        'create': {name: 'Create', icon: 'add', path: '/app/create'},
        'workspace': {name: 'Workspace', icon: 'cloud_queue', path: '/app/workspace'},
        'menu': {name: 'Menu', icon: 'menu', path: '/app/menu'}
      }
    }
  },
  methods: {
    pageClick (p, pkey) {
      this.$log('pageClick', p, pkey)
      if (this.page === pkey) {
        this.$root.$emit('page', p)
      } else {
        this.$router.push(p.path)
      }
    }
  }
}
</script>
