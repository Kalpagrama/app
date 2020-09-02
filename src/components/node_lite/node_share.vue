<template lang="pug">
q-btn(
  @click="shareStart()"
  flat icon="share"
  :color="shareDialogOpened ? 'green' : 'grey-7'")
  q-dialog(v-model="shareDialogOpened")
    div(
      :style=`{
        width: '400px',
        height: '250px',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width.items-start.content-start.b-30
      //- header
      .row.full-width.items-center.content-center.q-pa-md
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold Share
        q-btn(
          @click="shareDialogOpened = false"
          round flat color="grey-8" icon="clear")
      //- embed node
      //- div()
        q-input(
          v-model="embedText")
      //- copy link
      .row.full-width.q-pa-md
        div(
          :style=`{
            position: 'relative', zIndex: 100,
            borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
          ).row.full-width
          q-input(
            v-model="shareLink"
            filled dark color="grey-8"
            ).full-width
            template(v-slot:append)
              q-btn(color="green" flat no-caps @click="shareLinkCopy()")
                span.text-bold Copy
      //- links
      .row.full-width.q-px-md
        q-btn(
          round icon="code" color="grey-5" size="lg"
          :style=`{borderRadius: '50%'}`).q-mr-md
        q-btn(
          @click="shareWithTwitter"
          round icon="fab fa-twitter" color="blue-6" size="lg"
          :style=`{borderRadius: '50%'}`).q-mr-md
        q-btn(
          round icon="fab fa-vk" color="blue-8" size="lg"
          :style=`{borderRadius: '50%'}`).q-mr-md
</template>

<script>
import { Platform, openURL } from 'quasar'
import { shareWith } from 'src/system/services'

export default {
  name: 'nodeShare',
  props: ['node'],
  data () {
    return {
      shareLink: '',
      shareDialogOpened: false,
      embedText: '<iframe width="560" height="315" src="https://www.youtube.com/embed/qnlXQMSXkBQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    }
  },
  methods: {
    shareStart () {
      this.$log('shareStart')
      if (Platform.is.desktop) {
        this.shareLink = location.origin + '/node/' + this.node.oid
        this.shareDialogOpened = true
      }
      else {
        shareWith(this.node)
      }
    },
    async shareLinkCopy () {
      this.$log('shareLinkCopy')
      navigator.permissions.query({name: 'clipboard-write'}).then(async (result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          await navigator.clipboard.writeText(this.shareLink)
          this.$q.notify({type: 'positive', position: 'top', message: 'Link copied to clipboard'})
          await this.$wait(500)
          this.shareDialogOpened = false
        }
      })
    },
    shareWithTwitter () {
      this.$log('shareWithTwitter')
      let url = `https://twitter.com/intent/tweet?url=${this.shareLink}&via=Kalpagrama&text=${this.node.name}`
      openURL(url)
    }
  },
  mounted () {
    // this.$log('mounted')
  }
}
</script>
