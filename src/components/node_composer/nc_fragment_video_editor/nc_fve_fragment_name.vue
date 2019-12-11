<template lang="pug">
.column.fit.bg-black
  .col.full-width
    .row.fit.items-start.content-start.q-pa-md
      .row.full-width
        input(
          ref="nameInput" v-model="name" :placeholder="$t('Set name')" @keyup.enter="confirm()"
          :style=`{fontSize: nameHeight+'px', background: 'none'}`).full-width.text-white.text-center.kinput
  div(:style=`{}`).row.full-width.items-center.q-pa-md
    q-btn(
      push no-caps color="green" :loading="loading" @click="confirm()"
      :style=`{height: '60px'}`).full-width
      span.text-bold {{ $t('Save') }}
</template>

<script>
export default {
  name: 'ncFveFragmentName',
  props: ['fragment'],
  data () {
    return {
      loading: false,
      name: '',
      nameHeight: 40
    }
  },
  watch: {
    name: {
      immediate: true,
      handler (to, from) {
        this.$log('name CHANGED', to)
        let h = 40 / (to.length * 0.07)
        if (h < 40) {
          this.nameHeight = h
        }
      }
    }
  },
  methods: {
    async confirm () {
      this.$log('confirm')
      this.loading = true
      await this.$wait(300)
      this.fragment.name = this.name
      this.loading = false
      this.$emit('close')
    }
  },
  mounted () {
    this.$log('mounted', this.fragment)
    if (this.fragment) {
      this.name = this.fragment.name
      this.$nextTick(() => {
        this.$refs.nameInput.focus()
      })
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
