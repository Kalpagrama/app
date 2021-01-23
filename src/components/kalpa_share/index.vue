<template lang="pug">
.row.justify-center.items-center.content-center
  //- share dialog
  q-dialog(
    v-model="shareDialogOpened"
    position="bottom"
    :maximized="$q.screen.width < 800")
    div(
      :style=`{
        height: $q.screen.width < 800 ? $q.screen.height-60+'px' : '400px',
        maxWidth: $q.screen.width < 800 ? '100%' : '500px',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width.items-start.content-start.b-30
      //- header
      .row.full-width.items-center.content-center.q-pa-md
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Share', 'Поделиться')}}
        q-btn(
          @click="shareDialogOpened = false"
          round flat color="grey-9" icon="clear")
      //- copy link
      .row.full-width.q-pa-md
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
      //- links
      //- div(
        v-if="!shareTarget").row.full-width.q-px-md
        q-btn(
          @click="shareEmbed"
          round icon="code" color="grey-5" size="lg"
          :style=`{borderRadius: '50%'}`).q-mr-md
        //- q-btn(
          @click="shareWithTwitter"
          round icon="fab fa-twitter" color="blue-6" size="lg"
          :style=`{borderRadius: '50%'}`).q-mr-md
        //- q-btn(
          round icon="fab fa-vk" color="blue-8" size="lg"
          :style=`{borderRadius: '50%'}`).q-mr-md
      //- embed
      //- div(
        v-if="shareTarget === 'embed'"
        ).row.full-width.q-pa-md
        div(
          :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
          q-input(
            :value="shareEmbedText"
            filled dark dense color="grey-6"
            type="textarea" autogrow
            :input-style=`{minHeight: '100px',}`).full-width
            template(v-slot:append)
              q-btn(color="green" flat no-caps @click="shareEmbedCopy()")
                span.text-bold {{$t('Copy', 'Скопировать')}}
  div(
    @click="shareStart()"
    ).row
    slot
    //- share start btn
    q-btn(
      v-if="!$slots.default"
      round flat no-caps
      icon="share"
      :color="'grey-9'"
      :loading="loading")
</template>

<script>
import { Platform, openURL } from 'quasar'
import { makeRoutePath } from 'public/scripts/common_func'

export default {
  name: 'kalpaShare',
  props: {
    type: {type: String, required: true},
    item: {type: Object, required: true},
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
