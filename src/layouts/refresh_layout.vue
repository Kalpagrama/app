<template lang="pug">
  .column.fit.items-center.justify-center
    q-btn(
      push no-caps color="red" @click="refresh"
      :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width
      span.text-bold {{$t('refresh_app', 'clear app data')}}
</template>

<script>
  import { checkUpdate, clearCache } from 'src/system/service_worker'

  export default {
    name: 'refreshLayout',
    methods: {
      async refresh () {
        console.log('refresh app!!!')
        if (localStorage.getItem('ktoken')) {
          try {
            await this.$store.dispatch('auth/logout', localStorage.getItem('ktoken'))
          } catch (err) {
            this.$logE('err on logout on refresh', err)
          }
        }
        try {
          await checkUpdate()
        } catch (err) {
          this.$logE('err on checkUpdate on refresh', err)
        }
        try {
          await clearCache()
        } catch (err) {
          this.$logE('err on clearCache on refresh', err)
        }
        localStorage.clear()
        await this.$router.push('/')
        await window.location.reload()
      }
    },
    async mounted () {
      this.$logD('mounted')
    },
    beforeDestroy () {
      this.$logD('beforeDestroy')
    }
  }
</script>
