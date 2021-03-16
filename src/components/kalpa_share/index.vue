<template lang="pug">
q-btn(
  round flat no-caps
  :color="color"
  :loading="loading"
  @click="shareStart")
  //- q-tooltip(dense dark) {{$tt('Share')}}
  q-icon(name="logout" size="23px").rotate-270
  q-popup-proxy(
    cover anchor="top right" self="top right" dark
    max-width="200px"
    position="bottom")
    div(
      :style=`{
        borderRadius: '20px 20px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.items-start.content-start.b-40
      //- header
      div(
        v-if="headerText"
        ).row.full-width.items-center.content-center.q-pa-md
        span(:style=`{fontSize: '24px'}`).text-white.text-bold {{ headerText }}
        .col
        q-btn(round flat color="white" icon="clear" v-close-popup)
      //- body
      .row.full-width.items-start.content-start
        //- copy link
        .row.full-width.q-pa-md.q-mb-xl
          div(
            :style=`{
              position: 'relative', zIndex: 100,
              borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
            ).row.full-width
            q-input(
              v-model="shareLink"
              filled dark color="grey-9"
              ).full-width
              template(v-slot:append)
                q-btn(color="green" flat no-caps @click="shareLinkCopy()")
                  span.text-bold {{$t('Copy', 'Скопировать')}}
</template>

<script>
import { Platform, openURL } from 'quasar'
import { makeRoutePath } from 'public/scripts/common_func'

export default {
  name: 'kalpaShare',
  props: {
    type: {type: String, required: true},
    item: {type: Object, required: true},
    headerText: {
      type: String,
    },
    color: {type: String, default: 'grey-9'}
  },
  data () {
    return {
      loading: false,
      shareLink: '',
      shareDialogOpened: false,
      shareTarget: null,
    }
  },
  computed: {
    shareEmbedText () {
      return `<iframe width="100%" height="315" src="${makeRoutePath(this.item, true)}?embed=true" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    }
  },
  methods: {
    async shareStart () {
      this.$log('shareStart', Platform.is)
      // eslint-disable-next-line no-unreachable
      if (Platform.is.desktop) {
        this.shareLink = makeRoutePath(this.item, true)
        this.shareDialogOpened = true
      }
      else {
        await this.$systemUtils.shareOut(this.item)
      }
      this.$emit('done')
    },
    async shareLinkCopy () {
      this.$log('shareLinkCopy')
      this.clipboardWrite(this.shareLink, this.$t('Link copied to clipboard!', 'Ссылка скопирована !'))
      await this.$wait(500)
      this.shareDialogOpened = false
    },
    shareEmbed () {
      this.$log('shareEmbed')
      this.shareTarget = 'embed'
    },
    async shareEmbedCopy () {
      this.$log('shareEmbedCopy')
      this.clipboardWrite(this.shareEmbedText, 'Copied to clipboard!')
      await this.$wait(500)
      this.shareDialogOpened = false
    },
    clipboardWrite (val, message) {
      this.$log('clipboardWrite', val)
      navigator.permissions.query({name: 'clipboard-write'}).then(async (result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          await navigator.clipboard.writeText(val)
          if (message) this.$q.notify({type: 'positive', position: 'top', message: message})
        }
      })
    },
    shareWithTwitter () {
      this.$log('shareWithTwitter')
      let url = `https://twitter.com/intent/tweet?url=${this.shareLink}&via=Kalpagrama&text=${this.node.name}`
      openURL(url)
    }
  }
}
</script>
