<style lang="sass">
.q-item__section--side > .q-icon
  font-size: 36px !important
  padding-left: 20px !important
  padding-bottom: 10px
.voter
  &:hover
    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both
    transform: translate3d(0, 0, 0)
    backface-visibility: hidden
    perspective: 1000px
    color: #4caf50 !important
@keyframes shake
  10%, 90%
    transform: translate3d(-1px, 0, 0)
    color: #4caf50 !important
  20%, 80%
    transform: translate3d(2px, 0, 0)
    color: #4caf50 !important
  30%, 50%, 70%
    transform: translate3d(-4px, 0, 0)
    color: #4caf50 !important
  40%, 60%
    transform: translate3d(4px, 0, 0)
    color: #4caf50 !important
</style>

<template lang="pug">
div(:style=`{borderTop: '1px solid rgb(50,50,50)'}`).row.full-width.items-start.content-start.q-pt-sm
  //- left column for author
  div(:style=`{width: '70px'}`).row.full-height.items-start.content-start.justify-center.q-px-sm
    user-avatar(:url="node.meta.author.thumbUrl" :width="50" :height="50")
  //- right column for the node
  .col
    div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.q-pr-sm
      //- node author... router-link...
      .row.full-width.items-end.content-end.q-py-xs.q-px-sm
        span.text-white.text-bold {{ node.meta.author.name }}
        .col
        small.text-grey-7 {{ createdAt }}
        q-icon(round flat dense color="grey-7" size="20px" name="more_horiz").q-ml-sm
      //- node items, item[0] wrapper
      div(:style=`{borderRadius: '10px',}`).row.full-width.items-start.content-start.b-40
        //- node.name
        div(:style=`{}`).row.full-width.q-px-sm.q-py-xs
          span(v-for="(n,ni) in node.name" :key="ni").text-white {{ node.name }}
        //- node items, item[0],
        //- TODO: onClick() ???
        img(
          :src="preview" draggable="false"
          :style=`{borderRadius: '10px'}`
          ).full-width
      //- footer: actions
      .row.full-width.justify-between
        //- share/reNode/spheres
        .row.full-height.items-center.content-center.q-py-sm
          q-btn(flat dense color="grey-8" icon="share" @click="shareStart()")
            small.text-grey-8 11
          q-btn(flat dense color="grey-8" icon="loop" @click="reNodeStart()")
            small.text-grey-8 1230
          q-btn(flat dense color="grey-8" icon="blur_on" @click="spheresStart()")
            small.text-grey-8 4
        //- voting
        .row.full-height.items-center.content-center.q-py-xs
          q-btn(
            @click="voteStart()"
            flat
            :color="voteColor"
            :loading="voting"
            @mouseenter="voteColor = 'green'"
            @mouseleave="voteColor = 'grey-7'").voter
            q-icon(name="thumb_down" :color="voteColor" :style=`{marginTop: '10px'}`)
            span.text-grey-5.text-bold.q-mt-xs.q-mx-xs 8.2
            q-icon(name="thumb_up" :color="voteColor")
      //- footer: explore chain node
      .row.full-width.q-pb-lg
        q-btn(
          flat dense no-caps color="green" :to="'/twitter/node/'+node.oid").q-px-sm
          span.text-bold Explore chain
</template>

<script>
import { date } from 'quasar'
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeItem',
  props: ['node'],
  data () {
    return {
      voteColor: 'grey-7',
    }
  },
  computed: {
    preview () {
      return this.node.meta.items[0].thumbUrl
    },
    createdAt () {
      return date.formatDate(this.node.createdAt, 'DD.MM.YYYY')
    }
  },
  methods: {
    shareStart () {},
    reNodeStart () {},
    spheresStart () {
      this.$log('spheresStart')
    },
    voteStart () {
      this.$log('voteStart')
      this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
      this.$q.bottomSheet({
        dark: true,
        title: 'Не сыкуй, голосуй!',
        persistent: true,
        seamless: false,
        grid: false,
        style: {
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          paddingBottom: '50px',
        },
        actions: [
          {id: 1, label: this.$t('nodeVote100', 'Прямо в точку!'), icon: '😝', value: 100},
          {id: 0.7, label: this.$t('nodeVote70', 'Близко'), icon: '😌', value: 70},
          {id: 0.5, label: this.$t('nodeVote50', 'Где-то рядом'), icon: '🤔', value: 50},
          {id: 0.3, label: this.$t('nodeVote30', 'Ну такое...'), icon: '🤥', value: 30},
          {id: 0, label: this.$t('nodeVote0', 'Очень далеко'), icon: '🥵', value: 0},
        ]
      })
        .onOk(action => {
          this.$log('voteStart onOk', action)
          this.vote(action.value)
        })
        .onDismiss(() => {
          this.$log('voteStart onDismiss')
          this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
        })
        .onCancel(() => {
          this.$log('voteStart onCancel')
        })
    },
    async vote (val) {
      try {
        this.$log('vote start', val)
        this.voting = true
        await this.$wait(1000)
        let res = await NodeApi.nodeVote(this.node.oid, val)
        this.$log('vote done', res)
        this.voting = false
      }
      catch (e) {
        this.$log('vote error', e)
        this.voting = false
      }
    }
  }
}
</script>
