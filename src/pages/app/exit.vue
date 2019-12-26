<template lang="pug">
.row.fit.justify-center.bg-grey-2
  .row.full-width
    div(:style=`{height: '50px'}`).row.full-width.items-center.justify-end.q-pl-md
      .row
        span.text-bold {{$t('Выход')}}
      .col.row.justify-end
        q-btn(round flat icon="clear" @click="$emit('hide')")
  .row.full-width.justify-center.content-start
    .row.full-width.justify-center.q-mb-md
      span.text-bold {{$t('Вы точно хотите выйти?')}}
    .row.full-width.justify-center.q-px-md.q-mb-sm
      q-btn(@click="logout()" no-caps dense color="primary" style=`width: 120px; border-radius: 10px` :label="$t('Выйти')").row.full-width
    .row.full-width.justify-center.q-px-md
      q-btn(@click="$emit('hide')" no-caps dense color="primary" style=`width: 120px; border-radius: 10px` :label="$t('Отмена')").row.full-width
</template>
<script>
export default {
  name: 'pageExit',
  data () {
    return {
    }
  },
  methods: {
    async logout () {
      await this.$store.dispatch('auth/logout', localStorage.getItem('ktoken'))
    }
  }
}
</script>
