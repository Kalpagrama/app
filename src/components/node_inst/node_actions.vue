<template lang="pug">
div(:style=`{height: '55px'}`).row.full-width.items-center.justify-end.q-px-sm
  //- rate
  q-dialog(ref="rateDialog" position="bottom")
    div(
      v-if="nodeFull"
      :style=`{position: 'relative', maxWidth: '550px', height: '80vh', width: 'calc(100% - 20px)', borderRadius: '16px 16px 0px 0px', overflow: 'hidden'}`
      ).row.justify-center.items-start.content-start.bg-white.q-mx-md
        div(:style=`{height: '100px'}`).row.full-width.items-center.justify-center.q-px-sm
          h3 {{rateCurrent.name}}
          //- h3(v-if="nodeFull") {{nodeFull.rate}}
        q-knob(
          v-if="showNodeRate"
          :value="nodeFull.rate*100" readonly show-value
          size="300px" :thickness="0.9" color="grey-6" center-color="black"
          :style=`{position: 'absolute', bottom: '80px', zIndex: zIndex+20}`)
          small.text-white {{Math.ceil(value)}}
        q-knob(
          v-model="value" :readonly="showNodeRate ? true : false" show-value
          size="200px" :thickness="0.60" color="primary" center-color="white"
          :style=`{position: 'absolute', bottom: '130px', zIndex: zIndex+10, borderRadius: '50%'}`
          ).bg-grey-3
          small.text-black {{Math.ceil(value)}}
        div(
          v-if="nodeFull && !nodeFull.rateUser"
          :style=`{position: 'absolute', bottom: '0px', height: '70px'}`).row.full-width.items-center.q-px-sm
          q-btn(color="primary" :style=`{height: '50px'}` :loading="nodeRating" @click="nodeRateJob()").full-width {{`Проголосовать`}}
  //- share
  q-dialog(ref="shareDialog" position="bottom")
    div(
      :style=`{maxWidth: '550px', height: '80vh', width: 'calc(100% - 20px)', borderRadius: '16px 16px 0px 0px', overflow: 'hidden'}`
      ).row.justify-center.items-start.content-start.bg-white.q-mx-md
      div(:style=`{borderRadius: '16px 16px 0px 0px', height: '70vh', maxWidth: '500px !important'}`).row.full-width.items-start.content-start.bg-white
        div(:style=`{height: '100px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-sm.cursor-pointer
          span Отправить на почту
        div(:style=`{height: '100px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-sm.cursor-pointer
          span Отправить в VK
        div(:style=`{height: '100px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-sm.cursor-pointer
          span Отправить в Telegram
        div(:style=`{height: '100px'}`).row.full-width.items-center.justify-center.q-px-sm.cursor-pointer
          span Получить ссылку
  //- chain
  q-dialog(ref="chainDialog" position="bottom")
    div(
      :style=`{maxWidth: '550px', height: '80vh', width: 'calc(100% - 20px)', borderRadius: '16px 16px 0px 0px', overflow: 'hidden'}`
      ).row.justify-center.items-start.content-start.bg-white.q-mx-md
      div(:style=`{borderRadius: '16px 16px 0px 0px', height: '70vh', maxWidth: '500px !important'}`).row.full-width.bg-white
        div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
          //- span Выберите цепочку
        div(:style=`{height: '60px'}`).row.full-width.items-center.justify-center.q-px-sm
          //- span Создать цепочку
          q-btn(icon-right="add" color="grey-7" flat) Создать цепочку
  //- share
  q-btn(color="grey-9" round flat @click="nodeShare()")
    q-icon(name="call_made" size="26px" color="grey-8").rotate-270
  //- chain
  q-btn(:icon="nodeChained ? 'bookmark' : 'bookmark_outline'" color="grey-8" round flat @click="nodeChain()")
  //- chain name and selector
  .col
    div(v-if="nodeChained && false") Some chain name
  //- rate
  div(v-if="nodeFull && nodeFull.rateUser").q-mr-sm
    small {{Math.ceil(nodeFull.rateUser*100)}}/
    span(:style=`{fontSize: '15px'}`).text-bold {{Math.ceil(nodeFull.rate*100)}}
  q-btn(color="grey-9" round flat @click="nodeRate()")
    q-icon(name="blur_on" size="34px")
</template>

<script>
export default {
  name: 'nodeActions',
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
    nodeChained () {
      return this.index % 2 === 0
    },
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
    nodeShare () {
      this.$log('nodeShare')
      this.$refs.shareDialog.show()
    },
    nodeRate () {
      this.$log('nodeRate')
      this.$refs.rateDialog.show()
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
    nodeChain () {
      this.$log('nodeChain')
      this.$refs.chainDialog.show()
    }
  }
}
</script>
