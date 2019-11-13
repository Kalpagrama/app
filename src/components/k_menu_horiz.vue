<template lang="pug">
div(:style=`{borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).row.full-width.q-px-sm.bg-primary
  div(:style=`{height: '60px', overflow: 'hidden', borderRadius: '20px 20px 0 0'}`
    ).row.full-width.items-center.content-center.justify-between.q-px-xs
    q-btn(round flat icon="blur_on" color="white" @click="pageClick('/app/home')")
    q-btn(round flat icon="whatshot" color="white" @click="pageClick('/app/hot')")
    q-btn(round push icon="add" color="green" size="md" @click="$root.$emit('create')")
    q-btn(round flat icon="img:statics/icons/anvil.svg" @click="pageClick('/app/workspace')")
    q-btn(round flat icon="menu" color="white" @click="pageClick('/app/menu')")
</template>

<script>
export default {
  name: 'kMenuHoriz',
  data () {
    return {
    }
  },
  methods: {
    pageClick (path) {
      this.$log('pageClick', path)
      this.$root.$emit('page', path)
      this.$router.push(path)
    }
  }
}
</script>
