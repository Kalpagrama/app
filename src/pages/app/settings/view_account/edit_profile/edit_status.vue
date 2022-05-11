<template lang="pug">
div(
  :style=`{
    paddingBottom: '2px',
  }`
  ).row.full-width.q-px-xs
  .row.full-width.q-pl-sm
    small.text-grey-6 {{$t('Bio')}}
  q-input(
    v-model="status"
    type="textarea" autogrow dark color="white"
    borderless
    :placeholder = "$t('Расскажи о себе')"
    :debounce="500"
    :input-style=`{
      background: 'rgb(45,45,45)',
      borderRadius: '10px',
      padding: '12px',
      minHeight: '80px',
    }`
    :style=`{
      //- paddingLeft: '8px',
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
      locked: false,
      status: this.currentUser.profile.status || ''
    }
  },
  watch: {
    status: {
      handler (to, from) {
        // if (this.locked) return
        this.$log('status TO', to)
        this.save()
      }
    }
  },
  methods: {
    async save () {
      this.$log('save')
      await ObjectApi.update(this.currentUser.oid, 'profile.status', this.status)
      this.$notify('success', this.$t('Сохранено'))
    }
  },
  async mounted () {
    this.$log('mounted')
    // if (this.currentUser.profile.status) {
    //   this.locked = true
    //   this.status = this.currentUser.profile.status
    //   // await this.$wait(300)
    //   this.locked = false
    // }
  }
}
</script>
