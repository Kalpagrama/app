<template lang="pug">
div(:style=`{paddingBottom: '70px'}`).row.justify-start.content-start.q-pt-sm.q-px-sm
  div(
    :style=`{height: '300px', borderRadius: '10px'}`
    ).row.full-width.bg-white.q-mb-md
  div(
    :style=`{height: '300px', borderRadius: '10px'}`
    ).row.full-width.bg-white.q-mb-md
  div(
    :style=`{height: '300px', borderRadius: '10px'}`
    ).row.full-width.bg-white.q-mb-md
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    q-btn(
      v-if="tab === 'preview'"
      color="green" no-caps @click="publish()"
      :style=`{position: 'absolute', left: '8px', bottom: '8px', height: '60px',
        width: 'calc(100% - 16px)', borderRadius: '10px'}`)
      span.text-bold Опубликовать
</template>

<script>
export default {
  name: 'nodeCreator__nodePreview',
  props: ['tab', 'node'],
  data () {
    return {
      publishing: false
    }
  },
  methods: {
    async publish () {
      try {
        this.$log('nodePublish start')
        this.publishing = true
        await this.$wait(3000)
        // create mutation
        let node = await this.$store.dispatch('node/nodeCreate', this.node)
        // delete ws draft
        // if (this.draft) {
        //   let deleteWSDraft = await this.$store.dispatch('workspace/deleteWSDraft', this.draft)
        //   this.$log('deleteWSDraft', deleteWSDraft)
        // }
        // remove draftLocal
        localStorage.removeItem('draft')
        // remove draftStorage
        this.$store.commit('workspace/state', ['draft', null])
        // done
        this.$log('nodePublish done', node)
        this.publishing = false
        // go to home
        this.$router.push(`/app/home`)
      } catch (error) {
        this.$log('nodePublis error', error)
        this.publishing = false
        this.$q.notify({message: 'Node publish error!', color: 'red', textColor: 'white'})
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
