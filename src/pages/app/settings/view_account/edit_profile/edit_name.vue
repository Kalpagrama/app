<template lang="pug">
div(
  :style=`{
    paddingBottom: '2px',
  }`
  ).row.full-width.q-px-xs
  .row.full-width.q-pl-sm
    small.text-grey-6 {{$t('Ваше имя')}}
  q-input(
    v-model="name"
    dark color="white"
    borderless
    maxlength="32"
    placeholder="Как вас зовут"
    :debounce="500"
    :input-style=`{
      background: 'rgb(45,45,45)',
      borderRadius: '10px',
      padding: '12px',
      //- minHeight: '80px',
    }`
    :style=`{
      //- paddingLeft: '8px',
    }`
    ).full-width
</template>

<script>
import { ObjectApi } from 'src/api/object'

export default {
  name: 'editName',
  props: ['currentUser', 'initialName'],
  data () {
    return {
      locked: false,
      name: this.initialName !== undefined ? this.initialName : this.currentUser.name || ''
    }
  },
  watch: {
    name: {
      handler (to, from) {
        // if (this.locked) return
        this.$log('status TO', to)
        this.save()
        if (this.name.length) this.$emit('name', this.name)
      }
    }
  },
  methods: {
    async save () {
      this.$log('save')
      if (this.name.length) {
        await ObjectApi.update(this.currentUser.oid, 'profile.name', this.name)
        this.$notify('success', this.$t('Сохранено'))
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    // if (this.currentUser.name) {
    //   this.locked = true
    //   this.name = this.currentUser.name
    //   // await this.$wait(300)
    //   this.locked = false
    // }
  }
}
</script>
