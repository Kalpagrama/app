<template lang="pug">
.column.fit.bg-primary
  .row.full-width.items-center
    div(:style=`{height: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.bg-primary.items-center.content-center.q-py-sm
      k-logo(:width="100" :height="100")
      .row.full-width.justify-center.q-mt-xs
        small.text-grey {{$t('Version', 'Версия')}} {{$store.state.core.version}}
    .row.items-start.content-start.q-px-md.bg-white
      div(v-for="(i, ii) in informations" :key="ii" @click=""
      :style=`{height: '40px'}`).row.full-width.items-center.cursor-pointer.q-px-md
        span {{ $t(i.name) }}
        .col.row.justify-end
          q-icon(name="keyboard_arrow_right" color="accent" size="20px")
</template>

<script>
export default {
  name: 'pageApp__Settings__Information',
  data () {
    return {
      informations: {
        feedback: {name: 'Feedback'},
        rateApp: {name: 'Rate app'},
        privacyPolicy: {name: 'Privacy Policy'},
        terms: {name: 'Terms of use'},
        licenses: {name: 'Licenses'},
        dataprotection: {name: 'Data protection'}
      }
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
