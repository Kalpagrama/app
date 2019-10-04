<template lang="pug">
div(:style=`{height: '55px'}`).row.full-width.items-center.justify-end.q-px-sm
  //- share
  k-menu-popup(name="Поделиться" :actions="actions" @action="nodeShare")
    q-btn(color="grey-9" round flat)
      q-icon(name="share" size="26px" color="grey-8")
  .col
  //- rate
  div(v-if="nodeFull && nodeFull.rateUser").q-mr-sm
    small {{Math.ceil(nodeFull.rateUser*100)}}/
    span(:style=`{fontSize: '15px'}`).text-bold {{Math.ceil(nodeFull.rate*100)}}
  q-btn(color="grey-9" round flat @click="nodeRate()")
    q-icon(name="blur_on" size="34px")
</template>

<script>
import nodeRate from './node_rate'

export default {
  name: 'nodeActions',
  components: {nodeRate},
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active'],
  data () {
    return {
      value: 0,
      nodeRating: false,
      nodeRated: false,
      nodeRates: [
        {id: 1, name: 'Нет', rate: 0.0, icon: 'gps_off', opacity: 1},
        {id: 2, name: 'Скорее нет', rate: 0.25, icon: 'gps_not_fixed', opacity: 0.7},
        {id: 3, name: 'Может быть', rate: 0.5, icon: 'gps_not_fixed', opacity: 1},
        {id: 4, name: 'Скорее да', rate: 0.75, icon: 'gps_fixed', opacity: 0.7},
        {id: 5, name: 'Да', rate: 1.0, icon: 'gps_fixed', opacity: 1}
      ],
      actions: [
        {id: 'to_bookmark', name: 'Сохранить в закладки'},
        {id: 'to_telegram', name: 'Отправить в Telegram'},
        {id: 'to_copy', name: 'Скопировать ссылку'}
      ]
    }
  },
  watch: {
    nodeFull: {
      handler (to, from) {
        if (to && to.rateUser) this.value = to.rateUser * 100
      }
    }
  },
  computed: {
    rateCurrent () {
      let v = this.value
      if (v < 25) return this.nodeRates[0]
      else if (v < 50) return this.nodeRates[1]
      else if (v < 75) return this.nodeRates[2]
      else if (v < 100) return this.nodeRates[3]
      else return this.nodeRates[4]
    },
    showNodeRate () {
      if (this.nodeFull && this.nodeFull.rateUser) {
        return true
      } else {
        if (this.nodeRated) return true
        else return false
      }
    }
  },
  methods: {
    nodeShare ({id}) {
      // this.$log('nodeShare', id)
      switch (id) {
        case 'to_bookmark': {
          this.$log('nodeShare', id)
          break
        }
        case 'to_telegram': {
          this.$log('nodeShare', id)
          break
        }
        case 'to_copy': {
          this.$log('nodeShare', id)
          break
        }
      }
    },
    nodeRate () {
      this.$log('nodeRate')
      this.$store.commit('node/state', ['node', this.node])
      this.$store.commit('node/state', ['nodeFull', this.nodeFull])
      this.$store.commit('node/state', ['rateDialogOpened', true])
    },
    async nodeRateJob () {
      this.$log('nodeRateJob start')
      this.nodeRating = true
      let {data: { nodeRate }} = await this.$apollo.mutate({
        mutation: gql`
          mutation nodeRate2($oid: OID!, $rate: Float!) {
            nodeRate(oid: $oid, rate: $rate)
          }
        `,
        variables: {
          oid: this.node.oid,
          rate: this.value / 100
        }
      })
      await this.$wait(200)
      this.nodeRating = false
      this.nodeRated = true
      this.$log('nodeRateJob done')
    },
    async nodeBookmark () {
      this.$log('nodeBookmark')
      this.$store.commit('workspace/state', ['bookmark', {oid: this.node.oid}])
      await this.$wait(300)
      this.$nextTick(() => {
        this.$store.commit('workspace/state', ['bookmarkEditorDialogOpened', true])
      })
    }
  }
}
</script>
