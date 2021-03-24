<style lang="sass">
a
  color: rgb(76,175,79)
  font-weight: bold
</style>

<template lang="pug">
q-layout(
  view="lHh lpR lFf"
  :container="false")
  q-drawer(
    v-model="docsDrawerOpened"
    behavior="mobile"
    side="right")
    div(
      :style=`{
        borderRadius: '10px 0 0 10px'
      }`
    ).column.full-width.window-height.b-30
      div(:style=`{height: '60px',}`).row.full-width.items-center.content-center.q-pa-md
        span(:style=`{fontSize: '20px',}`).text-white.text-bold {{$t('Chapters')}}
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-pa-sm
          router-link(
            v-for="(d,di) in docs" :key="di"
            :to="'/docs/'+d.id"
            :style=`{
              minHeight: '40px',
            }`
            ).row.full-width.q-pa-sm.q-mb-sm
            span.text-white {{ d.name }}
  q-header(reveal).b-30
    .row.full-width.justify-center.q-pt-sm.q-px-sm
      div(
        :style=`{maxWidth: '700px', height: '60px',borderRadius: '10px',}`
        ).row.full-width.items-center.content-center.b-40.q-px-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$routerKalpa.back()")
        .col
          span(:style=`{fontSize: '20px'}`).text-bold {{$t('Documents')}}
        q-btn(
          @click="docsDrawerOpened = true"
          round flat color="white" icon="list")
  q-page-container
    q-page.row.full-width.justify-center
      div(:style=`{maxWidth: '700px'}`).row.full-width.q-pa-md
        vue-showdown(
          v-if="doc"
          flavor="github"
          :markdown="docsMap[doc.id]"
          :options="{ emoji: true }"
          :style=`{
            lineHeight: 1.15
          }`
          ).full-width.text-white
</template>

<script>
import terms from 'assets/docs/terms_ru.md'
import policy from 'assets/docs/policy_ru.md'
import dmca from 'assets/docs/dmca_ru.md'

export default {
  name: 'docsLayout',
  data () {
    return {
      docsDrawerOpened: false,
      docsMap: {
        terms,
        policy,
        dmca,
      }
    }
  },
  computed: {
    docs () {
      return this.$store.state.ui.docs
    },
    doc () {
      return this.docs.find(d => d.id === this.$route.params.id)
    }
  }
}
</script>
