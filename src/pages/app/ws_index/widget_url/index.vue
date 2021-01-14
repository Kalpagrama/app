<template lang="pug">
.row.full-width.q-px-sm
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width.q-pa-md
    .row.full-width.justify-center.q-py-md
      span(:style=`{fontSize: '18px',}`).text-white Добавить контент по ссылке
    q-input(
      v-model="url"
      dark borderless placeholder="Вставье сслыку на контент"
      :input-style=`{
        padding: '12px',
        background: 'rgb(40,40,40)',
        borderRadius: '10px',
      }`
      ).full-width
      //- template(v-slot:prepend)
        q-btn(
          round flat dense color="grey-5" icon="menu")
    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center.q-py-sm
      small.text-grey-5 YouTube Twitter Spotify Webpage Instagram
      small.text-grey-5 популярные сервисы откуда мы принимаем ссылки и soon может быть перечислить
</template>

<script>
export default {
  name: 'widgetUrl',
  data () {
    return {
      url: '',
    }
  }
}
</script>
