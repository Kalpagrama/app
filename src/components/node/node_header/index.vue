<template lang="pug">
div(
  :style=`{
    //- height: '50px',
    order: orderHeader,
  }`
  ).row.full-width.items-center.content-center
  q-btn(
    v-if="showAuthorAlways || node.rateUser !== null"
    :to="'/user/'+node.author.oid"
    round flat color="white" no-caps
    ).row.q-pl-sm
    img(
      draggable="false"
      :src="node.author.thumbUrl"
      :style=`{
        width: '24px', minWidth: '24px', maxWidth: '24px',
        height: '24px', minHeight: '24px', maxHeight: '24px',
        borderRadius: '50%',
      }`)
    .col
      .row.items-center.content-center.q-px-sm.q-mb-xs
        span.text-grey-4 {{ node.author.name }}
        .row.full-width
          small(:style=`{lineHeight: 0.5}`).text-grey-6 @username
  div(
    v-else
    :style=`{
      height: '40px',
    }`
    ).row.items-center.content-center.q-pa-sm
    div(:style=`{width: '24px',minWidth: '24px',height: '24px',minHeight: '24px',borderRadius: '50%',}`).b-40.q-mr-sm
    .col
      div(:style=`{width: '100px', minWidth: '100px', height: '14px', borderRadius: '10px'}`).b-40
      div(:style=`{width: '70px', minWidth: '70px', height: '10px', borderRadius: '10px',marginTop:'3px'}`).b-40
  .col
  .row.items-center.content-center.justify-end.q-pt-xs
    small(:style=`{lineHeight: 0.6}`).text-grey-8 {{ $date(node.createdAt, 'DD.MM.YYYY') }}
    .row.full-width.items-center.content-center.justify-end
      q-icon(name="visibility" color="grey-8").q-mr-xs
      small(:style=`{lineHeight: 0.6}`).text-grey-8 {{ node.countStat.countViews }}
  kalpa-menu-actions(
    icon="more_vert"
    color="grey-8"
    :headerText="$tt('Node')"
    :actions="actions")
</template>

<script>
import { ObjectApi } from 'src/api/object'

export default {
  name: 'nodeHeader',
  props: ['node', 'showAuthorAlways'],
  computed: {
    actions () {
      let res = {
        copyLink: {
          name: this.$tt('Copy Link'),
          cb: async () => {
            this.$log('copyLink')
            // TODO: handle copy link...
          }
        },
        // goThreads: {
        //   name: this.$tt('Go threads'),
        //   cb: async () => {
        //     this.$log('goThreads')
        //     this.$router.push('/sphere-threads/' + this.node.sphereFromName.oid)
        //   }
        // },
        goGraph: {
          name: this.$tt('Go graph'),
          cb: async () => {
            this.$log('goGraph')
            if (this.node.items.length === 1) {
              this.$router.push(`/graph/${this.node.oid}`)
            }
            else {
              this.$router.push(`/graph/${this.node.items[0].oid}?oid=${this.node.oid}`)
            }
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
