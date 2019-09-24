<template lang="pug">
div(:style=`{height: '55px'}`).row.full-width.items-center.justify-end.q-px-sm
  //- rate v-touch-swipe.mouse.down="$refs.rateDialog ? $refs.rateDialog.hide() : false"
  q-dialog(ref="rateDialog" position="bottom")
    div(
      :style=`{position: 'relative', borderRadius: '10px 10px 0 0', height: '80vh'}`).row.full-width.items-start.content-start.bg-white
      div(:style=`{height: '80px'}`).row.full-width.justify-center.items-center
        h3.q-ma-xs Далеко
      .row.full-width.justify-center
        q-icon(name="blur_on" :style=`{fontSize: '300px'}`)
          q-btn(round color="primary" :style=`{position: 'absolute', right: '0px', bottom: '15px'}` size="xl")
      div(:style=`{height: '80px'}`).row.full-width.justify-center.items-end
        h4.q-ma-xs.q-mr-sm 67 /
        h3.q-ma-xs.text-bold 99
      div(v-if="true" :style=`{position: 'absolute', zIndex: 1000, bottom: '0px', height: '70px'}`).row.full-width.q-px-sm
        q-btn(color="primary" :style=`{height: '60px', borderRadius: '20px'}` :loading="nodeRating" @click="nodeRateJob()" no-caps).full-width
          span.text-bold.text-white {{`Проголосовать`}}
    //- div(
    //-   v-if="nodeFull"
    //-   :style=`{position: 'relative', maxWidth: '550px', height: '80vh', width: 'calc(100% - 20px)', borderRadius: '16px 16px 0px 0px', overflow: 'hidden'}`
    //-   ).row.justify-center.items-start.content-start.bg-white
    //-     div(:style=`{height: '100px'}`).row.full-width.items-center.justify-center
    //-       h3 {{rateCurrent.name}}
    //-       //- h3(v-if="nodeFull") {{nodeFull.rate}}
    //-     q-knob(
    //-       v-if="showNodeRate"
    //-       :value="nodeFull.rate*100" readonly show-value
    //-       size="300px" :thickness="0.9" color="grey-6" center-color="black"
    //-       :style=`{position: 'absolute', bottom: '80px', zIndex: zIndex+20}`)
    //-       small.text-white {{Math.ceil(value)}}
    //-     q-knob(
    //-       v-model="value" :readonly="showNodeRate ? true : false" show-value
    //-       size="200px" :thickness="0.60" color="primary" center-color="white"
    //-       :style=`{position: 'absolute', bottom: '130px', zIndex: zIndex+10, borderRadius: '50%'}`
    //-       ).bg-grey-3
    //-       small.text-black {{Math.ceil(value)}}
    //-     div(
    //-       v-if="nodeFull && !nodeFull.rateUser"
    //-       :style=`{position: 'absolute', bottom: '0px', height: '70px'}`).row.full-width.items-center.q-px-sm
    //-       q-btn(color="primary" :style=`{height: '60px', borderRadius: '10px'}` :loading="nodeRating" @click="nodeRateJob()").full-width {{`Проголосовать`}}
  //- share
  q-dialog(ref="shareDialog" position="bottom")
    div(
      :style=`{maxWidth: '550px', height: '80vh', width: 'calc(100% - 20px)', borderRadius: '16px 16px 0px 0px', overflow: 'hidden'}`
      ).row.justify-center.items-start.content-start.bg-white.q-mx-sm
      div(:style=`{borderRadius: '16px 16px 0px 0px', height: '70vh', maxWidth: '500px !important'}`).row.full-width.items-start.content-start.bg-white
        div(:style=`{height: '100px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-sm.cursor-pointer
          span Отправить на почту
        div(:style=`{height: '100px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-sm.cursor-pointer
          span Отправить в VK
        div(:style=`{height: '100px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-sm.cursor-pointer
          span Отправить в Telegram
        div(:style=`{height: '100px'}`).row.full-width.items-center.justify-center.q-px-sm.cursor-pointer
          span Получить ссылку
  //- workspace
  q-dialog(ref="workspaceDialog" position="bottom")
    div(
      :style=`{maxWidth: '550px', height: '80vh', width: 'calc(100% - 20px)', borderRadius: '16px 16px 0px 0px', overflow: 'hidden'}`
      ).row.justify-center.items-start.content-start.bg-white.q-mx-sm
      div(:style=`{borderRadius: '16px 16px 0px 0px', height: '70vh', maxWidth: '500px !important'}`).row.full-width.bg-white
        //- div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        //-   //- span Выберите цепочку
        //- div(:style=`{height: '60px'}`).row.full-width.items-center.justify-center.q-px-sm
        //-   //- span Создать цепочку
        //-   q-btn(icon-right="add" color="grey-7" flat) Создать цепочку
  //- share
  q-btn(color="grey-9" round flat @click="nodeShare()")
    q-icon(name="call_made" size="26px" color="grey-8").rotate-270
  //- chain
  q-btn(:icon="nodeWorkspaced ? 'turned_in' : 'turned_in_not'" color="grey-8" round flat @click="nodeBookmark()")
  slot(name="actions")
  //- chain name and selector
  .col
    //- div(v-if="true") Some chain name
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
    nodeWorkspaced () {
      // let findNode = this.$store.state.workspace.workspace.nodes.find(n => (n.oid === this.node.oid))
      // if (findNode) return true
      // else return false
      return false
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
    handleDrag (e) {
      this.$log('handleDrag')
    },
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
    async nodeBookmark () {
      this.$log('nodeBookmark')
      let n = JSON.parse(JSON.stringify(this.nodeFull))
      let r = await this.$store.dispatch('workspace/addWSNode', this.$strip(n))
      this.$log('r', r)
      // this.$refs.workspaceDialog.show()
    }
  }
}
</script>
