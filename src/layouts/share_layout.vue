/**
* компонент для перехвата данных при вызове меню "поделиться в наше приложение"
* сохраняет данные во vuex и вызывает форму создания
*/
<template lang="pug">
  .column.fit.items-center.justify-center
    //- span {{ share }}
</template>

<script>
import { get, Store } from 'public/statics/scripts/idb-keyval/idb-keyval.mjs'

export default {
  name: 'shareLayout',
  async mounted () {
    // const toBase64 = file => new Promise((resolve, reject) => {
    //   const reader = new FileReader()
    //   reader.readAsDataURL(file)
    //   reader.onload = () => resolve(reader.result)
    //   reader.onerror = error => reject(error)
    // })
    this.$logD('mounted')
    const swShareStore = new Store('sw-share', 'request-formData')
    let shareData = await get('shareData', swShareStore)
    alert('share to KALPAGRAMA! shareData (see store.core.state.shareData)=\n' + JSON.stringify(shareData))
    this.$logD('formData=', shareData)
    this.$store.commit('core/stateSet', ['shareData', shareData])
    // if (shareData.image) this.$logD('file image =', await toBase64(shareData.image))
    await this.$router.push('/workspace')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
