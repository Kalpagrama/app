<template lang="pug">
.row.full-width
  input(v-model="search"
    placeholder="Поиск" @input="onInput"
    :style=`{border: 'none', height: '40px', outline: 'none', borderRadius: '20px'}`
    ).full-width.bg-grey-3.q-px-md
</template>

<script>
export default {
  name: 'kSearch',
  data () {
    return {
      search: ''
    }
  },
  methods: {
    onInput (e) {
      this.$logD('onInput', e.target.value)
    }
  },
  mounted () {
    // this.$logD('mounted')
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
