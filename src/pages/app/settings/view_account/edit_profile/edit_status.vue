<template lang="pug">
div(
  :style=`{
    paddingBottom: '2px',
  }`
  ).row.full-width.q-px-xs
  q-input(
    v-model="status"
    type="textarea" autogrow dark
    borderless flat
    placeholder="Расскажи о себе"
    :debounce="500"
    :input-style=`{
      background: 'rgb(45,45,45)',
      borderRadius: '10px',
      padding: '12px',
      minHeight: '80px',
    }`
    ).full-width
</template>

<script>
import { ObjectApi } from 'src/api/object'

export default {
  name: 'editStatus',
  props: ['currentUser'],
  data () {
    return {
      status: ''
    }
  },
  watch: {
    currentUser: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('currentUser TO', to)
        if (to.profile.status) {
          this.status = to.profile.status
        }
      }
    },
    status: {
      handler (to, from) {
        this.$log('status TO', to)
        this.save()
      }
    }
  },
  methods: {
    async save () {
      await ObjectApi.update(this.currentUser.oid, 'profile.status', this.status)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
