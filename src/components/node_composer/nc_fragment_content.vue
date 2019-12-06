<style lang="stylus">
</style>
<template lang="pug">
div(
  :style=`{position: 'relative', height: 200+'px',
    borderRadius: '10px', oveflow: 'hidden',
    border: urlInputFocused ? '2px solid #789dff' : '3px solid #eee'}`
    ).row.full-width.items-center.justify-center.bg-grey-2
  q-dialog(:maximized="true" ref="ncComposerWsDialog")
    .row.fit.items-end.content-end
      div(:style=`{maxHeight: $q.screen.height-60+'px', borderRadius: '10px', overflow: 'hidden'}`).column.fit.bg-grey-3
        .col.full-width
          ws-nodes
  div(
    v-if="progressShow && $store.state.events.progress"
    :style=`{
      position: 'absolute', zIndex: 100000, left: 0,
      width: ($store.state.events.progress.progress)+'%',
      height: '100%', opacity: 0.8}`).row.items-center.justify-center.bg-accent
      span(:style=`{fontSize: '30px'}`).text-white {{ $store.state.events.progress.progress }}
  div.row.full-width.q-px-lg
    input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}`)
    q-input(
      ref="urlInput"
      v-model="url" color="accent" invert
      @paste="urlPasted" @focus="urlInputFocused = true" @blur="urlInputFocused = false"
      :loading="urlInputLoading"
      :placeholder="$t('Paste URL or upload a file')"
      :style=`{paddingRight: '10px', paddingLeft: '10px'}`
      :input-style=`{paddingLeft: '0px', paddingRight: '0px'}`).full-width
      template(v-slot:prepend)
        q-btn(v-if="!urlInputLoading && url.length === 0" round flat icon="add")
      template(v-slot:append)
        q-btn(v-if="!urlInputLoading && url.length > 0" round flat icon="clear" @click="url = ''")
        q-btn(v-if="!urlInputLoading && url.length === 0" round flat icon="attachment" @click="$refs.fileInput.click()").rotate-90
</template>

<script>
import wsNodes from 'components/workspace/ws_nodes'
import {fragments} from 'schema/fragments'

export default {
  name: 'ncFragmentContent',
  components: {wsNodes},
  props: ['width'],
  data () {
    return {
      url: '',
      urlInputLoading: false,
      urlInputFocused: false,
      progressShow: false
    }
  },
  watch: {
    url: {
      handler (to, from) {
        this.$log('url CHANGED WATCHER', to)
        this.urlChanged(to)
      }
    }
  },
  methods: {
    async urlPasted (url) {
      this.$log('urlPasted', url)
      await this.$wait(200)
      this.$refs.urlInput.blur()
      // this.urlChanged(url)
    },
    async urlChanged (to) {
      this.$log('url CHANGED', to)
      try {
        let url = new URL(to)
        this.$log('url GOOD', url)
        this.urlInputLoading = true
        let content = await this.contentGet(to, true)
        await this.$wait(500)
        // this.$log('content', content)
        if (content.type === 'VIDEO') {
          if (content.contentSource !== 'KALPA') {
            if (content.duration < 300) {
              // content = await this.contentGet(to, false)
              this.$emit('content', content)
            } else {
              this.$emit('content', content)
            }
          } else {
            this.$emit('content', content)
          }
        } else {
          this.$emit('content', content)
        }
        this.urlInputLoading = false
      } catch (e) {
        this.$log('url WRONG', to)
      }
    },
    async contentGet (url, onlyMeta = true) {
      this.$log('contentGet start')
      if (!onlyMeta) this.progressShow = true
      let {data: {uploadContentUrl: content}} = await this.$apollo.mutate({
        mutation: gql`
          ${fragments.objectFragment}
          mutation nc_uploadContentUrl ($url: String!, $onlyMeta: Boolean!) {
            uploadContentUrl (url: $url, onlyMeta: $onlyMeta) {
              ...objectFragment
            }
          }
        `,
        variables: {
          url: url,
          onlyMeta: onlyMeta
        }
      })
      if (!onlyMeta) {
        this.progressShow = false
      }
      this.$store.commit('events/stateSet', ['progress', null])
      this.$log('contenGet done')
      return content
    },
    fileChanged (e) {
      this.$log('fileChanged', e)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$nextTick(() => {
      this.$refs.urlInput.focus()
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
