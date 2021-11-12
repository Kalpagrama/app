<template lang="pug">
q-btn(
  round flat no-caps
  :color="color"
  :loading="data.loading"
  @click="shareStart()")
  q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Share')}}
  q-icon(name="logout" size="23px").rotate-270
  q-dialog(
    v-model="data.shareDialogOpened"
    position="bottom")
    div(
      :style=`{
        position: 'relative',
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
      .row.full-width.items-start.content-start.q-mb-xl
        //- copy link
        .row.full-width.q-pa-md
          div(
            :style=`{
              position: 'relative', zIndex: 100,
              borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
            ).row.full-width
            q-input(
              v-model="data.shareLink"
              filled dark color="grey-9"
              ).full-width
              template(v-slot:append)
                q-btn(color="green" flat no-caps @click="shareLinkCopy()")
                  span.text-bold {{$t('Copy')}}
        //- TODO: add links twitter and other socials
        ////- item repost
        ////- .row.full-width.q-pa-md
        //  q-btn(
        //    @click="itemRepost()"
        //    outline no-caps color="green"
        //    :style=`{
        //      height: '50px',
        //    }`
        //    ).full-width
        //    span {{$t('Make a repost')}}
        //- share native
        div(
          v-if="$q.platform.is.mobile"
          ).row.full-width.q-px-md
          q-btn(
            outline no-caps color="green"
            :style=`{
              height: '50px',
            }`
            @click="shareNative()"
            ).full-width
            span {{ $t('Share via') }}
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
import { Platform, openURL } from 'quasar'
import { makeRoutePath } from 'public/scripts/common_func'
import { assert } from 'src/system/common/utils'

export default {
  name: 'kalpaShare',
  props: {
    item: {type: Object, required: true},
    itemState: {type: Object},
    headerText: {
      type: String,
    },
    color: {type: String, default: 'grey-9'}
  },
  computed: {
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, {
          loading: false,
          shareLink: '',
          shareDialogOpened: false,
          shareTarget: null,
        })
      }
      return this.itemState[key]
    },
    shareEmbedText () {
      return `<iframe width="100%" height="315" src="${makeRoutePath(this.item, true)}?embed=true" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    }
  },
  methods: {
    itemRepost () {
      this.$log('itemRepost')
      this.$q.notify({type: 'negative', position: 'bottom', message: this.$t('Not implemented yet!')})
    },
    async shareNative () {
      this.$log('shareNative')
      await this.$systemUtils.shareOut(this.item)
    },
    async shareStart () {
      this.$log('shareStart', Platform.is)
      this.data.shareLink = makeRoutePath(this.item, true)
      if (this.$q.platform.is.mobile) {
        this.shareNative()
      }
      else {
        this.data.shareDialogOpened = true
      }
      // this.$emit('done')
    },
    async shareLinkCopy () {
      this.$log('shareLinkCopy')
      this.clipboardWrite(this.data.shareLink, this.$t('Ссылка скопирована!'))
      // await this.$wait(500)
      this.data.shareDialogOpened = false
    },
    shareEmbed () {
      this.$log('shareEmbed')
      this.data.shareTarget = 'embed'
    },
    async shareEmbedCopy () {
      this.$log('shareEmbedCopy')
      this.clipboardWrite(this.shareEmbedText, 'Copied to clipboard!')
      // await this.$wait(500)
      this.data.shareDialogOpened = false
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
      let url = `https://twitter.com/intent/tweet?url=${this.data.shareLink}&via=Kalpagrama&text=${this.node.name}`
      openURL(url)
    }
  }
}
</script>
