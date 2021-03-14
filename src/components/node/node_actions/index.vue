<template lang="pug">
div(
  :style=`{
    position: 'relative',
    overflow: 'hidden',
  }`
  ).row.full-width.items-center.content-center.q-pa-sm
  //- actions
  kalpa-menu-actions(
    :title="node.name"
    :actions="actions" icon="more_vert"
    :style=`{
      position: 'absolute', top: '8px', left: '18px', zIndex: 100,
    }`)
  div().col
  //- wrapper of 3 main actions
  div(:style=`{marginLeft: '-6px',}`).row
    //- share
    .row.items-center.content-center.q-px-sm
      small(:style=`{marginRight: '-8px',}`).text-grey-9 12
      q-btn(
        round flat color="grey-9")
        q-icon(name="logout").rotate-270
    //- save
    .row.items-center.content-center.q-px-sm
      small(:style=`{marginRight: '-8px',}`).text-grey-9 12
      kalpa-save(
        color="grey-9"
        :dense="false"
        :item="node"
        :isActive="isActive")
    //- discuss link
    .row.items-center.content-center.q-px-sm
      small(:style=`{marginRight: '-8px',}`).text-grey-9 12
      q-btn(
        round flat color="grey-9")
        q-icon(name="fas fa-link" size="20px")
  div().col
  //- vote
  div(
    :class=`{
      'full-width': votesShow,
    }`
    :style=`{
      position: 'absolute', top: '8px', right: '18px', zIndex: 100,
    }`
    ).row.justify-end
    .col
      transition(enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight")
        vote-options(
          v-if="votesShow"
          :node="node"
          @voted="votesShow = false")
    q-btn(
      v-if="votesShow"
      flat color="white" icon="clear"
      @click="votesShow = false"
      :style=`{
        width: '40px', height: '40px',
      }`)
    div(
      v-if="!votesShow"
      ).row.items-center.content-center
      .row.items-center.content-center
        .row.full-width.justify-end
          div(:style=`{width: '10px', height: '10px', borderRadius: '5px',}`).bg-purple
        .row.full-width.justify-end
          small(:style=`{lineHeight: 1.5}`).text-white 1M
      vote-ball(
        :node="node"
        @click.native="votesShow = true")
  //- vote description
  div(:style=`{height: '20px'}`).row.full-width
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="votesShow"
        ).row.full-width.justify-center
        small.text-white Насколько близко к сути ?
</template>

<script>
import { ObjectApi } from 'src/api/object'

import voteBall from './vote_ball.vue'
import voteOptions from './vote_options.vue'

export default {
  name: 'nodeActionsRight',
  props: ['node', 'isActive'],
  components: {
    voteBall,
    voteOptions,
  },
  data () {
    return {
      votesShow: false,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      handler (to, from) {
        if (to) {
        }
        else {
          this.votesShow = false
        }
      }
    }
  },
  methods: {
    voteBallClick () {
      this.votesShow = true
    },
  },
  computed: {
    actions () {
      let res = {
        copyLink: {
          name: this.$tt('Copy Link'),
          cb: async () => {
            this.$log('copyLink')
            // TODO: handle copy link...
          }
        }
      }
      if (this.$store.getters.currentUser().profile.role === 'GUEST') {
        return res
      }
      if (this.nodeIsMine) {
        res.delete = {
          // name: i18n.t('Delete', 'Удалить'),
          name: this.$tt('Delete'),
          color: 'red',
          cb: async () => {
            this.$log('nodeDelete...')
            await ObjectApi.unPublish(this.node.oid)
          }
        }
      }
      else {
        res.hide = {
          name: this.$tt('Hide'),
          color: 'white',
          cb: async () => {
            this.$log('hide...')
            await this.$rxdb.hideObjectOrSource(this.node.oid, null)
          }
        }
        res.report = {
          name: this.$tt('Report'),
          color: 'red',
          cb: () => {
            this.$log('report...')
            let reason = prompt(this.$tt('Why?'))
          }
        }
      }
      return res
    }
  }
}
</script>
